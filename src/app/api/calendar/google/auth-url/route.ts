import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';
import { buildGoogleAuthUrl } from '@/lib/calendar/google';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const state = randomBytes(16).toString('hex');
  const cookieStore = await cookies();
  cookieStore.set('gc_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });

  const url = buildGoogleAuthUrl(state);
  return NextResponse.json({ url });
}
