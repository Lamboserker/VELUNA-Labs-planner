export const ROLE_CATEGORIES = ['MARKETING', 'HR', 'IT', 'DEVELOPMENT', 'VERTRIEB'] as const;

export const ROLE_CATEGORY_LABELS: Record<(typeof ROLE_CATEGORIES)[number], string> = {
  MARKETING: 'Marketing',
  HR: 'HR',
  IT: 'IT',
  DEVELOPMENT: 'Entwicklung',
  VERTRIEB: 'Vertrieb',
};

export type RoleCategoryValue = (typeof ROLE_CATEGORIES)[number];
