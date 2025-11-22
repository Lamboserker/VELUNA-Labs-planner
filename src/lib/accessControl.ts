import type { Prisma, Project, RoleCategory, User } from '@prisma/client';
import { ROLE_CATEGORIES } from './roleCategories';

export const POWER_USER_EMAILS = [
  'lukaslamberz96@gmail.com',
  'l.lamberz@veluna-labs.de',
].map((email) => email.toLowerCase());

const isAllowedRoleCategory = (value: unknown): value is RoleCategory =>
  typeof value === 'string' && ROLE_CATEGORIES.includes(value as RoleCategory);

export const isPowerUserEmail = (email?: string | null) => {
  if (!email) {
    return false;
  }
  return POWER_USER_EMAILS.includes(email.toLowerCase());
};

// Helper to recognize whether the current session belongs to leadership.
export const isPowerUser = (user?: Pick<User, 'isPowerUser'> | null) => {
  return Boolean(user?.isPowerUser);
};

export const normalizeUserCategories = (categories?: RoleCategory[] | null) => {
  return Array.from(new Set((categories ?? []).filter(isAllowedRoleCategory)));
};

// The guard that keeps normal users limited to their chosen categories.
export const userHasCategory = (user: Pick<User, 'isPowerUser' | 'categories'> | null, category: RoleCategory) => {
  if (isPowerUser(user)) {
    return true;
  }
  return normalizeUserCategories(user?.categories).includes(category);
};

// Builds the Prisma filter that scopes projects to the viewer's categories.
export const buildProjectVisibilityWhere = (
  user: Pick<User, 'isPowerUser' | 'categories'> | null
): Prisma.ProjectWhereInput => {
  if (!user) {
    return {
      visibleToCategory: { in: [] },
    };
  }
  if (isPowerUser(user)) {
    return {};
  }
  const categories = normalizeUserCategories(user.categories);
  return {
    visibleToCategory: {
      in: categories,
    },
  };
};

// Builds the task visibility clause so inbox-only items stay private while projects follow category rules.
// When an active project is present, restrict to that project only.
export const buildTaskVisibilityWhere = (
  user: Pick<User, 'id' | 'isPowerUser' | 'categories'>,
  activeProjectId?: string
): Prisma.TaskWhereInput => {
  if (isPowerUser(user)) {
    return activeProjectId
      ? {
          OR: [
            { projectId: activeProjectId },
            { projectId: null, userId: user.id },
          ],
        }
      : {};
  }
  const categories = normalizeUserCategories(user.categories);
  const categoryFilter: Prisma.TaskWhereInput = {
    project: {
      visibleToCategory: {
        in: categories,
      },
    },
  };

  if (activeProjectId) {
    return {
      AND: [
        {
          OR: [
            { projectId: activeProjectId },
            // Always allow the viewer's own projektlose (Inbox) Tasks.
            { projectId: null, userId: user.id },
          ],
        },
        categoryFilter,
      ],
    };
  }

  return {
    OR: [
      {
        projectId: null,
        userId: user.id,
      },
      categoryFilter,
    ],
  };
};

export const canAccessProject = (
  user: Pick<User, 'isPowerUser' | 'categories'> | null,
  project?: Pick<Project, 'visibleToCategory'> | null
) => {
  if (!project || !user) {
    return false;
  }
  if (isPowerUser(user)) {
    return true;
  }
  return normalizeUserCategories(user.categories).includes(project.visibleToCategory);
};

export const canAssignToCategory = (user: Pick<User, 'isPowerUser' | 'categories'> | null, category: RoleCategory) => {
  if (isPowerUser(user)) {
    return true;
  }
  return normalizeUserCategories(user?.categories).includes(category);
};

export const assignableUsersWhere = (category: RoleCategory): Prisma.UserWhereInput => ({
  OR: [
    { isPowerUser: true },
    {
      categories: {
        has: category,
      },
    },
  ],
});

export { ROLE_CATEGORIES };
