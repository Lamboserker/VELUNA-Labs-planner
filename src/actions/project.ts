'use server';

import { z } from 'zod';
import prisma from '@/lib/db';
import { getCurrentUserId } from '@/lib/clerkUser';

const createProjectSchema = z.object({
  name: z.string().min(3).max(60),
  goal: z.string().max(256).optional(),
  areaId: z.string().optional().nullable(),
});

export async function createProjectAction(data: z.infer<typeof createProjectSchema>) {
  const userId = await getCurrentUserId();
  const payload = createProjectSchema.parse(data);
  const project = await prisma.project.create({
    data: {
      userId,
      name: payload.name,
      goal: payload.goal ?? undefined,
      areaId: payload.areaId ?? undefined,
    },
  });
  return project;
}
