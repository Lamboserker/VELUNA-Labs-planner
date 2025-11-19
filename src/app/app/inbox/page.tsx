import Link from "next/link";
import CaptureBar from "../../../components/CaptureBar";
import PomodoroDock from "../../../components/PomodoroDock";
import TaskCard from "../../../components/TaskCard";
import { createTask } from "../../../actions/task";
import prisma from "../../../lib/db";
import { ensureCurrentUserRecord } from "../../../lib/clerkUser";
import { Priority, TaskStatus, type User as PrismaUser } from "@prisma/client";
import {
  buildTaskVisibilityWhere,
  normalizeUserCategories,
} from "@/lib/accessControl";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function fetchTasksForUser(user: PrismaUser) {
  return prisma.task.findMany({
    where: buildTaskVisibilityWhere(user),
    include: {
      tags: { include: { tag: true } },
      assignedToUser: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}

async function handleCreateTask(formData: FormData) {
  "use server";
  const priority = (formData.get("priority") as Priority) ?? ("P3" as Priority);
  const payload = {
    title: formData.get("title")?.toString() ?? "",
    priority,
    estimateMin: Number(formData.get("estimate") ?? 30),
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

  const tasks = await fetchTasksForUser(user);
  const currentTask =
    tasks.find((task) => task.status === TaskStatus.ACTIVE) ?? tasks[0];
  return (
    <section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <CaptureBar action={handleCreateTask} />
        <PomodoroDock
          activeTask={currentTask?.title ?? "Inbox aufräumen & Tag planen"}
          workMinutes={POMODORO_SLOT_MINUTES}
          cycle={2}
        />
      </div>

      <div className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
              Inbox
            </p>
            <h1 className="text-3xl font-semibold text-white">
              Alles schnell erfassen
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
