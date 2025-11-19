'use server';

import { RoleCategory } from '@prisma/client';
import { z } from 'zod';
import prisma from '@/lib/db';
import { ensureCurrentUserRecord } from '@/lib/clerkUser';
import { canAssignToCategory } from '@/lib/accessControl';

const createProjectSchema = z.object({
  name: z.string().min(3).max(60),
  goal: z.string().max(256).optional(),
  areaId: z.string().optional().nullable(),
  visibleToCategory: z.nativeEnum(RoleCategory),
});

export async function createProjectAction(data: z.infer<typeof createProjectSchema>) {
  const user = await ensureCurrentUserRecord();
  const payload = createProjectSchema.parse(data);

  if (!canAssignToCategory(user, payload.visibleToCategory)) {
    throw new Error('Du kannst kein Projekt für diese Kategorie anlegen.');
  }

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name: payload.name,
      goal: payload.goal ?? undefined,
      areaId: payload.areaId ?? undefined,
      visibleToCategory: payload.visibleToCategory,
    },
  });
  return project;
}

const updateProjectCategorySchema = z.object({
  projectId: z.string().min(1),
  visibleToCategory: z.nativeEnum(RoleCategory),
});

export async function updateProjectCategoryAction(data: z.infer<typeof updateProjectCategorySchema>) {
  const user = await ensureCurrentUserRecord();
  const payload = updateProjectCategorySchema.parse(data);

  const project = await prisma.project.findUnique({
    where: { id: payload.projectId },
    select: { userId: true },
  });

  if (!project) {
    throw new Error('Projekt nicht gefunden.');
  }

  if (!user.isPowerUser && project.userId !== user.id) {
    throw new Error('Nur der Projektinhaber oder ein Power User kann die Rolle ändern.');
  }

  if (!canAssignToCategory(user, payload.visibleToCategory)) {
    throw new Error('Du kannst kein Projekt für diese Kategorie anlegen.');
  }

  return prisma.project.update({
    where: { id: payload.projectId },
    data: { visibleToCategory: payload.visibleToCategory },
  });
}
