import { Prisma } from '@prisma/client';
import prisma from './db';
import { UserSettings, WorkingDayPreference } from './planner/types';
import {
  DEFAULT_WORKING_DAYS,
  DEFAULT_WORKING_PREFERENCES,
  WorkingPreferences,
  mergeWorkingDays,
} from './workingPreferencesShared';

export function normalizeWorkingPreferences(raw?: Prisma.JsonValue | null): WorkingPreferences {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_WORKING_PREFERENCES, workingDays: [...DEFAULT_WORKING_DAYS] };
  }

  const parsed = raw as Partial<WorkingPreferences>;
  const slotMinutes =
    typeof parsed.slotMinutes === 'number' && parsed.slotMinutes > 0 ? parsed.slotMinutes : DEFAULT_WORKING_PREFERENCES.slotMinutes;
  const breakMinutes =
    typeof parsed.breakMinutes === 'number' && parsed.breakMinutes > 0 ? parsed.breakMinutes : DEFAULT_WORKING_PREFERENCES.breakMinutes;
  const maxContinuousMinutes =
    typeof parsed.maxContinuousMinutes === 'number' && parsed.maxContinuousMinutes > 0
      ? parsed.maxContinuousMinutes
      : DEFAULT_WORKING_PREFERENCES.maxContinuousMinutes;

  return {
    workingDays: mergeWorkingDays(parsed.workingDays),
    slotMinutes,
    breakMinutes,
    maxContinuousMinutes,
  };
}

export function workingPreferencesToUserSettings(preferences: WorkingPreferences): UserSettings {
  return {
    slotMinutes: preferences.slotMinutes,
    workingDays: mergeWorkingDays(preferences.workingDays),
    breakMinutes: preferences.breakMinutes,
    maxContinuousMinutes: preferences.maxContinuousMinutes,
  };
}

export function resolveWorkingDayForDate(date: Date, workingDays?: WorkingDayPreference[]): WorkingDayPreference | null {
  const dayOfWeek = date.getDay();
  const days = mergeWorkingDays(workingDays);
  const entry = days.find((day) => day.day === dayOfWeek);
  if (!entry || !entry.enabled) {
    return null;
  }
  if (entry.endHour <= entry.startHour) {
    return null;
  }
  return entry;
}

export async function loadWorkingPreferences(userId: string): Promise<WorkingPreferences> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { workingPreferences: true },
  });

  return normalizeWorkingPreferences(user?.workingPreferences ?? null);
}

export async function loadUserPlannerSettings(userId: string): Promise<UserSettings> {
  const preferences = await loadWorkingPreferences(userId);
  return workingPreferencesToUserSettings(preferences);
}

export async function updateWorkingPreferences(userId: string, preferences: WorkingPreferences): Promise<WorkingPreferences> {
  const normalized = normalizeWorkingPreferences(preferences);
  await prisma.user.update({
    where: { id: userId },
    data: { workingPreferences: normalized as Prisma.InputJsonValue },
  });
  return normalized;
}

export { DEFAULT_WORKING_DAYS, DEFAULT_WORKING_PREFERENCES, mergeWorkingDays, WorkingPreferences } from './workingPreferencesShared';
