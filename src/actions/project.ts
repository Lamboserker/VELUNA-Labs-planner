'use server';

import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

const createProjectSchema = z.object({
  name: z.string().min(3).max(60),
  goal: z.string().max(256).optional(),
  areaId: z.string().optional().nullable(),
});

async function getUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    throw new Error('User not found');
  }
  return user.id;
}

export async function createProjectAction(data: z.infer<typeof createProjectSchema>) {
  const userId = await getUserId();
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
