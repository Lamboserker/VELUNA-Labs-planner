import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUserId } from '@/lib/clerkUser';
import { refreshGoogleAccessToken } from '@/lib/calendar/google';
import { importCalendarRange } from '@/actions/calendar';

export async function POST() {
  try {
    const userId = await getCurrentUserId();
    const account = await prisma.account.findFirst({
      where: { userId, provider: 'google' },
    });

    if (!account) {
      return NextResponse.json({ error: 'No Google connection' }, { status: 400 });
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const accessTokenExpired = account.expires_at ? account.expires_at < nowSeconds : false;
    let accessToken = account.access_token ?? undefined;

    if ((!accessToken || accessTokenExpired) && account.refresh_token) {
      const refreshed = await refreshGoogleAccessToken(account.refresh_token);
      accessToken = refreshed.accessToken;
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: refreshed.accessToken,
          refresh_token: refreshed.refreshToken ?? account.refresh_token,
          expires_at: refreshed.expiresAt ?? account.expires_at,
          token_type: refreshed.tokenType ?? account.token_type,
          scope: refreshed.scope ?? account.scope,
          id_token: refreshed.idToken ?? account.id_token,
        },
      });
    }

    if (!accessToken) {
      return NextResponse.json({ error: 'Missing Google access token' }, { status: 400 });
    }

    const start = new Date();
    start.setDate(start.getDate() - 30);
    const end = new Date();
    end.setDate(end.getDate() + 120);

    await importCalendarRange({
      accessToken,
      rangeStart: start.toISOString(),
      rangeEnd: end.toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Google calendar sync failed', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
