import { auth, clerkClient } from '@clerk/nextjs/server';
import prisma from './db';
import { isPowerUserEmail } from '@/lib/accessControl';

const nameFromClerkUser = (user: { firstName?: string | null; lastName?: string | null }) => {
  const names = [user.firstName?.trim(), user.lastName?.trim()].filter(Boolean);
  return names.join(' ') || null;
};

const emailFromClerkUser = (user: {
  emailAddresses: Array<{ emailAddress: string }>;
  primaryEmailAddress: { emailAddress: string } | null;
}) => {
  return user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
};

export async function ensureCurrentUserRecord() {
  const authState = await auth();
  if (!authState.userId) {
    throw new Error('Unauthorized');
  }

  // clerkClient is already a ready-to-use client instance
  const clerkUser = await clerkClient.users.getUser(authState.userId);
  const email = emailFromClerkUser(clerkUser);
  if (!email) {
    throw new Error('Clerk user missing an email address');
  }

  const isPowerUser = isPowerUserEmail(email);
  const userRecord = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: nameFromClerkUser(clerkUser) ?? undefined,
      image: clerkUser.imageUrl ?? undefined,
      isPowerUser,
    },
    update: {
      name: nameFromClerkUser(clerkUser) ?? undefined,
      image: clerkUser.imageUrl ?? undefined,
      // Always enforce power-user flag for the trusted leadership emails.
      isPowerUser,
    },
  });

  return userRecord;
}

export async function getCurrentUserId() {
  const user = await ensureCurrentUserRecord();
  return user.id;
}

export async function getCurrentUserEmail() {
  const user = await ensureCurrentUserRecord();
  return user.email;
}
