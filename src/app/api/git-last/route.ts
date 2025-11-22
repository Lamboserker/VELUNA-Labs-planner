import { NextResponse } from 'next/server';
import { getLastCommitSummary } from '@/lib/gitActivity';

export async function GET() {
  const summary = getLastCommitSummary();
  return NextResponse.json(summary);
}
