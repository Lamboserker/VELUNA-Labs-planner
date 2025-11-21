import Link from "next/link";
import PomodoroDock from "../../../components/PomodoroDock";
import TaskCard from "../../../components/TaskCard";
import { createTask, setTaskStatusAction } from "../../../actions/task";
import prisma from "../../../lib/db";
import { ensureCurrentUserRecord } from "../../../lib/clerkUser";
import {
  Priority,
  TaskStatus,
  type Task,
  type Project,
  type User as PrismaUser,
} from "@prisma/client";
import {
  buildTaskVisibilityWhere,
  normalizeUserCategories,
} from "@/lib/accessControl";
import { resolveActiveProject } from "@/lib/activeProject";
import { redirect } from "next/navigation";
import LockScreenToggle from "../../../components/LockScreenToggle";

export const dynamic = "force-dynamic";

type TaskWithRelations = Task & {
  project: Pick<Project, "id" | "name"> | null;
  tags: { tagId: string; tag: { name: string } | null }[];
};

async function fetchTasksForUser(user: PrismaUser, activeProjectId: string) {
  return prisma.task.findMany({
    where: buildTaskVisibilityWhere(user, activeProjectId),
    include: {
      tags: { include: { tag: true } },
      assignedToUser: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}

const hashColorFromString = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}deg 70% 48%)`;
};

const pickTagStyle = (name: string) => {
  const color = hashColorFromString(name);
  return {
    backgroundColor: `${color}1a`,
    borderColor: `${color}`,
    color,
  };
};

const formatShortDate = (date?: Date | null) => {
  if (!date) return "Kein Termin";
  return date.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
};

const calculatePriorityScore = (task: TaskWithRelations) => {
  const priorityWeight: Record<Priority, number> = {
    P1: 1,
    P2: 0.75,
    P3: 0.45,
    P4: 0.25,
  };

  const now = new Date();
  const dueWeight = (() => {
    if (!task.dueAt) return 0.1;
    const diffDays = Math.max(
      0,
      Math.ceil(
        (new Date(task.dueAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
    return Math.max(0, 1.2 - diffDays * 0.05);
  })();

  const effortWeight = Math.max(0.2, 1 - (task.estimateMin ?? 30) / 160);

  return priorityWeight[task.priority] * 1.4 + dueWeight * 1.1 + effortWeight;
};

const buildSmartPriorities = (tasks: TaskWithRelations[]) =>
  tasks
    .slice()
    .sort((a, b) => calculatePriorityScore(b) - calculatePriorityScore(a))
    .slice(0, 5);

const buildCalendarBuckets = (tasks: TaskWithRelations[]) => {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const day = tasks.filter(
    (task) => task.dueAt && task.dueAt >= startOfDay && task.dueAt <= endOfDay
  );

  const week = tasks.filter((task) => {
    if (!task.dueAt) return false;
    const diffDays =
      (task.dueAt.getTime() - startOfDay.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  });

  const month = tasks.filter((task) => {
    if (!task.dueAt) return false;
    const diffDays =
      (task.dueAt.getTime() - startOfDay.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 31;
  });

  return { day, week, month };
};

const buildAgenda = (tasks: TaskWithRelations[]) =>
  tasks
    .map((task) => ({
      id: task.id,
      title: task.title,
      project: task.project?.name ?? "Persönlich",
      time: task.dueAt ?? task.createdAt,
      status: task.status,
    }))
    .sort((a, b) => a.time.getTime() - b.time.getTime())
    .slice(0, 4);

const computeFocusMinutesToday = (tasks: TaskWithRelations[]) => {
  const today = new Date();

  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const allowedStatuses: TaskStatus[] = [
    TaskStatus.ACTIVE,
    TaskStatus.DONE,
    TaskStatus.SCHEDULED,
  ];

  const focused = tasks
    .filter((task) => {
      const touchedAt = task.updatedAt ?? task.createdAt;

      return (
        touchedAt >= startOfDay &&
        touchedAt <= endOfDay &&
        allowedStatuses.includes(task.status as TaskStatus)
      );
    })
    .reduce((sum, task) => sum + (task.estimateMin ?? 0), 0);

  // Fallback, wenn heute nichts geplant ist
  return focused || 76;
};

const buildFocusSchedule = (tasks: TaskWithRelations[]) => {
  const now = new Date();
  const prioritized = buildSmartPriorities(tasks);
  return prioritized.slice(0, 3).map((task, index) => {
    const start = new Date(now.getTime() + index * 45 * 60 * 1000);
    const end = new Date(
      start.getTime() + (task.estimateMin ?? POMODORO_SLOT_MINUTES) * 60 * 1000
    );
    return {
      id: task.id,
      title: task.title,
      start: start.toISOString(),
      end: end.toISOString(),
    };
  });
};

async function handleCreateTask(formData: FormData) {
  "use server";
  const priorityFromForm =
    (formData.get("priority") as Priority) ?? ("P3" as Priority);
  const listPreset = formData.get("listPreset")?.toString() ?? "default";
  const estimateFromForm = Number(formData.get("estimate") ?? 30);

  const presetConfig = {
    deep: { priority: Priority.P1, estimate: Math.max(estimateFromForm, 50) },
    quick: { priority: Priority.P2, estimate: Math.min(estimateFromForm, 30) },
    personal: {
      priority: priorityFromForm,
      estimate: Math.max(15, estimateFromForm),
    },
    default: { priority: priorityFromForm, estimate: estimateFromForm },
  } as const;

  const chosenPreset =
    (presetConfig as Record<string, { priority: Priority; estimate: number }>)[
      listPreset
    ] ?? presetConfig.default;

  const payload = {
    title: formData.get("title")?.toString() ?? "",
    priority: chosenPreset.priority,
    estimateMin: chosenPreset.estimate,
  };
  await createTask(payload);
}

const POMODORO_SLOT_MINUTES = 30;

export default async function InboxPage() {
  let user;
  try {
    user = await ensureCurrentUserRecord();
  } catch {
    return (
      <section>
        <p className="text-white">Bitte anmelden, um Aufgaben zu sehen.</p>
      </section>
    );
  }

  if (
    !user.isPowerUser &&
    normalizeUserCategories(user.categories).length === 0
  ) {
    redirect("/app/onboarding");
  }

  const activeProject = await resolveActiveProject(user);
  if (!activeProject) {
    return (
      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center text-white shadow-[0_25px_40px_rgba(15,23,42,0.65)]">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
          Kein aktives Projekt
        </p>
        <p className="text-sm text-slate-300">
          Bitte wähle zuerst ein aktives Projekt aus.
        </p>
        <Link href="/app/projects" className="text-cyan-400 underline">
          Zu den Projekten
        </Link>
      </section>
    );
  }

  const tasks = await fetchTasksForUser(user, activeProject.id);
  const smartPriorities = buildSmartPriorities(tasks);
  const focusMinutesToday = computeFocusMinutesToday(tasks);
  const calendarBuckets = buildCalendarBuckets(tasks);
  const agenda = buildAgenda(tasks);
  const focusSchedule = buildFocusSchedule(tasks);
  const nonActionable: TaskStatus[] = [TaskStatus.DONE, TaskStatus.DEFERRED];
  const actionableTodos = tasks.filter(
    (task) => !nonActionable.includes(task.status)
  );
  const currentTask =
    tasks.find((task) => task.status === TaskStatus.ACTIVE) ?? tasks[0];
  return (
    <section className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/60 p-6 shadow-[0_22px_45px_rgba(15,23,42,0.55)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                Tiimo Live-Fokus
              </p>
              <h2 className="text-2xl font-semibold text-white">
                Dein Tag in Echtzeit, mit Fokus-Timer &amp; Autoswitch
              </h2>
            </div>
            <LockScreenToggle />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
                Auto-Switch
              </p>
              <p className="mt-2 text-sm text-slate-200">
                Wechsel automatisch zwischen Arbeits- und Pausenphase, inkl.
                sanftem Reset pro Zyklus.
              </p>
              <div className="mt-3 flex items-center gap-2 text-emerald-300">
                <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Live-Status aktiv
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
                Statistik heute
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {focusMinutesToday} Minuten
              </p>
              <p className="text-sm text-slate-300">Heute fokussiert</p>
              <p className="mt-1 text-xs text-slate-400">
                Basierend auf aktiven &amp; erledigten Slots. Nach 20 Minuten
                Inaktivität: Lock-Screen Hinweis.
              </p>
            </div>
          </div>
          <PomodoroDock
            activeTask={currentTask?.title ?? "Inbox aufräumen & Tag planen"}
            workMinutes={POMODORO_SLOT_MINUTES}
            breakMinutes={8}
            cycle={2}
            scheduledBlocks={focusSchedule}
          />
        </div>
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.5)]">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Calendar Planner
            </p>
            <h3 className="text-xl font-semibold text-white">
              Tag, Woche oder Monat — bereit für Google Sync &amp; Farbcodes
            </h3>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-white">
              {(
                [
                  {
                    label: "Heute",
                    items: calendarBuckets.day,
                    color: "from-cyan-400 to-blue-500",
                  },
                  {
                    label: "Woche",
                    items: calendarBuckets.week,
                    color: "from-amber-400 to-orange-500",
                  },
                  {
                    label: "Monat",
                    items: calendarBuckets.month,
                    color: "from-violet-400 to-purple-500",
                  },
                ] as const
              ).map((bucket) => (
                <div
                  key={bucket.label}
                  className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3"
                >
                  <div
                    className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${bucket.color} px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-slate-950`}
                  >
                    {bucket.label}
                  </div>
                  <p className="mt-2 text-2xl font-semibold">
                    {bucket.items.length}
                  </p>
                  <p className="text-xs text-slate-400">
                    geplant, farbcodiert nach Projekt
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {[
                ...calendarBuckets.day,
                ...calendarBuckets.week,
                ...calendarBuckets.month,
              ]
                .slice(0, 4)
                .map((task) => (
                  <div
                    key={`${task.id}-calendar`}
                    className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-400">
                        {task.project?.name ?? "Ohne Projekt"} ·{" "}
                        {formatShortDate(task.dueAt)}
                      </p>
                    </div>
                    <span
                      className="inline-flex h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: hashColorFromString(
                          task.project?.name ?? task.title
                        ),
                      }}
                      aria-hidden
                    />
                  </div>
                ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.5)]">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Agenda Planner
            </p>
            <h3 className="text-xl font-semibold text-white">
              Moderner Hub, 100% lokal &amp; werbefrei
            </h3>
            <p className="mt-1 text-sm text-slate-300">
              Dynamische Reihenfolge nach Startzeit und Status. Nichts verlässt
              dein Gerät.
            </p>
            <div className="mt-4 space-y-3">
              {agenda.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {entry.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatShortDate(entry.time)} · {entry.project}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-emerald-200">
                    {entry.status.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/65 p-6 shadow-[0_22px_45px_rgba(15,23,42,0.55)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Smart-Prioritizer
              </p>
              <h3 className="text-xl font-semibold text-white">
                Dynamisch sortiert nach Deadline · Aufwand · Wichtigkeit
              </h3>
            </div>
            <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-cyan-200">
              Schnellaktion: In Fokus übernehmen
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {smartPriorities.map((task) => (
              <div
                key={task.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {task.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span
                        className="rounded-full border px-2 py-0.5"
                        style={pickTagStyle(task.project?.name ?? "Persönlich")}
                      >
                        {task.project?.name ?? "Persönlich"}
                      </span>
                      <span className="rounded-full bg-slate-800/70 px-2 py-0.5 uppercase tracking-[0.25em] text-white">
                        {task.priority}
                      </span>
                      <span className="rounded-full bg-slate-800/70 px-2 py-0.5 text-white">
                        {task.estimateMin}m
                      </span>
                      <span className="rounded-full bg-slate-800/70 px-2 py-0.5 text-white">
                        {task.dueAt
                          ? `Fällig ${formatShortDate(task.dueAt)}`
                          : "Keine Deadline"}
                      </span>
                    </div>
                  </div>
                  <form action={setTaskStatusAction}>
                    <input type="hidden" name="taskId" value={task.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={TaskStatus.ACTIVE}
                    />
                    <button className="rounded-xl border border-emerald-500/60 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-emerald-200 transition hover:border-emerald-400">
                      In Fokus übernehmen
                    </button>
                  </form>
                </div>
                {task.tags?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {task.tags.map((tag) =>
                      tag.tag ? (
                        <span
                          key={tag.tagId}
                          className="rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em]"
                          style={pickTagStyle(tag.tag.name)}
                        >
                          {tag.tag.name}
                        </span>
                      ) : null
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/65 p-6 shadow-[0_22px_45px_rgba(15,23,42,0.55)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                To-Do Widget
              </p>
              <h3 className="text-xl font-semibold text-white">
                Hinzufügen &amp; abhaken ohne App-Overlay
              </h3>
            </div>
            <span className="rounded-full bg-purple-500/15 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-purple-200">
              Listen anpassbar
            </span>
          </div>
          <form action={handleCreateTask} className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-3">
              <input
                name="title"
                required
                placeholder="Kurzer To-Do-Eintrag"
                className="min-w-[240px] flex-1 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none"
              />
              <select
                name="priority"
                className="rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-3 text-sm text-white"
              >
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3" defaultValue="P3">
                  P3
                </option>
                <option value="P4">P4</option>
              </select>
              <select
                name="estimate"
                className="rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-3 text-sm text-white"
              >
                <option value="15">15m</option>
                <option value="30">30m</option>
                <option value="60">60m</option>
                <option value="90">90m</option>
              </select>
              <select
                name="listPreset"
                className="rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-3 text-sm text-white"
              >
                <option value="default">Standard-Liste</option>
                <option value="quick">Quick Capture</option>
                <option value="deep">Deep Work</option>
                <option value="personal">Personal</option>
              </select>
              <button className="rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow">
                Speichern
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Listen-Preset passt Priorität &amp; Aufwand automatisch an. Alle
              Einträge bleiben lokal, bis sie synchronisiert werden.
            </p>
          </form>
          <div className="mt-5 space-y-2">
            {actionableTodos.slice(0, 4).map((task) => (
              <div
                key={`${task.id}-todo`}
                className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {task.project?.name ?? "Ohne Projekt"} · {task.priority} ·{" "}
                    {task.dueAt
                      ? formatShortDate(task.dueAt)
                      : "keine Deadline"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: hashColorFromString(
                        task.project?.name ?? task.title
                      ),
                    }}
                    aria-hidden
                  />
                  <form action={setTaskStatusAction}>
                    <input type="hidden" name="taskId" value={task.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={TaskStatus.DONE}
                    />
                    <button className="rounded-xl border border-emerald-500/60 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-emerald-200 transition hover:border-emerald-400">
                      Abhaken
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
              Inbox
            </p>
            <h1 className="text-3xl font-semibold text-white">
              Alles im Überblick — Inbox, Widgets &amp; Prioritäten
            </h1>
          </div>
          <Link
            href="/app/batch-edit"
            className="rounded-2xl border border-slate-700 px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-slate-500"
          >
            Batch-Edit oeffnen
          </Link>
        </header>
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              title={task.title}
              project={task.project?.name ?? "Persönlicher Planer"}
              status={task.status}
              priority={task.priority}
              estimate={`${task.estimateMin}m`}
              due={task.dueAt ? task.dueAt.toLocaleDateString("de-DE") : "—"}
              energy={task.energy}
              tags={task.tags?.map((tag) => tag.tag?.name ?? tag.tagId)}
              assignedToName={
                task.assignedToUser?.name ?? task.assignedToUser?.email
              }
              assignedToCurrentUser={task.assignedToUser?.id === user.id}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
