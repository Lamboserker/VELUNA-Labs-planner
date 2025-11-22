'use client';

import { MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useUser } from '@clerk/nextjs';

export default function StartPlanButton() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!isLoaded) {
      return;
    }
    const target = (isSignedIn ? '/app/plan' : '/auth/login?redirect=/app/plan') as Route;
    router.push(target);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-lg transition hover:shadow-2xl sm:w-auto sm:px-6"
    >
      Jetzt starten
    </button>
  );
}
