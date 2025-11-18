'use server';

import { Priority, TaskStatus } from '@prisma/client';
import type { Prisma, RoleCategory, User } from '@prisma/client';
import { z } from 'zod';
import prisma from '@/lib/db';
import { ensureCurrentUserRecord } from '@/lib/clerkUser';
import {
  buildTaskVisibilityWhere,
  canAccessProject,
  userHasCategory,
  isPowerUser,
} from '@/lib/accessControl';

const taskCreateSchema = z.object({
  title: z.string().min(3),
  projectId: z.string().optional(),
  priority: z.nativeEnum(Priority).optional(),
  estimateMin: z.number().int().min(5).optional(),
  energy: z.number().int().min(1).max(3).optional(),
  dueAt: z.string().datetime().optional(),
  description: z.string().max(2000).optional(),
  assignedToUserId: z.string().optional(),
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

async function resolveProjectCategory(projectId: string | undefined, user: User): Promise<RoleCategory | null> {
  if (!projectId) {
    return null;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { visibleToCategory: true },
  });

  if (!project || !canAccessProject(user, project)) {
    throw new Error('Zugriff auf das Projekt verweigert.');
  }

  return project.visibleToCategory;
}

async function resolveAssignee(projectCategory: RoleCategory | null, assigneeId?: string) {
  if (!assigneeId) {
    return undefined;
  }

  if (!projectCategory) {
    throw new Error('Assignee benötigt ein Projekt mit Kategorie.');
  }

  const assignee = await prisma.user.findUnique({
    where: { id: assigneeId },
    select: { id: true, categories: true, isPowerUser: true },
  });

  if (!assignee || !userHasCategory(assignee, projectCategory)) {
    throw new Error('Die gewählte Person kann dieser Kategorie nicht zugewiesen werden.');
  }

  return assignee.id;
}

async function applyTaskAccessUpdate(user: User, taskId: string, data: Prisma.TaskUpdateInput) {
  if (isPowerUser(user)) {
    await prisma.task.update({
      where: { id: taskId },
      data,
    });
    return;
  }

  const result = await prisma.task.updateMany({
    where: { id: taskId, userId: user.id },
    data,
  });

  if (!result.count) {
    throw new Error('Task nicht gefunden oder Zugriff verweigert.');
  }
}

async function createTaskRecord(payload: z.infer<typeof taskCreateSchema> & { userId: string; assignedToUserId?: string }) {
  return prisma.task.create({
    data: {
      userId: payload.userId,
      title: payload.title,
      projectId: payload.projectId ?? undefined,
      priority: payload.priority ?? Priority.P3,
      estimateMin: payload.estimateMin ?? 30,
      energy: payload.energy ?? 2,
      dueAt: payload.dueAt ? new Date(payload.dueAt) : undefined,
      notes: payload.description ?? undefined,
      assignedToUserId: payload.assignedToUserId ?? undefined,
    },
  });
}

export async function createTask(data: z.infer<typeof taskCreateSchema>) {
  const user = await ensureCurrentUserRecord();
  const payload = taskCreateSchema.parse(data);
  const projectCategory = await resolveProjectCategory(payload.projectId, user);
  const assigneeId = await resolveAssignee(projectCategory, payload.assignedToUserId);
  return createTaskRecord({ ...payload, userId: user.id, assignedToUserId: assigneeId });
}

export async function updateTask(data: z.infer<typeof taskUpdateSchema>) {
  const user = await ensureCurrentUserRecord();
  const payload = taskUpdateSchema.parse(data);
  const projectCategory = await resolveProjectCategory(payload.projectId, user);
  const assigneeId = await resolveAssignee(projectCategory, payload.assignedToUserId);
  const updatePayload = {
    title: payload.title,
    projectId: payload.projectId ?? undefined,
    priority: payload.priority,
    estimateMin: payload.estimateMin,
    energy: payload.energy,
    dueAt: payload.dueAt ? new Date(payload.dueAt) : undefined,
    notes: payload.description ?? undefined,
    assignedToUserId: assigneeId ?? null,
  } as Prisma.TaskUpdateInput;

  if (isPowerUser(user)) {
    return prisma.task.update({
      where: { id: payload.id },
      data: updatePayload,
    });
  }

  await applyTaskAccessUpdate(user, payload.id, updatePayload);
  return prisma.task.findUnique({ where: { id: payload.id } });
}

export async function completeTask(data: z.infer<typeof taskCompleteSchema>) {
  const user = await ensureCurrentUserRecord();
  const payload = taskCompleteSchema.parse(data);
  await applyTaskAccessUpdate(user, payload.id, {
    status: TaskStatus.DONE,
  });
  return { success: true };
}

export async function blockTask(data: z.infer<typeof taskBlockSchema>) {
  const user = await ensureCurrentUserRecord();
  const payload = taskBlockSchema.parse(data);
  await applyTaskAccessUpdate(user, payload.id, {
    status: TaskStatus.BLOCKED,
    notes: payload.reason,
  });
  return { success: true };
}

export async function listTasks(filter?: z.infer<typeof listSchema>) {
  const user = await ensureCurrentUserRecord();
  const parsed = listSchema.parse(filter ?? {});
  const visibilityFilter = buildTaskVisibilityWhere(user);
  const whereCondition: Prisma.TaskWhereInput = {
    AND: [visibilityFilter],
  };

  if (parsed.status) {
    whereCondition.status = parsed.status;
  }

  return prisma.task.findMany({
    where: whereCondition,
    include: {
      tags: { include: { tag: true } },
      assignedToUser: { select: { id: true, name: true, email: true } },
    },
    orderBy: {
      dueAt: 'asc',
    },
  });
}

export async function createTaskWithForm(formData: FormData) {
  const title = formData.get('title')?.toString().trim() ?? '';
  const description = formData.get('description')?.toString().trim();
  const priority = (formData.get('priority') as Priority) ?? Priority.P3;
  const estimateMin = Number(formData.get('estimateMin') ?? 30);
  const energy = Number(formData.get('energy') ?? 2);
  const dueAtValue = formData.get('dueAt')?.toString().trim();
  const projectId = formData.get('projectId')?.toString();
  const assignedToUserId = formData.get('assignedToUserId')?.toString();
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
    assignedToUserId: assignedToUserId || undefined,
  });
  const task = await createTask(payload);
  const userId = task.userId;
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
            url: 'data:' + (file.type || 'application/octet-stream') + ';base64,' + base64,
            sizeBytes: arrayBuffer.byteLength,
            mime: file.type || 'application/octet-stream',
          },
        });
      })
  );
  return task;
}

export async function setTaskStatusAction(formData: FormData) {
  const user = await ensureCurrentUserRecord();
  const taskId = formData.get('taskId')?.toString();
  const statusValue = formData.get('status')?.toString();
  if (!taskId || !statusValue) {
    throw new Error('Missing task or status');
  }
  const status = statusSchema.parse(statusValue);
  await applyTaskAccessUpdate(user, taskId, {
    status,
  });
  return { success: true };
}
