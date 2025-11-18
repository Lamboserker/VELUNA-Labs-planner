'use client';

import { SignUp } from '@clerk/nextjs';

export default function AuthRegisterPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-md space-y-8 rounded-3xl border border-slate-800 bg-slate-900/70 px-8 py-10 shadow-[0_25px_60px_rgba(15,23,42,0.7)]">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">Persönlicher Planer</p>
          <h1 className="text-3xl font-semibold">Registrieren</h1>
          <p className="text-sm text-slate-400">
            Erstelle einen Account, um deine Aufgaben, Projekte und Analytics zu synchronisieren.
          </p>
        </div>
        <SignUp
          path="/auth/register"
          routing="path"
          signInUrl="/auth/login"
          afterSignUpUrl="/app/plan"
        />
      </div>
    </div>
  );
}
