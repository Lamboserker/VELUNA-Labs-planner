'use server';

import { RoleCategory } from '@prisma/client';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { ensureCurrentUserRecord } from '@/lib/clerkUser';
import { canAssignToCategory } from '@/lib/accessControl';
import { clearActiveProjectCookie, getActiveProjectIdFromCookies, setActiveProjectForUser } from '@/lib/activeProject';

const revalidateProjectViews = (projectId?: string) => {
  revalidatePath('/app/projects');
  if (projectId) {
    revalidatePath(`/app/projects/${projectId}`);
  }
  revalidatePath('/app/plan');
  revalidatePath('/app/inbox');
  revalidatePath('/app/analytics');
};

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
  revalidateProjectViews(project.id);
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

  const updated = await prisma.project.update({
    where: { id: payload.projectId },
    data: { visibleToCategory: payload.visibleToCategory },
  });
  revalidateProjectViews(payload.projectId);
  return updated;
}

const setActiveProjectSchema = z.object({
  projectId: z.string().min(1),
});

export async function setActiveProjectAction(data: z.infer<typeof setActiveProjectSchema>) {
  const user = await ensureCurrentUserRecord();
  const payload = setActiveProjectSchema.parse(data);
  const projectId = await setActiveProjectForUser(user, payload.projectId);
  revalidateProjectViews(projectId);
  return { projectId };
}

const deleteProjectSchema = z.object({
  projectId: z.string().min(1),
});

export async function deleteProjectAction(formData: FormData) {
  const user = await ensureCurrentUserRecord();
  const payload = deleteProjectSchema.parse({
    projectId: formData.get('projectId'),
  });

  const project = await prisma.project.findUnique({
    where: { id: payload.projectId },
    select: { userId: true },
  });

  if (!project) {
    throw new Error('Projekt wurde nicht gefunden.');
  }

  if (!user.isPowerUser && project.userId !== user.id) {
    throw new Error('Nur der Projektinhaber oder Power User dürfen löschen.');
  }

  await prisma.$transaction([
    prisma.task.deleteMany({ where: { projectId: payload.projectId } }),
    prisma.project.delete({ where: { id: payload.projectId } }),
  ]);

  const activeProjectId = await getActiveProjectIdFromCookies();
  if (activeProjectId === payload.projectId) {
    await clearActiveProjectCookie();
  }

  revalidateProjectViews(payload.projectId);
  return { deleted: true };
}
