import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { ensureCurrentUserRecord, getCurrentUserId } from '@/lib/clerkUser';
import {
  exchangeGoogleCodeForTokens,
  fetchGoogleProfile,
} from '@/lib/calendar/google';
import { importCalendarRange } from '@/actions/calendar';

const buildRedirect = (status: 'success' | 'error' = 'success') => {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? 'http://localhost:3000';
  const url = new URL('/app/plan', base);
  url.searchParams.set('calendar', status);
  return NextResponse.redirect(url.toString(), { status: 302 });
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  if (!code || !state) {
    return buildRedirect('error');
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get('gc_state')?.value;
  if (!savedState || savedState !== state) {
    return buildRedirect('error');
  }

  try {
    const userId = await getCurrentUserId();
    await ensureCurrentUserRecord();

    const tokens = await exchangeGoogleCodeForTokens(code);
    const profile = await fetchGoogleProfile(tokens.accessToken);
    const providerAccountId = profile.sub;

    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId,
        },
      },
      create: {
        userId,
        type: 'oauth',
        provider: 'google',
        providerAccountId,
        refresh_token: tokens.refreshToken ?? null,
        access_token: tokens.accessToken,
        expires_at: tokens.expiresAt ?? null,
        token_type: tokens.tokenType ?? null,
        scope: tokens.scope ?? null,
        id_token: tokens.idToken ?? null,
      },
      update: {
        userId,
        refresh_token: tokens.refreshToken ?? null,
        access_token: tokens.accessToken,
        expires_at: tokens.expiresAt ?? null,
        token_type: tokens.tokenType ?? null,
        scope: tokens.scope ?? null,
        id_token: tokens.idToken ?? null,
      },
    });

    const now = new Date();
    const rangeStart = new Date(now);
    rangeStart.setDate(rangeStart.getDate() - 30);
    const rangeEnd = new Date(now);
    rangeEnd.setDate(rangeEnd.getDate() + 120);

    await importCalendarRange({
      accessToken: tokens.accessToken,
      rangeStart: rangeStart.toISOString(),
      rangeEnd: rangeEnd.toISOString(),
    });

    cookieStore.delete('gc_state');
    return buildRedirect('success');
  } catch (error) {
    console.error('Google calendar callback failed', error);
    return buildRedirect('error');
  }
}
