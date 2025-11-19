import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { ensureCurrentUserRecord } from "@/lib/clerkUser";
import TaskCard from "@/components/TaskCard";
import TaskCreator from "@/components/TaskCreator";
import ProjectRoleForm from "@/components/ProjectRoleForm";
import StatusCircle from "@/components/StatusCircle";
import { TaskStatus } from "@prisma/client";
import {
  assignableUsersWhere,
  canAccessProject,
  normalizeUserCategories,
} from "@/lib/accessControl";
import { ROLE_CATEGORY_LABELS, ROLE_CATEGORIES } from "@/lib/roleCategories";

export const dynamic = "force-dynamic";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

const statusBadge: Record<TaskStatus, string> = {
  [TaskStatus.INBOX]: "bg-slate-800/80 text-slate-300",
  [TaskStatus.ACTIVE]: "bg-sky-500/10 text-cyan-300",
  [TaskStatus.SCHEDULED]: "bg-purple-500/10 text-violet-300",
  [TaskStatus.DONE]: "bg-emerald-500/10 text-emerald-200",
  [TaskStatus.BLOCKED]: "bg-rose-500/10 text-rose-300",
  [TaskStatus.DEFERRED]: "bg-amber-500/10 text-amber-200",
};

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  let user;
  try {
    user = await ensureCurrentUserRecord();
  } catch {
    return (
      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center text-white shadow-[0_25px_40px_rgba(15,23,42,0.65)]">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
          Not logged in
        </p>
        <p>Please log in to see tasks.</p>
      </section>
    );
  }

  const normalizedCategories = normalizeUserCategories(user.categories);
  if (!user.isPowerUser && normalizedCategories.length === 0) {
    redirect("/app/onboarding");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      userId: true,
      name: true,
      goal: true,
      visibleToCategory: true,
      tasks: {
        where: { status: { not: TaskStatus.DONE } },
        orderBy: [{ priority: "asc" }, { dueAt: "asc" }],
        include: {
          tags: { include: { tag: true } },
          assignedToUser: true,
        },
      },
    },
  });

  if (!project || !canAccessProject(user, project)) {
    return (
      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center text-white shadow-[0_25px_40px_rgba(15,23,42,0.65)]">
        <p>Project not found or access denied.</p>
        <Link href="/app/projects" className="text-cyan-400 underline">
          Zurück zu Projekten
        </Link>
      </section>
    );
  }

  const availableCategories = user.isPowerUser
    ? ROLE_CATEGORIES
    : normalizedCategories;
  const canEditRole = user.isPowerUser || project.userId === user.id;

  const assignableUsers = await prisma.user.findMany({
    where: assignableUsersWhere(project.visibleToCategory),
    select: { id: true, name: true, email: true, isPowerUser: true },
  });

  return (
    <section className="space-y-8">
      {canEditRole && (
        <ProjectRoleForm
          projectId={project.id}
          currentCategory={project.visibleToCategory}
          availableCategories={availableCategories}
        />
      )}
      <header className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_25px_40px_rgba(15,23,42,0.65)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
              Project
            </p>
            <h1 className="text-3xl font-semibold text-white">
              {project.name}
            </h1>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
              {ROLE_CATEGORY_LABELS[project.visibleToCategory]} (
              {project.visibleToCategory})
            </p>
            <p className="text-sm text-slate-400">
              {project.goal ?? "No goal defined."}
            </p>
          </div>
          <span className="rounded-full border border-slate-800 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-400">
            {project.tasks.length} offene Aufgaben
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
          <Link
            href="/app/projects"
            className="rounded-full border border-slate-700 px-4 py-2 hover:border-white"
          >
            Zurück zu Projekten
          </Link>
        </div>
      </header>

      <TaskCreator
        projectId={project.id}
        projectCategory={project.visibleToCategory}
        assignees={assignableUsers}
      />

      <div className="space-y-4">
        {project.tasks.length ? (
          project.tasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_25px_40px_rgba(15,23,42,0.65)]"
            >
              <div className="flex flex-wrap items-start gap-6">
                <StatusCircle taskId={task.id} currentStatus={task.status} />
                <TaskCard
                  title={task.title}
                  project={project.name}
                  status={task.status}
                  priority={task.priority}
                  estimate={`${task.estimateMin ?? 0}m`}
                  due={
                    task.dueAt ? task.dueAt.toLocaleDateString("de-DE") : "—"
                  }
                  energy={task.energy}
                  tags={task.tags.map((tag) => tag.tag?.name ?? tag.tagId)}
                  statusColor={statusBadge[task.status]}
                  assignedToName={
                    task.assignedToUser?.name ?? task.assignedToUser?.email
                  }
                  assignedToCurrentUser={task.assignedToUser?.id === user.id}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-slate-400">
            Keine offenen Aufgaben in diesem Projekt.
          </div>
        )}
      </div>
    </section>
  );
}
