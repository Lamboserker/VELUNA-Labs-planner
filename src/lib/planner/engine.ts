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
  UserSettings,
} from './types';
import { DEFAULT_SCORING, scoreTask } from './scoring';

const DEFAULT_ENERGY_WINDOWS: EnergyWindows = {
  HIGH: [{ start: 9, end: 12 }],
  MED: [{ start: 13, end: 16 }],
  LOW: [{ start: 16, end: 19 }],
};

const DEFAULT_SETTINGS: UserSettings = {
  workStartHour: 8,
  workEndHour: 18,
  slotMinutes: 30,
  bufferPct: 0.15,
  energyWindows: DEFAULT_ENERGY_WINDOWS,
  wipProjectsMax: 3,
};

function resolveSettings(settings?: UserSettings): UserSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    energyWindows: settings?.energyWindows ?? DEFAULT_ENERGY_WINDOWS,
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

export function buildSlots(date: string, userSettings?: UserSettings, calendarBlocks: CalendarBlock[] = []): Slot[] {
  const settings = resolveSettings(userSettings);
  const dayStart = new Date(date);
  dayStart.setHours(settings.workStartHour ?? 8, 0, 0, 0);
  const workEnd = new Date(dayStart);
  workEnd.setHours(settings.workEndHour ?? 18, 0, 0, 0);

  const slotMinutes = settings.slotMinutes ?? 30;
  const totalMinutes = ((settings.workEndHour ?? 18) - (settings.workStartHour ?? 8)) * 60;
  const slotCount = Math.max(1, Math.floor(totalMinutes / slotMinutes));
  const slots: Slot[] = [];
  let focusMinutes = 0;

  const cleanedBlocks = calendarBlocks.map((block) => ({
    id: block.id,
    start: new Date(block.start),
    end: new Date(block.end),
    type: block.type,
  }));

  for (let i = 0; i < slotCount; i += 1) {
    const start = new Date(dayStart.getTime() + i * slotMinutes * 60_000);
    const end = new Date(start.getTime() + slotMinutes * 60_000);
    const hour = hourFromDate(start);
    const energy = getEnergyWindow(hour, settings.energyWindows ?? DEFAULT_ENERGY_WINDOWS);
    const overlappingBlock = cleanedBlocks.find((block) => overlaps(start, end, block.start, block.end));

    const slot: Slot = {
      id: `${date}-slot-${i}`,
      start,
      end,
      energy,
      type: overlappingBlock ? 'meeting' : 'focus',
      availableMinutes: overlappingBlock ? 0 : slotMinutes,
      blockId: overlappingBlock?.id,
    };

    if (slot.type === 'focus') {
      focusMinutes += slotMinutes;
    }
    slots.push(slot);
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

export function pickCandidates(slot: Slot, tasks: PlannerTask[], options: PlanOptions & { lastProject?: string | null }): PlannerTask | null {
  const now = options.now ?? new Date();
  const taskMap = buildTaskMap(tasks);
  const feasible = tasks.filter((task) => {
    if (task.remainingMin <= 0) return false;
    if (task.status === TaskStatus.DONE) return false;
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

  const scored = feasible
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
