'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function AuthRedirectHandler() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    const returnBackUrl = searchParams.get('returnBackUrl') ?? '/app';
    if (`${router.pathname}` === returnBackUrl) {
      return;
    }
    router.replace(returnBackUrl);
  }, [isLoaded, isSignedIn, router, searchParams]);

  return null;
}
