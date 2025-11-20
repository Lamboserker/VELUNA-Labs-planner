import { cookies } from 'next/headers';
import type { Project, User } from '@prisma/client';
import prisma from './db';
import { buildProjectVisibilityWhere } from './accessControl';

const ACTIVE_PROJECT_COOKIE = 'activeProjectId';

type ActiveProjectShape = Pick<Project, 'id' | 'name' | 'visibleToCategory' | 'goal'>;

const setActiveProjectCookie = async (projectId: string) => {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_PROJECT_COOKIE, projectId, {
    path: '/app',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });
};

export async function resolveActiveProject(
  user: Pick<User, 'id' | 'isPowerUser' | 'categories'>
): Promise<ActiveProjectShape | null> {
  const visibility = buildProjectVisibilityWhere(user);
  const cookieStore = await cookies();
  const activeProjectId = cookieStore.get(ACTIVE_PROJECT_COOKIE)?.value;

  if (activeProjectId) {
    const project = await prisma.project.findFirst({
      where: { AND: [{ id: activeProjectId }, visibility] },
      select: { id: true, name: true, visibleToCategory: true, goal: true },
    });
    if (project) {
      return project;
    }
  }

  // Fall back to the first visible project (does not set a cookie to avoid write limits here).
  return prisma.project.findFirst({
    where: visibility,
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, visibleToCategory: true, goal: true },
  });
}

export async function setActiveProjectForUser(
  user: Pick<User, 'id' | 'isPowerUser' | 'categories'>,
  projectId: string
) {
  const visibility = buildProjectVisibilityWhere(user);
  const project = await prisma.project.findFirst({
    where: { AND: [{ id: projectId }, visibility] },
    select: { id: true },
  });

  if (!project) {
    throw new Error('Projekt nicht gefunden oder kein Zugriff.');
  }

  await setActiveProjectCookie(project.id);
  return project.id;
}

export const getActiveProjectIdFromCookies = async () =>
  (await cookies()).get(ACTIVE_PROJECT_COOKIE)?.value ?? null;

export const clearActiveProjectCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_PROJECT_COOKIE, '', {
    path: '/app',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0,
  });
};
