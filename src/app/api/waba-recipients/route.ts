import { NextResponse } from 'next/server';

type Recipient = { id: string; label: string; number: string };

export async function GET() {
  const recipients: Recipient[] = [];

  const dev = process.env.WABA_DEV_TARGET;
  const test = process.env.WABA_TEST_RECIPIENT;
  const legacyTest = process.env.WABA_TEST_RECIPIENT_PHONE_NUMBER;

  if (dev) {
    recipients.push({ id: 'dev', label: 'Dev Target', number: dev });
  }
  if (test) {
    recipients.push({ id: 'test', label: 'Test Recipient', number: test });
  }
  if (legacyTest && legacyTest !== test) {
    recipients.push({ id: 'legacy-test', label: 'Legacy Test', number: legacyTest });
  }

  return NextResponse.json({ recipients });
}
