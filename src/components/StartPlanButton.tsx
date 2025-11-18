'use client';

import { MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function StartPlanButton() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!isLoaded) {
      return;
    }
    router.push(isSignedIn ? '/app/plan' : '/auth/login?redirect=/app/plan');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-lg transition hover:shadow-2xl"
    >
      Jetzt starten
    </button>
  );
}
