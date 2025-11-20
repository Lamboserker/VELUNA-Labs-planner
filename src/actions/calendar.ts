import { CalendarBlockType } from '@prisma/client';
import { z } from 'zod';
import prisma from '../lib/db';
import { fetchGoogleCalendarEvents } from '../lib/calendar/google';
import { ensureCurrentUserRecord } from '../lib/clerkUser';

const importSchema = z.object({
  accessToken: z.string().min(1),
  rangeStart: z.string(),
  rangeEnd: z.string(),
});

export async function importCalendarRange(input: z.infer<typeof importSchema>) {
  const { accessToken, rangeStart, rangeEnd } = importSchema.parse(input);
  const user = await ensureCurrentUserRecord();

  const events = await fetchGoogleCalendarEvents({
    accessToken,
    timeMin: rangeStart,
    timeMax: rangeEnd,
  });

  const imports = events.map((event) =>
    prisma.calendarBlock.upsert({
      where: { id: `${user.id}-${event.extId}` },
      create: {
        id: `${user.id}-${event.extId}`,
        userId: user.id,
        start: event.start,
        end: event.end,
        type: CalendarBlockType.MEETING,
        extId: event.extId,
        // Persist the actual Google summary (title), or fall back to a neutral label.
        title: event.title?.trim() || 'Kalendertermin',
      },
      update: {
        start: event.start,
        end: event.end,
        type: CalendarBlockType.MEETING,
        extId: event.extId,
        title: event.title?.trim() || 'Kalendertermin',
      },
    })
  );

  await Promise.all(imports);

  return { imported: events.length };
}
