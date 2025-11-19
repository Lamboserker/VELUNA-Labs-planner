'use client';

import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import { authAppearance } from '../../authAppearance';

const overviewStats = [
  { label: 'Tagesfokus', value: '3 Blocks' },
  { label: 'Verfuegbare Projekte', value: '8' },
  { label: 'Insights', value: 'Echtzeit' },
  { label: 'Energie', value: 'Kontrolliert' },
];

const overviewHighlights = [
  'Fokussierte Blocks, die Rhythmus schaffen',
  'Echtzeit-Sync zwischen Aufgaben, Projekten & Kalender',
  'Analysen, die klare Entscheidungen ermöglichen',
];

export default function AuthLoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute -top-6 right-0 h-64 w-64 translate-x-1/2 rounded-full bg-gradient-to-br from-cyan-500/40 via-blue-500/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-purple-500/30 via-transparent to-transparent blur-[120px]" />
      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 py-10 lg:flex-row lg:items-stretch">
        <section className="flex flex-1 flex-col justify-between gap-8 rounded-[32px] border border-slate-900/60 bg-gradient-to-br from-slate-900/70 via-slate-950/70 to-slate-950/90 p-8 shadow-[0_35px_80px_rgba(2,6,23,0.85)] backdrop-blur">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-400">
              Persönlicher Planer
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-white">
              Klarheit und Fokus für jeden intensiven Tag.
            </h1>
            <p className="text-sm text-slate-400">
              Vereine Aufgaben, Projekte und Kalender in einem eleganten Cockpit und beginne jeden Sprint mit
              strukturierter Ruhe.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {overviewStats.map((stat) => (
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
            {overviewHighlights.map((highlight) => (
              <li key={highlight} className="flex items-center gap-3">
                <span className="inline-flex h-2 w-2 rounded-full bg-cyan-400" aria-hidden />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="flex w-full max-w-md flex-1 flex-col items-center gap-6 rounded-[32px] border border-slate-900/60 bg-slate-950/70 p-8 shadow-[0_35px_80px_rgba(2,6,23,0.75)]">
          <div className="w-full space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-400">Einloggen</p>
            <h2 className="text-3xl font-semibold text-white">Bereit für den nächsten Fokus?</h2>
            <p className="text-sm text-slate-500">
              Melde dich mit deinem Clerk Account an und starte direkt im Cockpit deiner Aufgabenwelt.
            </p>
          </div>
          <div className="flex flex-1 items-center justify-center px-3 py-6">
            <div className="min-h-[560px] w-full max-w-[420px]">
              <SignIn
                path="/auth/login"
                routing="path"
                signUpUrl="/auth/register"
                afterSignInUrl="/app/plan"
                appearance={authAppearance}
              />
            </div>
          </div>
         
        </section>
      </main>
    </div>
  );
}
