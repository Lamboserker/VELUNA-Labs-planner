import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppTextMessage } from '@/lib/whatsappClient';

export async function GET(_req: NextRequest) {
  const testRecipient = process.env.WABA_TEST_RECIPIENT;

  if (!testRecipient) {
    return NextResponse.json(
      { error: 'Missing WABA_TEST_RECIPIENT' },
      { status: 500 },
    );
  }

  try {
    const message = `WhatsApp Test aus dem Planner (${new Date().toISOString()})`;
    const result = await sendWhatsAppTextMessage(testRecipient, message);

    return NextResponse.json({
      delivered: true,
      recipient: testRecipient,
      result,
    });
  } catch (error) {
    console.error('Test WhatsApp message failed', error);
    return NextResponse.json(
      { error: (error as Error).message ?? 'WhatsApp dispatch failed' },
      { status: 500 },
    );
  }
}
