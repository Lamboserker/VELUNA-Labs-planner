'use client';

import { SignIn } from '@clerk/nextjs';

export default function AuthLoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-md space-y-8 rounded-3xl border border-slate-800 bg-slate-900/70 px-8 py-10 shadow-[0_25px_60px_rgba(15,23,42,0.7)]">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">Persönlicher Planer</p>
          <h1 className="text-3xl font-semibold">Einloggen</h1>
          <p className="text-sm text-slate-400">
            Nutze Clerk, um sicher Zugang zu deinem Dashboard zu erhalten. (App Router-kompatibel)
          </p>
        </div>
        <SignIn
          path="/auth/login"
          routing="path"
          signUpUrl="/auth/register"
          afterSignInUrl="/app/plan"
        />
      </div>
    </div>
  );
}
