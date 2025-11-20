'use server';

import { z } from 'zod';
import { ensureCurrentUserRecord } from '@/lib/clerkUser';
import {
  DEFAULT_WORKING_PREFERENCES,
  WorkingPreferences,
  loadWorkingPreferences,
  normalizeWorkingPreferences,
  updateWorkingPreferences,
} from '@/lib/workingPreferences';

const daySchema = z.object({
  day: z.number().int().min(0).max(6),
  enabled: z.boolean(),
  startHour: z.number().min(0).max(24),
  endHour: z.number().min(0).max(24),
});

const preferencesSchema = z.object({
  workingDays: z.array(daySchema),
  slotMinutes: z.number().min(15).max(180).optional(),
});

export async function getWorkingPreferencesAction(): Promise<WorkingPreferences> {
  const user = await ensureCurrentUserRecord();
  if (!user) {
    return { ...DEFAULT_WORKING_PREFERENCES, workingDays: [...DEFAULT_WORKING_PREFERENCES.workingDays] };
  }
  return loadWorkingPreferences(user.id);
}

export async function saveWorkingPreferencesAction(input: unknown): Promise<WorkingPreferences> {
  const user = await ensureCurrentUserRecord();
  const parsed = preferencesSchema.parse(input);

  parsed.workingDays.forEach((day) => {
    if (day.endHour <= day.startHour) {
      throw new Error('Endzeit muss nach der Startzeit liegen.');
    }
  });

  const normalized = normalizeWorkingPreferences({
    workingDays: parsed.workingDays,
    slotMinutes: parsed.slotMinutes,
  });

  return updateWorkingPreferences(user.id, normalized);
}
