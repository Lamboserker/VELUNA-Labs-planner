import { WorkingDayPreference } from './planner/types';

export interface WorkingPreferences {
  workingDays: WorkingDayPreference[];
  slotMinutes?: number;
  breakMinutes?: number;
  maxContinuousMinutes?: number;
}

export const DEFAULT_WORKING_DAYS: WorkingDayPreference[] = [
  { day: 1, startHour: 8, endHour: 17, enabled: true },
  { day: 2, startHour: 8, endHour: 17, enabled: true },
  { day: 3, startHour: 8, endHour: 17, enabled: true },
  { day: 4, startHour: 8, endHour: 17, enabled: true },
  { day: 5, startHour: 8, endHour: 16, enabled: true },
  { day: 6, startHour: 9, endHour: 13, enabled: false },
  { day: 0, startHour: 9, endHour: 13, enabled: false },
];

export const DEFAULT_WORKING_PREFERENCES: WorkingPreferences = {
  workingDays: DEFAULT_WORKING_DAYS,
  slotMinutes: 30,
  breakMinutes: 15,
  maxContinuousMinutes: 180,
};

const clampHour = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return undefined;
  }
  return Math.min(24, Math.max(0, value));
};

const sanitizeDay = (day: WorkingDayPreference | null | undefined): WorkingDayPreference | null => {
  if (!day || typeof day.day !== 'number') return null;
  const startHour = clampHour(day.startHour);
  const endHour = clampHour(day.endHour);
  if (startHour === undefined || endHour === undefined || endHour <= startHour) {
    return null;
  }

  return {
    day: Math.max(0, Math.min(6, Math.trunc(day.day))),
    startHour,
    endHour,
    enabled: Boolean(day.enabled),
  };
};

export const mergeWorkingDays = (days?: WorkingDayPreference[]): WorkingDayPreference[] => {
  const merged = new Map<number, WorkingDayPreference>();
  DEFAULT_WORKING_DAYS.forEach((entry) => merged.set(entry.day, { ...entry }));

  (days ?? []).forEach((entry) => {
    const sanitized = sanitizeDay(entry);
    if (!sanitized) return;
    const base = merged.get(sanitized.day) ?? {
      day: sanitized.day,
      startHour: 8,
      endHour: 17,
      enabled: false,
    };
    merged.set(sanitized.day, { ...base, ...sanitized });
  });

  return Array.from(merged.values()).sort((a, b) => a.day - b.day);
};
