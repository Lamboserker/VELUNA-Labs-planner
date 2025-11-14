import Link from 'next/link';

const metrics = [
  { label: 'Fokuszeit', value: '11 Tasks', sub: 'In Arbeit' },
  { label: 'Insights', value: '8%', sub: 'Erledigt' },
  { label: 'Deadlines', value: '4', sub: 'Diese Woche' },
];

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-white">
      <div className="mx-auto grid max-w-6xl gap-10">
        <section className="rounded-2xl bg-gradient-to-br from-slate-900/60 via-indigo-900/70 to-purple-900/80 p-10 shadow-[0_25px_60px_rgba(15,23,42,0.7)]">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-cyan-300">Persönlicher Planer</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Eine zentrale Bühne für Aufgaben, Projekte und Analysen.
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">
            Überwachung in Echtzeit, Fokus-Impulse und die beruhigende Klarheit, dass nichts untergeht. Behalte
            Prioritäten, Energie und Deadlines mit einem Blick.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/app/plan"
              className="rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-lg transition hover:shadow-2xl"
            >
              Jetzt starten
            </Link>
            <Link
              href="/app"
              className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-100"
            >
              Dashboard ansehen
            </Link>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl bg-slate-900/70 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.45)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">{metric.label}</p>
              <p className="mt-4 text-3xl font-semibold text-white">{metric.value}</p>
              <p className="text-sm text-slate-400">{metric.sub}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 rounded-2xl bg-slate-900/70 p-8 shadow-[0_20px_40px_rgba(15,23,42,0.55)] md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Ein Dashboard</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Viele Perspektiven</h2>
            <ul className="mt-5 space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                Visualisiere Fortschritt mit Live-Metriken
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                Halte Blocker und Deadlines im Blick
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                Richte Prioritäten nach Energie, Fokus und Impact
              </li>
            </ul>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-800 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Status-Verteilung</p>
            <div className="mt-5 h-2 w-full rounded-full bg-slate-700">
              <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />
              <div className="h-full w-2/5 rounded-full bg-slate-700" />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              <span>In Arbeit 3</span>
              <span>Geplant 8</span>
              <span>Blockiert 0</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
