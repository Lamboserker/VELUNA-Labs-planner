'use server';

import { Priority, TaskStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

const taskCreateSchema = z.object({
  title: z.string().min(3),
  projectId: z.string().optional(),
  priority: z.nativeEnum(Priority).optional(),
  estimateMin: z.number().int().min(5).optional(),
  energy: z.number().int().min(1).max(3).optional(),
  dueAt: z.string().datetime().optional(),
  description: z.string().max(2000).optional(),
});

const taskUpdateSchema = taskCreateSchema.extend({
  id: z.string(),
});

const taskCompleteSchema = z.object({
  id: z.string(),
});

const taskBlockSchema = z.object({
  id: z.string(),
  reason: z.string().min(5),
});

const listSchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
});

const statusSchema = z.nativeEnum(TaskStatus);

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

async function createTaskRecord(payload: z.infer<typeof taskCreateSchema> & { userId: string }) {
  return prisma.task.create({
    data: {
      userId: payload.userId,
      title: payload.title,
      projectId: payload.projectId,
      priority: payload.priority ?? Priority.P3,
      estimateMin: payload.estimateMin ?? 30,
      energy: payload.energy ?? 2,
      dueAt: payload.dueAt ? new Date(payload.dueAt) : undefined,
      notes: payload.description ?? undefined,
    },
  });
}

export async function createTask(data: z.infer<typeof taskCreateSchema>) {
  const userId = await getUserIdFromSession();
  const payload = taskCreateSchema.parse(data);
  return createTaskRecord({ ...payload, userId });
}

export async function updateTask(data: z.infer<typeof taskUpdateSchema>) {
  const userId = await getUserIdFromSession();
  const payload = taskUpdateSchema.parse(data);
  await prisma.task.updateMany({
    where: { id: payload.id, userId },
    data: {
      title: payload.title,
      projectId: payload.projectId,
      priority: payload.priority,
      estimateMin: payload.estimateMin,
      energy: payload.energy,
      dueAt: payload.dueAt ? new Date(payload.dueAt) : undefined,
      notes: payload.description ?? undefined,
    },
  });
  return prisma.task.findUnique({ where: { id: payload.id } });
}

export async function completeTask(data: z.infer<typeof taskCompleteSchema>) {
  const userId = await getUserIdFromSession();
  const payload = taskCompleteSchema.parse(data);
  return prisma.task.updateMany({
    where: { id: payload.id, userId },
    data: {
      status: TaskStatus.DONE,
    },
  });
}

export async function blockTask(data: z.infer<typeof taskBlockSchema>) {
  const userId = await getUserIdFromSession();
  const payload = taskBlockSchema.parse(data);
  return prisma.task.updateMany({
    where: { id: payload.id, userId },
    data: {
      status: TaskStatus.BLOCKED,
      notes: payload.reason,
    },
  });
}

export async function listTasks(filter?: z.infer<typeof listSchema>) {
  const userId = await getUserIdFromSession();
  const parsed = listSchema.parse(filter ?? {});
  return prisma.task.findMany({
    where: {
      userId,
      status: parsed.status,
    },
    orderBy: {
      dueAt: 'asc',
    },
  });
}

export async function createTaskWithForm(formData: FormData) {
  const userId = await getUserIdFromSession();
  const title = formData.get('title')?.toString().trim() ?? '';
  const description = formData.get('description')?.toString().trim();
  const priority = (formData.get('priority') as Priority) ?? Priority.P3;
  const estimateMin = Number(formData.get('estimateMin') ?? 30);
  const energy = Number(formData.get('energy') ?? 2);
  const dueAtValue = formData.get('dueAt')?.toString().trim();
  const projectId = formData.get('projectId')?.toString();
  const dueAtDate = dueAtValue ? new Date(dueAtValue) : undefined;
  const dueAtIso =
    dueAtDate && !Number.isNaN(dueAtDate.getTime()) ? dueAtDate.toISOString() : undefined;
  const payload = taskCreateSchema.parse({
    title,
    priority,
    estimateMin: Number.isNaN(estimateMin) ? 30 : Math.max(5, estimateMin),
    energy: Number.isNaN(energy) ? 2 : Math.min(3, Math.max(1, energy)),
    dueAt: dueAtIso,
    projectId,
    description,
  });
  const task = await createTaskRecord({ ...payload, userId });

  const fileItems = formData.getAll('files');
  await Promise.all(
    fileItems
      .filter((item): item is File => !!item && typeof item !== 'string')
      .map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        await prisma.attachment.create({
          data: {
            taskId: task.id,
            userId,
            name: file.name,
            url: `data:${file.type || 'application/octet-stream'};base64,${base64}`,
            sizeBytes: arrayBuffer.byteLength,
            mime: file.type || 'application/octet-stream',
          },
        });
      })
  );
  return task;
}

export async function setTaskStatusAction(formData: FormData) {
  const userId = await getUserIdFromSession();
  const taskId = formData.get('taskId')?.toString();
  const statusValue = formData.get('status')?.toString();
  if (!taskId || !statusValue) {
    throw new Error('Missing task or status');
  }
  const status = statusSchema.parse(statusValue);
  await prisma.task.updateMany({
    where: { id: taskId, userId },
    data: {
      status,
    },
  });
  return { success: true };
}
