import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { CalendarBlock, AllocationSource, TaskStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { planDay as runPlanDay } from '@/lib/planner/engine';
import { Allocation, PlannerTask, PlanResult } from '@/lib/planner/types';

const planSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const rangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const toDateKey = (date: Date) => {
  const local = new Date(date);
  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, '0');
  const day = String(local.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

async function getUserIdFromSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    throw new Error('User record not found');
  }
  return user.id;
}

async function getPlannerTasks(userId: string) {
  const tasks = await prisma.task.findMany({
    where: { userId, status: { not: TaskStatus.DONE } },
    orderBy: { priority: 'asc' },
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

async function gatherPlannerData(userId: string, date: string) {
  const plannerTasks = await getPlannerTasks(userId);
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const nextDay = new Date(day);
  nextDay.setDate(day.getDate() + 1);
  const calendarBlocks = await getCalendarBlocksForRange(userId, day, nextDay);
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
  const userId = await getUserIdFromSession();
  const payload = planSchema.parse(input);
  const { plannerTasks, calendarBlocks } = await gatherPlannerData(userId, payload.date);

  const planResult = runPlanDay(payload.date, {
    date: payload.date,
    tasks: plannerTasks,
    calendarBlocks,
  });

  await persistAllocations(planResult.allocations);

  return planResult;
}

export async function replanRange(input: z.infer<typeof rangeSchema>) {
  const payload = rangeSchema.parse(input);
  const userId = await getUserIdFromSession();
  const start = new Date(payload.startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(payload.endDate);
  end.setHours(0, 0, 0, 0);
  if (end.getTime() < start.getTime()) {
    throw new Error('Invalid planning range');
  }

  const plannerTasks = await getPlannerTasks(userId);
  const calendarBlocks = await getCalendarBlocksForRange(
    userId,
    start,
    new Date(end.getTime() + 24 * 60 * 60 * 1000)
  );

  const calendarBlocksByDay = new Map<string, CalendarBlock[]>();
  calendarBlocks.forEach((block) => {
    const key = toDateKey(new Date(block.start));
    const list = calendarBlocksByDay.get(key) ?? [];
    list.push(block);
    calendarBlocksByDay.set(key, list);
  });

  const taskLookup = new Map(plannerTasks.map((task) => [task.id, task]));
  const plans: PlanResult[] = [];

  for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
    const isoDate = toDateKey(current);
    const dayBlocks = calendarBlocksByDay.get(isoDate) ?? [];
    const dayOfWeek = current.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      plans.push({
        date: isoDate,
        slots: [],
        allocations: [],
        tasks: plannerTasks.map((task) => ({ ...task })),
      });
      continue;
    }

    const planResult = runPlanDay(isoDate, {
      date: isoDate,
      tasks: plannerTasks,
      calendarBlocks: dayBlocks,
    });

    planResult.tasks.forEach((task) => {
      const existing = taskLookup.get(task.id);
      if (existing) {
        existing.remainingMin = Math.max(0, task.remainingMin ?? 0);
      }
    });

    // eslint-disable-next-line no-await-in-loop
    await persistAllocations(planResult.allocations);
    plans.push(planResult);
  }

  return { plans };
}

export async function updateCapacity(input: { date: string; hours: number; energy: number }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }
  return { updated: true, info: input };
}
