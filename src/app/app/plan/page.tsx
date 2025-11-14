import TaskCard from '../../../components/TaskCard';
import TimeGrid from '../../../components/TimeGrid';
import PlannerSidebar from '../../../components/PlannerSidebar';
import PomodoroDock from '../../../components/PomodoroDock';
import { planDayAction } from '../../../actions/plan';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

const formatTime = (date: Date) => date.toISOString().slice(11, 16);

export default async function PlanPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect('/api/auth/signin?callbackUrl=/app/plan');
  }

  const today = new Date();
  const dateKey = today.toISOString().slice(0, 10);
  const planResult = await planDayAction({ date: dateKey });

  const totalTasks = planResult.tasks.length || 1;
  const completedPercentage = Math.round(
    (planResult.tasks.filter((task) => task.status === 'DONE').length / totalTasks) * 100
  );
  const focusMetrics = [
    { label: 'Tasks in Arbeit', value: `${planResult.allocations.length}` },
    { label: '% Erledigt', value: `${completedPercentage}%` },
  ];

  const statusCounts = planResult.tasks.reduce<Record<string, number>>((acc, task) => {
    acc[task.status] = (acc[task.status] ?? 0) + 1;
    return acc;
  }, {});

  const statusRows = [
    { label: 'In Arbeit', value: statusCounts.ACTIVE ?? 0, color: 'from-teal-400 to-cyan-500' },
    { label: 'Geplant', value: statusCounts.SCHEDULED ?? 0, color: 'from-blue-500 to-indigo-500' },
    { label: 'Im Test', value: statusCounts.INBOX ?? 0, color: 'from-amber-500 to-orange-500' },
    { label: 'Blockiert', value: statusCounts.BLOCKED ?? 0, color: 'from-red-500 to-rose-500' },
  ];

  const nextTasks = planResult.tasks
    .filter((task) => task.status !== 'DONE')
    .sort((a, b) => (a.dueAt && b.dueAt ? a.dueAt.getTime() - b.dueAt.getTime() : 0))
    .slice(0, 3);

  const daysMap = new Map<
    string,
    { label: string; date: string; blocks: Array<{ start: string; end: string; label: string; kind: 'focus' | 'meeting' | 'break' }> }
  >();

  planResult.slots.forEach((slot) => {
    if (slot.type === 'buffer') return;
    const weekday = slot.start.toLocaleDateString('de-DE', { weekday: 'short' });
    const dateLabel = slot.start.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
    const key = `${weekday}-${dateLabel}`;
    const blocks = daysMap.get(key)?.blocks ?? [];

    blocks.push({
      start: formatTime(slot.start),
      end: formatTime(slot.end),
      label: slot.type === 'meeting' ? 'Meeting' : 'Fokus',
      kind: slot.type === 'meeting' ? 'meeting' : 'focus',
    });

    daysMap.set(key, {
      label: weekday,
      date: dateLabel,
      blocks,
    });
  });

  const timeGridDays = Array.from(daysMap.values()).slice(0, 7);

  return (
    <section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr_0.8fr]">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950/70 to-slate-900/80 p-8 shadow-[0_35px_60px_rgba(15,23,42,0.7)]">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">FOKUS</p>
              <p className="text-2xl font-semibold text-white">
                {today.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">Heute</span>
          </header>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {focusMetrics.map((metric) => (
              <div key={metric.label} className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{metric.label}</p>
                <p className="text-3xl font-semibold text-white">{metric.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 h-1.5 w-full rounded-full bg-slate-800">
            <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500" />
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
            <span className="rounded-full bg-slate-800/60 px-3 py-1 text-cyan-300">8 geplant</span>
            <span className="rounded-full bg-slate-800/60 px-3 py-1 text-amber-300">0 blockiert</span>
            <span className="rounded-full bg-slate-800/60 px-3 py-1 text-rose-300">
              {statusCounts.BLOCKED ?? 0} ueberfällig
            </span>
            <span className="rounded-full bg-slate-800/60 px-3 py-1 text-sky-300">0 Deadlines</span>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-[0_25px_45px_rgba(15,23,42,0.6)]">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">STATUS-VERTEILUNG</p>
          <div className="mt-4 space-y-4">
            {statusRows.map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{row.label}</p>
                  <div className="mt-1 h-2 rounded-full bg-slate-800">
                    <div className={`h-full w-full rounded-full bg-gradient-to-r ${row.color}`} />
                  </div>
                </div>
                <span className="text-sm font-semibold text-white">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Nächste Aufgaben</p>
            <div className="mt-4 space-y-4">
              {nextTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  title={task.title}
                  project={task.projectId ?? 'Allgemein'}
                  status={task.status}
                  priority={task.priority}
                  estimate={`${task.estimateMin}m`}
                  due={task.dueAt ? task.dueAt.toLocaleDateString('de-DE') : '—'}
                  energy={task.energy}
                />
              ))}
            </div>
          </div>
          <PomodoroDock activeTask={nextTasks[0]?.title ?? 'Keine Aufgabe'} remaining={18} cycle={1} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.7fr]">
        <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">Wochenuebersicht</h2>
          <TimeGrid days={timeGridDays.length ? timeGridDays : [{ label: 'Mo', date: '??', blocks: [] }]} />
        </div>
        <PlannerSidebar
          focusBlocks={3}
          capacityHours={9}
          plannedEnergy={2}
          topFocus={[
            { title: 'Launch Ready Checklist', project: 'Client A Website', eta: '90m' },
            { title: 'Landing Story & Funnel', project: 'Eigenes Produkt', eta: '120m' },
          ]}
          wipLimit={3}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Kalender</p>
              <p className="text-2xl font-semibold text-white">{today.toLocaleString('de-DE', { month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-2xl border border-slate-700 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white">Heute</button>
              <button className="rounded-2xl border border-slate-700 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white">Zurueck</button>
              <button className="rounded-2xl border border-slate-700 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white">Weiter</button>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[0.55rem] font-semibold uppercase tracking-[0.4em] text-slate-400">
            <span>Monat</span>
            <span>Woche</span>
            <span>Tag</span>
            <span>Agenda</span>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {['Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.', 'So.'].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 text-sm text-slate-300">
            {Array.from({ length: 35 }, (_, index) => (
              <div key={index} className="rounded-2xl border border-slate-800/80 p-2 bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{index + 1}</span>
                </div>
                <p className="mt-2 text-xs text-slate-400/80">.</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[0.55rem] uppercase tracking-[0.4em] text-slate-500">Kontrollen</p>
              <p className="text-sm font-semibold text-white">Meeting-Zeiten & Fokusbloecke</p>
            </div>
            <button className="rounded-2xl border border-slate-700 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white">
              Tradeoffs pruefen
            </button>
          </div>
        </div>
        <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="rounded-2xl border border-slate-800/50 bg-slate-950/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Top 3</p>
            <p className="mt-2 text-lg font-semibold text-white">Prioritäten fuer heute</p>
            <p className="text-sm text-slate-400">Review Blocker, Launch-Checklist, Analytics-Einheit.</p>
          </div>
          <div className="rounded-2xl border border-slate-800/50 bg-slate-950/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Kapazität: 8h</p>
            <p className="mt-2 text-sm text-slate-300">Meetings blockiert - 1.5h</p>
            <p className="text-sm text-slate-300">Focus-Fenster - 5h</p>
          </div>
          <div className="rounded-2xl border border-slate-800/50 bg-slate-950/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">GOOGLE KALENDER</p>
            <p className="text-lg font-semibold text-white">Verbunden</p>
            <button className="mt-3 w-full rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white">
              Verbindung aktualisieren
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
