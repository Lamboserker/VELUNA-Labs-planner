'use client';

import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';
import { authAppearance } from '../../authAppearance';

const joinStats = [
  { label: 'Onboarding', value: '5 Schritte' },
  { label: 'Team-Energie', value: 'Synchron' },
  { label: 'Automationen', value: 'Live' },
  { label: 'Insights', value: 'Echtzeit' },
];

const joinHighlights = [
  'Sichere Auth via Clerk und moderne SSO',
  'Individuelle Fokusprofile in wenigen Minuten',
  'Projekte, Kalender und Analytics auf einer Leinwand',
];

export default function AuthRegisterPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-purple-500/30 via-fuchsia-500/10 to-transparent blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-16 right-0 h-80 w-80 rounded-full bg-gradient-to-br from-cyan-500/30 via-blue-500/5 to-transparent blur-3xl" />
      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 py-10 lg:flex-row lg:items-stretch">
        <section className="flex flex-1 flex-col justify-between gap-8 rounded-[32px] border border-slate-900/60 bg-gradient-to-br from-slate-900/70 via-slate-950/60 to-slate-950/90 p-8 shadow-[0_35px_80px_rgba(2,6,23,0.85)] backdrop-blur">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-400">
              Persönlicher Planer
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-white">Den Plan in die Tat umsetzen.</h1>
            <p className="text-sm text-slate-400">
              Erstelle ein Konto und verbinde Aufgaben, Projekte und Insights in einem eleganten Arbeitsraum.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {joinStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-800/80 bg-slate-950/60 px-5 py-4 shadow-[0_10px_30px_rgba(2,6,23,0.6)]"
              >
                <p className="text-[0.55rem] uppercase tracking-[0.4em] text-slate-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
          <ul className="space-y-3 text-sm text-slate-400">
            {joinHighlights.map((highlight) => (
              <li key={highlight} className="flex items-center gap-3">
                <span className="inline-flex h-2 w-2 rounded-full bg-cyan-400" aria-hidden />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="flex w-full max-w-md flex-1 flex-col items-center gap-6 rounded-[32px] border border-slate-900/60 bg-slate-950/70 p-8 shadow-[0_35px_80px_rgba(2,6,23,0.75)]">
          <div className="w-full space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-400">Registrieren</p>
            <h2 className="text-3xl font-semibold text-white">Starte dein persönliches Cockpit</h2>
            <p className="text-sm text-slate-500">
              Gib ein paar Details ein und tauche direkt in deine fokussierten Wochenplaene ein.
            </p>
          </div>
          <div className="flex flex-1 items-center justify-center px-3 py-6">
            <div className="min-h-[560px] w-full max-w-[420px]">
              <SignUp
                path="/auth/register"
                routing="path"
                signInUrl="/auth/login"
                afterSignUpUrl="/app/plan"
                appearance={authAppearance}
              />
            </div>
          </div>
          
        </section>
      </main>
    </div>
  );
}
