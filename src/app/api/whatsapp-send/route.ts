import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppTextMessage } from '@/lib/whatsappClient';

type SendRequest = {
  to?: string;
  message?: string;
};

export async function POST(req: NextRequest) {
  let body: SendRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const to = body.to?.trim();
  const message = body.message?.trim();

  if (!to) {
    return NextResponse.json({ error: 'Recipient (to) is required' }, { status: 400 });
  }

  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  try {
    const result = await sendWhatsAppTextMessage(to, message);
    return NextResponse.json({ delivered: true, recipient: to, result });
  } catch (error) {
    console.error('WhatsApp send endpoint failed', error);
    return NextResponse.json(
      { error: (error as Error).message ?? 'WhatsApp dispatch failed' },
      { status: 500 },
    );
  }
}
