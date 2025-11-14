const BASE_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

export interface GoogleCalendarEvent {
  extId: string;
  title: string;
  start: Date;
  end: Date;
}

export interface FetchEventsOptions {
  accessToken: string;
  timeMin: string;
  timeMax: string;
}

export async function fetchGoogleCalendarEvents({ accessToken, timeMin, timeMax }: FetchEventsOptions) {
  const url = new URL(BASE_URL);
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');
  url.searchParams.set('timeMin', timeMin);
  url.searchParams.set('timeMax', timeMax);
  url.searchParams.set('maxResults', '50');

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Calendar fetch failed (${response.status}): ${body}`);
  }

  const payload = (await response.json()) as { items?: Array<Record<string, any>> };
  const items = payload.items ?? [];

  return items
    .map((item) => {
      const startRaw = item.start?.dateTime ?? item.start?.date;
      const endRaw = item.end?.dateTime ?? item.end?.date;

      if (!startRaw || !endRaw) {
        return null;
      }

      const start = new Date(startRaw);
      const end = new Date(endRaw);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return null;
      }

      return {
        extId: item.id,
        title: item.summary ?? 'Kalendertermin',
        start,
        end,
      };
    })
    .filter((event): event is GoogleCalendarEvent => event !== null);
}
