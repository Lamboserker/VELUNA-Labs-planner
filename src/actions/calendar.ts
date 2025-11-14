import { CalendarBlockType } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../lib/auth';
import prisma from '../lib/db';
import { fetchGoogleCalendarEvents } from '../lib/calendar/google';

const importSchema = z.object({
  accessToken: z.string().min(1),
  rangeStart: z.string(),
  rangeEnd: z.string(),
});

export async function importCalendarRange(input: z.infer<typeof importSchema>) {
  const { accessToken, rangeStart, rangeEnd } = importSchema.parse(input);
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    throw new Error('User record not found');
  }

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
      },
      update: {
        start: event.start,
        end: event.end,
        type: CalendarBlockType.MEETING,
        extId: event.extId,
      },
    })
  );

  await Promise.all(imports);

  return { imported: events.length };
}
