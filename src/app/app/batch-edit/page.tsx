'use client';

import Link from 'next/link';

export default function BatchEditPage() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Batch-Edit</p>
          <h1 className="text-3xl font-semibold text-white">Mehrere Aufgaben gleichzeitig bearbeiten</h1>
        </div>
        <Link
          href="/app/inbox"
          className="rounded-2xl border border-slate-700 px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-slate-500"
        >
          Zurück zur Inbox
        </Link>
      </header>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-[0_25px_40px_rgba(2,6,23,0.8)]">
        <p className="text-sm text-slate-300">
          Die Batch-Bearbeitung erlaubt es dir, mehrere Aufgaben gleichzeitig zu priorisieren, zu markieren und
          Termine zu vergeben. Wähle auf der linken Seite die gewünschten Aufgaben aus und nutze die Controls hier,
          um z. B. Priorität, Energiestufe oder Fälligkeit auf einmal zu ändern.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {['Priorität setzen', 'Fälligkeiten verschieben', 'Energie anpassen'].map((label) => (
            <div key={label} className="rounded-2xl border border-slate-700 bg-slate-950/40 p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">{label}</p>
              <p className="text-xs text-slate-500">Noch frei belegbar</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
