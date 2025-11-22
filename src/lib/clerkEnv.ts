const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const secretKey = process.env.CLERK_SECRET_KEY;

const isTestKey = (value?: string) => (value ?? '').includes('_test_');
const isProdRuntime = process.env.NODE_ENV === 'production' && process.env.CI !== 'true';

if (!publishableKey) {
  throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
}

// Enforce live keys when the app runs in production (but allow CI builds to pass).
if (isProdRuntime && isTestKey(publishableKey)) {
  throw new Error('Clerk publishable key is a test key. Provide the live (production) publishable key.');
}

if (!secretKey) {
  throw new Error('Missing CLERK_SECRET_KEY');
}

if (isProdRuntime && isTestKey(secretKey)) {
  throw new Error('Clerk secret key is a test key. Provide the live (production) secret key.');
}

export const clerkPublishableKey = publishableKey;
