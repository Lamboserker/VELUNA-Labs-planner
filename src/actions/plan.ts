import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { AllocationSource, TaskStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { planDay as runPlanDay } from '@/lib/planner/engine';
import { PlannerTask } from '@/lib/planner/types';

const planSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const rangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

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

async function gatherPlannerData(userId: string, date: string) {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const nextDay = new Date(day);
  nextDay.setDate(day.getDate() + 1);

  const tasks = await prisma.task.findMany({
    where: { userId, status: { not: TaskStatus.DONE } },
    orderBy: { priority: 'asc' },
  });

  const plannerTasks: PlannerTask[] = tasks.map((task) => ({
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

  const calendarBlocks = await prisma.calendarBlock.findMany({
    where: {
      userId,
      start: {
        gte: day,
      },
      end: {
        lt: nextDay,
      },
    },
  });

  return { plannerTasks, calendarBlocks };
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

  await Promise.all(
    planResult.allocations.map((allocation) =>
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

  return planResult;
}

export async function replanRange(input: z.infer<typeof rangeSchema>) {
  const payload = rangeSchema.parse(input);
  const start = new Date(payload.startDate);
  const end = new Date(payload.endDate);
  const results = [];

  for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
    const isoDate = current.toISOString().slice(0, 10);
    // eslint-disable-next-line no-await-in-loop
    const result = await planDayAction({ date: isoDate });
    results.push(result);
  }

  return { plans: results };
}

export async function updateCapacity(input: { date: string; hours: number; energy: number }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }
  return { updated: true, info: input };
}
