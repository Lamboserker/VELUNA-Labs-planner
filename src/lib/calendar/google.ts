const EVENTS_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

const BASE_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';

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
  const url = new URL(EVENTS_URL);
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

const requiredEnv = (primaryKey: string, fallbackKey?: string) => {
  const value = process.env[primaryKey] ?? (fallbackKey ? process.env[fallbackKey] : undefined);
  if (!value) {
    throw new Error(
      `Missing environment variable: ${primaryKey}${fallbackKey ? ` (or ${fallbackKey})` : ''}`
    );
  }
  return value;
};

const appBaseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? 'http://localhost:3000';

const redirectUri = () => `${appBaseUrl().replace(/\/$/, '')}/api/calendar/google/callback`;

export const buildGoogleAuthUrl = (state: string) => {
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set(
    'client_id',
    requiredEnv('GOOGLE_CALENDAR_CLIENT_ID', 'GOOGLE_CLIENT_ID')
  );
  url.searchParams.set('redirect_uri', redirectUri());
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', BASE_SCOPE);
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('include_granted_scopes', 'true');
  url.searchParams.set('state', state);
  return url.toString();
};

export type GoogleTokens = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  scope?: string;
  tokenType?: string;
  idToken?: string;
};

export const exchangeGoogleCodeForTokens = async (code: string): Promise<GoogleTokens> => {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: requiredEnv('GOOGLE_CALENDAR_CLIENT_ID', 'GOOGLE_CLIENT_ID'),
      client_secret: requiredEnv('GOOGLE_CALENDAR_CLIENT_SECRET', 'GOOGLE_CLIENT_SECRET'),
      redirect_uri: redirectUri(),
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
    token_type?: string;
    id_token?: string;
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in ? Math.floor(Date.now() / 1000) + data.expires_in : undefined,
    scope: data.scope,
    tokenType: data.token_type,
    idToken: data.id_token,
  };
};

export const refreshGoogleAccessToken = async (refreshToken: string): Promise<GoogleTokens> => {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: requiredEnv('GOOGLE_CALENDAR_CLIENT_ID', 'GOOGLE_CLIENT_ID'),
      client_secret: requiredEnv('GOOGLE_CALENDAR_CLIENT_SECRET', 'GOOGLE_CLIENT_SECRET'),
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token refresh failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in?: number;
    scope?: string;
    token_type?: string;
    id_token?: string;
  };

  return {
    accessToken: data.access_token,
    refreshToken,
    expiresAt: data.expires_in ? Math.floor(Date.now() / 1000) + data.expires_in : undefined,
    scope: data.scope,
    tokenType: data.token_type,
    idToken: data.id_token,
  };
};

export type GoogleProfile = { sub: string; email?: string | null };

export const fetchGoogleProfile = async (accessToken: string): Promise<GoogleProfile> => {
  const res = await fetch(USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to load Google profile (${res.status}): ${text}`);
  }

  const payload = (await res.json()) as { sub: string; email?: string };
  return { sub: payload.sub, email: payload.email };
};

export const googleRedirectUri = redirectUri;
