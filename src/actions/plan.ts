import { z } from 'zod';
import { CalendarBlock, AllocationSource, TaskStatus, type User } from '@prisma/client';
import prisma from '@/lib/db';
import { planDay as runPlanDay } from '@/lib/planner/engine';
import { Allocation, PlannerTask, PlanResult } from '@/lib/planner/types';
import { ensureCurrentUserRecord } from '@/lib/clerkUser';
import { resolveActiveProject } from '@/lib/activeProject';
import { buildTaskVisibilityWhere } from '@/lib/accessControl';
import { loadUserPlannerSettings, resolveWorkingDayForDate } from '@/lib/workingPreferences';

const planSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const rangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const DEFAULT_TIME_ZONE = 'Europe/Berlin';

const toDateKeyInTimeZone = (date: Date, timeZone: string) => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
};

const startOfDayInTimeZone = (value: Date, timeZone: string) => {
  const key = toDateKeyInTimeZone(value, timeZone);
  return new Date(`${key}T00:00:00Z`);
};

async function getPlannerTasks(user: User, activeProjectId?: string) {
  const tasks = await prisma.task.findMany({
    where: {
      AND: [
        buildTaskVisibilityWhere(user, activeProjectId),
        {
          status: {
            notIn: [TaskStatus.DONE, TaskStatus.BLOCKED, TaskStatus.DEFERRED],
          },
        },
      ],
    },
    orderBy: { priority: 'asc' },
    include: {
      project: {
        select: { visibleToCategory: true },
      },
    },
  });

  return tasks.map<PlannerTask>((task) => ({
    id: task.id,
    title: task.title,
    projectId: task.projectId,
    status: task.status,
    priority: task.priority,
    estimateMin: task.estimateMin,
    energy: task.energy,
    dueAt: task.dueAt ?? undefined,
    dueStart: task.dueStart ?? undefined,
    hardDeadline: task.hardDeadline,
    blockedBy: task.blockedBy ?? [],
    score: task.score ?? 0,
    remainingMin: task.estimateMin ?? 0,
    projectCategory: task.project?.visibleToCategory ?? null,
    assignedToUserId: task.assignedToUserId ?? null,
  }));
}

async function getCalendarBlocksForRange(userId: string, start: Date, end: Date) {
  return prisma.calendarBlock.findMany({
    where: {
      userId,
      start: {
        lt: end,
      },
      end: {
        gte: start,
      },
    },
    orderBy: {
      start: 'asc',
    },
  });
}

async function gatherPlannerData(user: User, date: string, activeProjectId?: string) {
  const plannerTasks = await getPlannerTasks(user, activeProjectId);
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const nextDay = new Date(day);
  nextDay.setDate(day.getDate() + 1);
  const calendarBlocks = await getCalendarBlocksForRange(user.id, day, nextDay);
  return { plannerTasks, calendarBlocks };
}

async function persistAllocations(allocations: Allocation[]) {
  await Promise.all(
    allocations.map((allocation) =>
      prisma.allocation.upsert({
        where: { id: allocation.id },
        create: {
          id: allocation.id,
          taskId: allocation.taskId,
          start: allocation.start,
          end: allocation.end,
          source: AllocationSource.PLANNER,
        },
        update: {
          start: allocation.start,
          end: allocation.end,
        },
      })
    )
  );
}

export async function planDayAction(input: z.infer<typeof planSchema>) {
  const payload = planSchema.parse(input);
  const user = await ensureCurrentUserRecord();
  const timeZone = user.tz || DEFAULT_TIME_ZONE;
  const today = startOfDayInTimeZone(new Date(), timeZone);
  const requestedDate = new Date(payload.date);
  requestedDate.setHours(0, 0, 0, 0);
  const effectiveDate = requestedDate.getTime() < today.getTime() ? today : requestedDate;
  const dateKey = toDateKeyInTimeZone(effectiveDate, timeZone);
  const activeProject = await resolveActiveProject(user);
  if (!activeProject) {
    return {
      date: dateKey,
      slots: [],
      allocations: [],
      tasks: [],
    };
  }
  const userSettings = await loadUserPlannerSettings(user.id);
  const { plannerTasks, calendarBlocks } = await gatherPlannerData(user, dateKey, activeProject.id);

  const workingDay = resolveWorkingDayForDate(new Date(dateKey), userSettings.workingDays);
  if (!workingDay) {
    return {
      date: dateKey,
      slots: [],
      allocations: [],
      tasks: plannerTasks,
    };
  }

  const planResult = runPlanDay(dateKey, {
    date: dateKey,
    tasks: plannerTasks,
    calendarBlocks,
    userSettings,
  });

  await persistAllocations(planResult.allocations);

  return planResult;
}

export async function replanRange(input: z.infer<typeof rangeSchema>) {
  const payload = rangeSchema.parse(input);
  const user = await ensureCurrentUserRecord();
  const timeZone = user.tz || DEFAULT_TIME_ZONE;
  const today = startOfDayInTimeZone(new Date(), timeZone);
  const activeProject = await resolveActiveProject(user);
  if (!activeProject) {
    return { plans: [] };
  }
  const userSettings = await loadUserPlannerSettings(user.id);
  const start = new Date(payload.startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(payload.endDate);
  end.setHours(0, 0, 0, 0);
  if (end.getTime() < start.getTime()) {
    throw new Error('Invalid planning range');
  }

  const plannerTasks = await getPlannerTasks(user, activeProject.id);
  const calendarBlocks = await getCalendarBlocksForRange(
    user.id,
    start,
    new Date(end.getTime() + 24 * 60 * 60 * 1000)
  );

  const calendarBlocksByDay = new Map<string, CalendarBlock[]>();
  calendarBlocks.forEach((block) => {
    const start = new Date(block.start);
    const key = toDateKeyInTimeZone(start, timeZone);
    const list = calendarBlocksByDay.get(key) ?? [];
    list.push(block);
    calendarBlocksByDay.set(key, list);
  });

  const taskRemaining = new Map(
    plannerTasks.map((task) => [task.id, task.remainingMin ?? task.estimateMin ?? 0])
  );
  const plans: PlanResult[] = [];

  for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
    current.setHours(0, 0, 0, 0);
    const isoDate = toDateKeyInTimeZone(current, timeZone);
    const dayBlocks = calendarBlocksByDay.get(isoDate) ?? [];
    const isBeforeToday = current.getTime() < today.getTime();
    const baseTasksForDay = plannerTasks.map((task) => ({
      ...task,
      remainingMin: taskRemaining.get(task.id) ?? task.remainingMin ?? task.estimateMin ?? 0,
    }));
    const workingDay = resolveWorkingDayForDate(current, userSettings.workingDays);

    if (!workingDay || isBeforeToday) {
      plans.push({
        date: isoDate,
        slots: [],
        allocations: [],
        tasks: baseTasksForDay,
      });
      continue;
    }

    const planResult = runPlanDay(isoDate, {
      date: isoDate,
      tasks: baseTasksForDay,
      calendarBlocks: dayBlocks,
      userSettings,
    });

    planResult.tasks.forEach((task) => {
      const remainingMinutes = Math.max(0, task.remainingMin ?? 0);
      taskRemaining.set(task.id, remainingMinutes);
    });

    // eslint-disable-next-line no-await-in-loop
    await persistAllocations(planResult.allocations);
    plans.push(planResult);
  }

  return { plans };
}

export async function updateCapacity(input: { date: string; hours: number; energy: number }) {
  await ensureCurrentUserRecord();
  return { updated: true, info: input };
}
