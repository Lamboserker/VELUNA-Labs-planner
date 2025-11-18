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
