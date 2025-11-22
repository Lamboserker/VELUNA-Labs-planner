const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const secretKey = process.env.CLERK_SECRET_KEY;

const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? process.env.VERCEL_ENV ?? 'development';
const isTestKey = (value?: string) => (value ?? '').includes('_test_');
const allowTestKeys =
  process.env.CLERK_ALLOW_TEST_KEYS === 'true' ||
  process.env.CI === 'true' ||
  ['development', 'preview', 'test'].includes(appEnv);
const enforceLiveKeys = ['production', 'prod'].includes(appEnv) && !allowTestKeys;

if (!publishableKey) {
  throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
}

// Enforce live keys when the app runs in production (but allow CI builds to pass).
if (enforceLiveKeys && isTestKey(publishableKey)) {
  throw new Error('Clerk publishable key is a test key. Provide the live (production) publishable key.');
}

if (!secretKey) {
  throw new Error('Missing CLERK_SECRET_KEY');
}

if (enforceLiveKeys && isTestKey(secretKey)) {
  throw new Error('Clerk secret key is a test key. Provide the live (production) secret key.');
}

export const clerkPublishableKey = publishableKey;
