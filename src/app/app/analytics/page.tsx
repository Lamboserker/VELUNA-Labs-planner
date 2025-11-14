import prisma from '../../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';

const statusButtons = ['Geplant', 'In Arbeit', 'Im Test', 'Erledigt', 'Blockiert', 'Abgebrochen'];

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return (
      <section>
        <p className="text-white">Bitte anmelden, um Analysen zu sehen.</p>
      </section>
    );
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return (
      <section>
        <p className="text-white">Benutzer nicht gefunden.</p>
      </section>
    );
  }

  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
  });

  const counts = tasks.reduce<Record<string, number>>((acc, task) => {
    acc[task.status] = (acc[task.status] ?? 0) + 1;
    return acc;
  }, {});

  const insights = [
    { label: 'OFFENE AUFGABEN', value: `${counts.INBOX ?? 0}`, sub: `${counts.ACTIVE ?? 0} geplant · ${counts.BLOCKED ?? 0} blockiert` },
    { label: 'IN ARBEIT', value: `${counts.ACTIVE ?? 0}`, sub: '0 im Test' },
    { label: 'DEADLINE HEUTE', value: `${counts.SCHEDULED ?? 0}`, sub: 'Kein Druck' },
    { label: 'UEBERFÄLLIG', value: `${counts.BLOCKED ?? 0}`, sub: 'Alles unter Kontrolle' },
  ];

  const bars = [
    { label: 'Geplant', value: counts.SCHEDULED ?? 0, color: 'from-blue-500 to-indigo-500' },
    { label: 'In Arbeit', value: counts.ACTIVE ?? 0, color: 'from-cyan-500 to-sky-500' },
    { label: 'Im Test', value: 0, color: 'from-amber-500 to-orange-500' },
    { label: 'Erledigt', value: counts.DONE ?? 0, color: 'from-emerald-500 to-lime-500' },
    { label: 'Abgebrochen', value: counts.DEFERRED ?? 0, color: 'from-rose-500 to-red-500' },
  ];

  const totalTasks = tasks.length || 1;
  const completePercent = Math.round(((counts.DONE ?? 0) / totalTasks) * 100);

  return (
    <section className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Produktivitätsdashboard</p>
          <h1 className="text-3xl font-semibold text-white">Analysen</h1>
          <p className="text-sm text-slate-400">Ein schneller Überblick über Fortschritt, Engpässe und Deadlines.</p>
        </div>
        <div className="rounded-full border border-slate-800 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
          Live
        </div>
      </header>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950/60 to-slate-900/70 p-6 shadow-[0_25px_45px_rgba(15,23,42,0.65)]">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">FORTSCHRITT</p>
          <div className="mt-6 flex flex-wrap items-center gap-8">
            <div className="relative h-40 w-40">
              <div
                className="h-full w-full rounded-full border border-slate-800"
                style={{
                  background: `conic-gradient(#06b6d4 0% ${completePercent}%, #1e40af ${completePercent}% 100%)`,
                }}
              />
              <div className="absolute inset-4 flex items-center justify-center rounded-full bg-slate-950">
                <div className="text-center">
                  <p className="text-3xl font-semibold text-white">{completePercent}%</p>
                  <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-400">Erledigt</p>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {insights.map((insight) => (
                <div key={insight.label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <p className="text-[0.55rem] font-semibold uppercase tracking-[0.4em] text-slate-400">{insight.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{insight.value}</p>
                  <p className="text-xs text-slate-400">{insight.sub}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-6 text-sm text-slate-400">
            Fokus: Geplante Aufgaben füllen {insights[0].value} Tasks. Blockierte Items können sofort adressiert werden.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-[0_25px_45px_rgba(15,23,42,0.65)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">STATUS</p>
              <p className="text-lg font-semibold text-white">Status-Verteilung</p>
            </div>
            <span className="rounded-full bg-slate-800/70 px-3 py-1 text-[0.6rem] uppercase tracking-[0.35em] text-slate-300">
              {tasks.length} Aufgaben
            </span>
          </div>
          <div className="mt-6 space-y-4">
            {bars.map((bar) => (
              <div key={bar.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span>{bar.label}</span>
                  <span>{bar.value}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div className={`h-full rounded-full bg-gradient-to-r ${bar.color}`} style={{ width: `${Math.min(bar.value * 10, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {statusButtons.map((button) => (
              <button
                key={button}
                className="rounded-full border border-slate-700 px-4 py-2 text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-white"
              >
                {button}
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Jede Kategorie zeigt, wie Aufgaben aktuell voranschreiten. Nutze diese Metriken, um Blocker zu priorisieren.
          </p>
        </div>
      </div>
    </section>
  );
}
