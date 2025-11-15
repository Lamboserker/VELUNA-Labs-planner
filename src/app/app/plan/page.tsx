import TaskCard from '../../../components/TaskCard';
import TimeGrid from '../../../components/TimeGrid';
import PlannerSidebar from '../../../components/PlannerSidebar';
import PomodoroDock from '../../../components/PomodoroDock';
import { CalendarBlockType, TaskStatus } from '@prisma/client';
import prisma from '@/lib/db';
import { replanRange } from '../../../actions/plan';
import { ensureCurrentUserRecord } from '@/lib/clerkUser';
import { redirect } from 'next/navigation';

const formatTime = (date: Date) => date.toISOString().slice(11, 16);

type WeekAppointmentKind = 'meeting' | 'focus' | 'break' | 'buffer';

type WeekAppointment = {
  id: string;
  start: string;
  end: string;
  title: string;
  description: string;
  kind: WeekAppointmentKind;
};

type WeekDay = {
  label: string;
  date: string;
  iso: string;
  appointments: WeekAppointment[];
};

const WEEK_LENGTH = 7;

const toLocalDateKey = (value: Date) => {
  const local = new Date(value);
  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, '0');
  const day = String(local.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toTitleCase = (value?: string) => {
  if (!value) {
    return 'Kalendertermin';
  }

  return value
    .replace(/^(gcal-)/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
    .trim() || 'Kalendertermin';
};

const buildWeekDays = (start: Date): WeekDay[] =>
  Array.from({ length: WEEK_LENGTH }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    const iso = toLocalDateKey(day);
    return {
      label: day.toLocaleDateString('de-DE', { weekday: 'short' }),
      date: day.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
      iso,
      appointments: [],
    };
  });

const formatHours = (minutes: number) => {
  if (!minutes) {
    return '0h';
  }
  const hours = minutes / 60;
  return `${hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1)}h`;
};

export default async function PlanPage() {
  try {
    await ensureCurrentUserRecord();
  } catch {
    redirect('/auth');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateKey = toLocalDateKey(today);
  const weekStart = new Date(today);
  const planningEnd = new Date(weekStart);
  planningEnd.setDate(planningEnd.getDate() + WEEK_LENGTH - 1);
  const { plans: weeklyPlans } = await replanRange({
    startDate: toLocalDateKey(weekStart),
    endDate: toLocalDateKey(planningEnd),
  });

  const planForToday = weeklyPlans.find((plan) => plan.date === dateKey);
  const fallbackPlan = weeklyPlans.find((plan) => plan.allocations.length > 0);
  const planResult =
    planForToday && planForToday.allocations.length > 0
      ? planForToday
      : fallbackPlan ?? weeklyPlans[0] ?? { date: dateKey, slots: [], allocations: [], tasks: [] };

  const totalTasks = planResult.tasks.length || 1;
  const completedPercentage = Math.round(
    (planResult.tasks.filter((task) => task.status === 'DONE').length / totalTasks) * 100
  );

  const taskLookup = new Map<string, typeof planResult.tasks[number]>();
  weeklyPlans.forEach((plan) => {
    plan.tasks.forEach((task) => {
      if (!taskLookup.has(task.id)) {
        taskLookup.set(task.id, task);
      }
    });
  });
  const plannedTaskIds = new Set(planResult.allocations.map((allocation) => allocation.taskId));
  const plannedTasks = planResult.tasks.filter((task) => plannedTaskIds.has(task.id));

  const activeProjectIds = new Set<string>();
  planResult.allocations.forEach((allocation) => {
    const projectId = taskLookup.get(allocation.taskId)?.projectId;
    if (projectId) {
      activeProjectIds.add(projectId);
    }
  });
  const activeProjectCount = activeProjectIds.size;
  const displayedProjectCount = Math.max(activeProjectCount, 1);

  const createStatusCounts = (tasks: typeof planResult.tasks) =>
    tasks.reduce<Record<TaskStatus, number>>((acc, task) => {
      acc[task.status] = (acc[task.status] ?? 0) + 1;
      return acc;
    }, {} as Record<TaskStatus, number>);

  const effectiveStatusCounts = plannedTasks.length
    ? createStatusCounts(plannedTasks)
    : createStatusCounts(planResult.tasks);

  const activeCount = effectiveStatusCounts.ACTIVE ?? 0;
  const plannedCount = effectiveStatusCounts.SCHEDULED ?? 0;
  const blockedCount = effectiveStatusCounts.BLOCKED ?? 0;

  const overdueCount = planResult.tasks.filter(
    (task) => task.status !== TaskStatus.DONE && task.dueAt && task.dueAt < today
  ).length;
  const deadlineCount = planResult.tasks.filter((task) => Boolean(task.dueAt)).length;

  const focusMetrics = [
    { label: 'Tasks in Arbeit', value: `${activeCount}` },
    { label: '% Erledigt', value: `${completedPercentage}%` },
  ];

  const statusRows = [
    { label: 'In Arbeit', value: activeCount, color: 'from-teal-400 to-cyan-500' },
    { label: 'Geplant', value: plannedCount, color: 'from-blue-500 to-indigo-500' },
    { label: 'Im Test', value: effectiveStatusCounts.INBOX ?? 0, color: 'from-amber-500 to-orange-500' },
    { label: 'Blockiert', value: blockedCount, color: 'from-red-500 to-rose-500' },
  ];

  const nextTasks = planResult.tasks
    .filter((task) => task.status !== 'DONE')
    .sort((a, b) => (a.dueAt && b.dueAt ? a.dueAt.getTime() - b.dueAt.getTime() : 0))
    .slice(0, 3);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + WEEK_LENGTH);

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    throw new Error('Benutzer nicht gefunden');
  }

  const projectIds = Array.from(
    new Set(planResult.tasks.map((task) => task.projectId).filter(Boolean))
  ) as string[];
  const projects =
    projectIds.length > 0
      ? await prisma.project.findMany({
          where: {
            id: { in: projectIds },
            userId: user.id,
          },
          select: {
            id: true,
            name: true,
          },
        })
      : [];
  const projectNameMap = new Map(projects.map((project) => [project.id, project.name]));

  const topFocusItems = nextTasks.slice(0, 2).map((task) => ({
    title: task.title,
    project: projectNameMap.get(task.projectId ?? '') ?? 'Allgemein',
    eta: task.estimateMin && task.estimateMin > 0 ? `${task.estimateMin}m` : '—',
  }));

  const weekCalendarBlocks = await prisma.calendarBlock.findMany({
    where: {
      userId: user.id,
      start: {
        lt: weekEnd,
      },
      end: {
        gte: weekStart,
      },
    },
    orderBy: {
      start: 'asc',
    },
  });

  const weekDays = buildWeekDays(weekStart);
  const weekDayMap = new Map(weekDays.map((day) => [day.iso, day]));

  weekCalendarBlocks.forEach((block) => {
    const start = new Date(block.start);
    const end = new Date(block.end);
    const dayKey = toLocalDateKey(start);
    const day = weekDayMap.get(dayKey);
    if (!day) {
      return;
    }

    day.appointments.push({
      id: block.id,
      start: formatTime(start),
      end: formatTime(end),
      title:
        block.extId && block.extId.length > 3
          ? toTitleCase(block.extId)
          : block.type === CalendarBlockType.MEETING
          ? 'Meeting'
          : 'Kalenderblock',
      description: block.type === CalendarBlockType.MEETING ? 'Kalendermeeting' : 'Kalenderblock',
      kind: block.type === CalendarBlockType.MEETING ? 'meeting' : 'focus',
    });
  });

  weeklyPlans.forEach((plan) => {
    plan.allocations.forEach((allocation) => {
      const start = new Date(allocation.start);
      const end = new Date(allocation.end);
      const dayKey = toLocalDateKey(start);
      const day = weekDayMap.get(dayKey);
      if (!day) {
        return;
      }

      const task = taskLookup.get(allocation.taskId);

      day.appointments.push({
        id: allocation.id,
        start: formatTime(start),
        end: formatTime(end),
        title: task?.title ?? 'Fokusblock',
        description: task?.projectId ?? 'Fokuszeit',
        kind: 'focus',
      });
    });
  });

  weekDays.forEach((day) =>
    day.appointments.sort((a, b) => {
      if (a.start === b.start) {
        return a.end.localeCompare(b.end);
      }
      return a.start.localeCompare(b.start);
    })
  );

  const meetingMinutes = weekCalendarBlocks.reduce(
    (sum, block) => sum + Math.round((block.end.getTime() - block.start.getTime()) / 60000),
    0
  );
  const focusMinutes = planResult.allocations.reduce((sum, allocation) => sum + allocation.minutes, 0);
  const openFocusSlots = planResult.slots.filter((slot) => slot.type === 'focus' && slot.availableMinutes > 0)
    .length;

  const focusBlockCount = planResult.allocations.length;
  const plannedEnergy = Math.max(
    1,
    Math.round(
      planResult.tasks.reduce((sum, task) => sum + (task.energy ?? 0), 0) / Math.max(1, planResult.tasks.length)
    )
  );
  const capacityHoursValue = Math.max(1, Math.round((focusMinutes + meetingMinutes) / 60));
  const calendarTotals = [
    { label: 'Kalendertermine', value: `${weekCalendarBlocks.length}` },
    { label: 'Meeting-Minuten', value: `${meetingMinutes}m` },
    { label: 'Geplante Fokuszeit', value: `${focusMinutes}m` },
    { label: 'Offene Fokus-Slots', value: `${openFocusSlots}` },
  ];

  const topPriorityTitles = nextTasks.slice(0, 3).map((task) => task.title);
  const topPriorityLabel = topPriorityTitles.length ? topPriorityTitles.join(' · ') : 'Noch keine Prioritäten';
  const capacityLabel = formatHours(meetingMinutes + focusMinutes);
  const focusHoursLabel = formatHours(focusMinutes);
  const meetingHoursLabel = formatHours(meetingMinutes);
  const calendarConnectionLabel = weekCalendarBlocks.length ? 'Verbunden' : 'Nicht verbunden';
  const calendarActionLabel = weekCalendarBlocks.length ? 'Synchronisieren' : 'Kalender verbinden';

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
            <span className="rounded-full bg-slate-800/60 px-3 py-1 text-cyan-300">{plannedCount} geplant</span>
            <span className="rounded-full bg-slate-800/60 px-3 py-1 text-amber-300">{blockedCount} blockiert</span>
            <span className="rounded-full bg-slate-800/60 px-3 py-1 text-rose-300">{overdueCount} überfällig</span>
            <span className="rounded-full bg-slate-800/60 px-3 py-1 text-sky-300">{deadlineCount} Deadlines</span>
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
          <TimeGrid days={weekDays} />
        </div>
        <PlannerSidebar
          focusBlocks={focusBlockCount}
          capacityHours={capacityHoursValue}
          plannedEnergy={plannedEnergy}
          topFocus={topFocusItems}
          wipLimit={displayedProjectCount}
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
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {calendarTotals.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-4">
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3">
            {weekDays.map((day) => (
              <div
                key={day.iso}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800/60 bg-slate-950/40 px-4 py-3"
              >
                <div>
                  <p className="text-[0.55rem] uppercase tracking-[0.4em] text-slate-500">{day.label}</p>
                  <p className="text-sm font-semibold text-white">{day.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-[0.55rem] uppercase tracking-[0.35em] text-slate-400">Termine</p>
                  <p className="text-lg font-semibold text-white">{day.appointments.length}</p>
                </div>
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
            <p className="mt-2 text-lg font-semibold text-white">Prioritäten für heute</p>
            <p className="text-sm text-slate-400">{topPriorityLabel}</p>
          </div>
          <div className="rounded-2xl border border-slate-800/50 bg-slate-950/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Kapazität: {capacityLabel}</p>
            <p className="mt-2 text-sm text-slate-300">Meetings blockiert - {meetingHoursLabel}</p>
            <p className="text-sm text-slate-300">Focus-Fenster - {focusHoursLabel}</p>
          </div>
          <div className="rounded-2xl border border-slate-800/50 bg-slate-950/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">GOOGLE KALENDER</p>
            <p className="text-lg font-semibold text-white">{calendarConnectionLabel}</p>
            <button className="mt-3 w-full rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white">
              {calendarActionLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
