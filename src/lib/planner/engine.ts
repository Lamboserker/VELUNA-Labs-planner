import { CalendarBlock, TaskStatus } from '@prisma/client';
import {
  Allocation,
  EnergyWindow,
  EnergyWindows,
  PlanOptions,
  PlanResult,
  PlannerTask,
  ScoreContext,
  Slot,
  SlotType,
  WorkingDayPreference,
  UserSettings,
} from './types';
import { DEFAULT_SCORING, scoreTask } from './scoring';

const DEFAULT_ENERGY_WINDOWS: EnergyWindows = {
  HIGH: [{ start: 9, end: 12 }],
  MED: [{ start: 13, end: 16 }],
  LOW: [{ start: 16, end: 19 }],
};

const DEFAULT_WORKING_DAYS: WorkingDayPreference[] = [
  { day: 1, startHour: 8, endHour: 17, enabled: true },
  { day: 2, startHour: 8, endHour: 17, enabled: true },
  { day: 3, startHour: 8, endHour: 17, enabled: true },
  { day: 4, startHour: 8, endHour: 17, enabled: true },
  { day: 5, startHour: 8, endHour: 16, enabled: true },
  { day: 6, startHour: 9, endHour: 13, enabled: false },
  { day: 0, startHour: 9, endHour: 13, enabled: false },
];

const DEFAULT_SETTINGS: UserSettings = {
  workStartHour: 8,
  workEndHour: 18,
  slotMinutes: 30,
  bufferPct: 0.15,
  energyWindows: DEFAULT_ENERGY_WINDOWS,
  wipProjectsMax: 3,
  workingDays: DEFAULT_WORKING_DAYS,
  maxContinuousMinutes: 180,
  breakMinutes: 15,
};

function mergeWorkingDays(settings?: WorkingDayPreference[]): WorkingDayPreference[] {
  const merged = new Map<number, WorkingDayPreference>();
  DEFAULT_WORKING_DAYS.forEach((entry) => merged.set(entry.day, { ...entry }));
  (settings ?? []).forEach((entry) => {
    if (typeof entry.day !== 'number') {
      return;
    }
    const day = Math.max(0, Math.min(6, Math.trunc(entry.day)));
    const startHour = typeof entry.startHour === 'number' ? Math.min(24, Math.max(0, entry.startHour)) : undefined;
    const endHour = typeof entry.endHour === 'number' ? Math.min(24, Math.max(0, entry.endHour)) : undefined;
    if (startHour === undefined || endHour === undefined || endHour <= startHour) {
      return;
    }
    const base = merged.get(day) ?? { day, startHour: 8, endHour: 17, enabled: true };
    merged.set(day, {
      ...base,
      startHour,
      endHour,
      enabled: entry.enabled ?? base.enabled,
    });
  });

  return Array.from(merged.values()).sort((a, b) => a.day - b.day);
}

function resolveSettings(settings?: UserSettings): UserSettings {
  const mergedDays = mergeWorkingDays(settings?.workingDays);
  const overrideStart = settings?.workStartHour;
  const overrideEnd = settings?.workEndHour;
  const workingDays =
    overrideStart !== undefined || overrideEnd !== undefined
      ? mergedDays.map((day) => ({
          ...day,
          startHour: overrideStart ?? day.startHour,
          endHour: overrideEnd ?? day.endHour,
        }))
      : mergedDays;

  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    energyWindows: settings?.energyWindows ?? DEFAULT_ENERGY_WINDOWS,
    workingDays,
    maxContinuousMinutes: settings?.maxContinuousMinutes ?? DEFAULT_SETTINGS.maxContinuousMinutes,
    breakMinutes: settings?.breakMinutes ?? DEFAULT_SETTINGS.breakMinutes,
  };
}

function hourFromDate(date: Date): number {
  return date.getHours() + date.getMinutes() / 60;
}

function getEnergyWindow(hour: number, windows: EnergyWindows): EnergyWindow {
  const windowEntries = Object.entries(windows) as [EnergyWindow, EnergyWindows[EnergyWindow]][];
  for (const [key, ranges] of windowEntries) {
    for (const range of ranges) {
      if (hour >= range.start && hour < range.end) {
        return key;
      }
    }
  }
  return 'MED';
}

function overlaps(slotStart: Date, slotEnd: Date, blockStart: Date, blockEnd: Date): boolean {
  return slotStart < blockEnd && blockStart < slotEnd;
}

function hourToTimeParts(hour: number): { hours: number; minutes: number } {
  const clamped = Math.min(24, Math.max(0, hour));
  const wholeHours = Math.floor(clamped);
  const minutes = Math.round((clamped - wholeHours) * 60);
  return { hours: wholeHours, minutes };
}

function resolveWorkingWindow(date: Date, settings: UserSettings): { start: Date; end: Date } | null {
  const dayEntry = (settings.workingDays ?? DEFAULT_WORKING_DAYS).find(
    (entry) => entry.day === date.getDay()
  );
  if (!dayEntry || !dayEntry.enabled || dayEntry.endHour <= dayEntry.startHour) {
    return null;
  }

  const startParts = hourToTimeParts(dayEntry.startHour);
  const endParts = hourToTimeParts(dayEntry.endHour);
  const start = new Date(date);
  start.setHours(startParts.hours, startParts.minutes, 0, 0);
  const end = new Date(date);
  end.setHours(endParts.hours, endParts.minutes, 0, 0);

  return { start, end };
}

export function buildSlots(date: string, userSettings?: UserSettings, calendarBlocks: CalendarBlock[] = []): Slot[] {
  const settings = resolveSettings(userSettings);
  const day = new Date(date);
  const workingWindow = resolveWorkingWindow(day, settings);
  if (!workingWindow) {
    return [];
  }

  const dayStart = workingWindow.start;
  const workEnd = workingWindow.end;

  const slotMinutes = settings.slotMinutes ?? 30;
  const slots: Slot[] = [];
  let focusMinutes = 0;
  let focusStreakMinutes = 0;

  const cleanedBlocks = calendarBlocks.map((block) => ({
    id: block.id,
    start: new Date(block.start),
    end: new Date(block.end),
    type: block.type,
  }));

  let cursor = new Date(dayStart);
  const breakMinutes = settings.breakMinutes ?? 15;
  const maxStreak = settings.maxContinuousMinutes ?? 180;

  while (cursor < workEnd) {
    if (focusStreakMinutes >= maxStreak) {
      const breakEnd = new Date(Math.min(workEnd.getTime(), cursor.getTime() + breakMinutes * 60_000));
      slots.push({
        id: `${date}-break-${slots.length}`,
        start: new Date(cursor),
        end: breakEnd,
        energy: 'LOW',
        type: 'break',
        availableMinutes: 0,
      });
      cursor = breakEnd;
      focusStreakMinutes = 0;
      continue;
    }

    const start = new Date(cursor);
    const nextEndMillis = start.getTime() + slotMinutes * 60_000;
    const end = new Date(Math.min(workEnd.getTime(), nextEndMillis));
    const hour = hourFromDate(start);
    const energy = getEnergyWindow(hour, settings.energyWindows ?? DEFAULT_ENERGY_WINDOWS);
    const overlappingBlock = cleanedBlocks.find((block) => overlaps(start, end, block.start, block.end));
    const slotLengthMinutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000));

    const slot: Slot = {
      id: `${date}-slot-${slots.length}`,
      start,
      end,
      energy,
      type: overlappingBlock ? 'meeting' : 'focus',
      availableMinutes: overlappingBlock ? 0 : slotLengthMinutes,
      blockId: overlappingBlock?.id,
    };

    if (slot.type === 'focus') {
      focusMinutes += slotLengthMinutes;
      focusStreakMinutes += slotLengthMinutes;
    } else {
      focusStreakMinutes = 0;
    }
    slots.push(slot);

    cursor = end;
  }

  const bufferPct = settings.bufferPct ?? 0.15;
  const bufferMinutes = Math.max(0, Math.round(focusMinutes * bufferPct));
  if (bufferMinutes > 0) {
    const bufferStart = new Date(workEnd);
    const bufferEnd = new Date(bufferStart.getTime() + bufferMinutes * 60_000);
    slots.push({
      id: `${date}-buffer`,
      start: bufferStart,
      end: bufferEnd,
      energy: 'LOW',
      type: 'buffer',
      availableMinutes: bufferMinutes,
    });
  }

  return slots;
}

function buildTaskMap(tasks: PlannerTask[]): Map<string, PlannerTask> {
  return new Map(tasks.map((task) => [task.id, task]));
}

const isTestTask = (task: PlannerTask): boolean => /^test(?:en|ing)?$/i.test(task.title.trim());

export function pickCandidates(slot: Slot, tasks: PlannerTask[], options: PlanOptions & { lastProject?: string | null }): PlannerTask | null {
  const now = options.now ?? new Date();
  const taskMap = buildTaskMap(tasks);
  const feasible = tasks.filter((task) => {
    if (task.remainingMin <= 0) return false;
    if (task.status === TaskStatus.DONE || task.status === TaskStatus.BLOCKED || task.status === TaskStatus.DEFERRED) {
      return false;
    }
    if (task.blockedBy?.some((blockedId) => {
      const blocker = taskMap.get(blockedId);
      return blocker ? blocker.remainingMin > 0 : true;
    })) {
      return false;
    }
    return true;
  });

  if (!feasible.length) {
    return null;
  }

  const nonTestTasks = feasible.filter((task) => !isTestTask(task));
  const testTasks = feasible.filter(isTestTask);
  const candidatePool = nonTestTasks.length ? nonTestTasks : testTasks;

  // For IT projects, only consider one active task per assignee at a time.
  const itAssigneePick = new Map<string, PlannerTask>();
  const filteredFeasible = candidatePool.filter((task) => {
    if (task.projectCategory !== 'IT') {
      return true;
    }
    const assignee = task.assignedToUserId ?? 'unassigned';
    const existing = itAssigneePick.get(assignee);
    if (!existing) {
      itAssigneePick.set(assignee, task);
      return true;
    }
    const currentWeight = scoreTask(existing, { slot, lastProject: options.lastProject ?? null, now }, options.scoringConfig ?? DEFAULT_SCORING);
    const incomingWeight = scoreTask(task, { slot, lastProject: options.lastProject ?? null, now }, options.scoringConfig ?? DEFAULT_SCORING);
    if (incomingWeight > currentWeight) {
      itAssigneePick.set(assignee, task);
    }
    return false;
  });

  const scored = filteredFeasible
    .map((task) => ({
      task,
      score: scoreTask(task, { slot, lastProject: options.lastProject ?? null, now }, options.scoringConfig ?? DEFAULT_SCORING),
    }))
    .sort((a, b) => b.score - a.score);

  return scored[0].task ?? null;
}

export function allocate(tasks: PlannerTask[], slots: Slot[], options: PlanOptions): Allocation[] {
  const allocations: Allocation[] = [];
  const now = options.now ?? new Date();
  let lastProject = options.lastProject ?? null;
  const wipLimit = options.userSettings?.wipProjectsMax ?? DEFAULT_SETTINGS.wipProjectsMax;
  const activeProjects = new Set<string>();

  for (const slot of slots) {
    if (slot.availableMinutes <= 0 || slot.type !== 'focus') {
      continue;
    }

    const candidate = pickCandidates(slot, tasks, { ...options, now, lastProject });
    if (!candidate) {
      continue;
    }

    if (
      wipLimit &&
      candidate.projectId &&
      !activeProjects.has(candidate.projectId) &&
      activeProjects.size >= wipLimit
    ) {
      continue;
    }

    const minutes = Math.min(slot.availableMinutes, candidate.remainingMin);
    const allocation: Allocation = {
      id: `${slot.id}-${candidate.id}-${allocations.length}`,
      taskId: candidate.id,
      slotId: slot.id,
      start: slot.start,
      end: new Date(slot.start.getTime() + minutes * 60_000),
      minutes,
      source: 'planner',
    };

    slot.availableMinutes -= minutes;
    candidate.remainingMin -= minutes;
    lastProject = candidate.projectId ?? lastProject;
    if (candidate.projectId) {
      activeProjects.add(candidate.projectId);
    }
    allocations.push(allocation);
  }

  return allocations;
}

export function planDay(date: string, options: PlanOptions): PlanResult {
  const tasks = options.tasks.map((task) => ({
    ...task,
    remainingMin: task.remainingMin ?? task.estimateMin ?? 0,
  }));
  const slots = buildSlots(date, options.userSettings, options.calendarBlocks ?? []);
  const allocations = allocate(tasks, slots, options);

  return {
    date,
    slots,
    allocations,
    tasks,
  };
}
