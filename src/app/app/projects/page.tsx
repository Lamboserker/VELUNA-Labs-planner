import Link from 'next/link';
import { redirect } from 'next/navigation';
import prisma from '../../../lib/db';
import { ensureCurrentUserRecord } from '../../../lib/clerkUser';
import NewProjectForm from '../../../components/NewProjectForm';
import { buildProjectVisibilityWhere, normalizeUserCategories } from '@/lib/accessControl';
import { resolveActiveProject } from '@/lib/activeProject';
import { setActiveProjectAction } from '@/actions/project';
import { ROLE_CATEGORIES } from '@/lib/roleCategories';
import type { RoleCategory } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  let user;
  try {
    user = await ensureCurrentUserRecord();
  } catch {
    return (
      <section>
        <p className="text-white">Bitte anmelden, um Projekte zu sehen.</p>
      </section>
    );
  }

  if (!user.isPowerUser && normalizeUserCategories(user.categories).length === 0) {
    redirect('/app/onboarding');
  }

  const projectFilter = buildProjectVisibilityWhere(user);
  const projects = await prisma.project.findMany({
    // Scope by visibility rules only; leadership or role-based users should
    // see every project that matches their assigned categories.
    where: projectFilter,
    include: { tasks: true },
  });
  const activeProject = await resolveActiveProject(user);

  const availableCategories: RoleCategory[] = user.isPowerUser
    ? [...ROLE_CATEGORIES]
    : normalizeUserCategories(user.categories);

  return (
    <section className="space-y-8">
      <NewProjectForm availableCategories={availableCategories} />
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Projekte</p>
          <h1 className="text-3xl font-semibold text-white">Alle Projekte</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          {user.isPowerUser && (
            <Link
              href="/app/admin/users"
              className="rounded-full border border-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300"
            >
              Rollen verwalten
            </Link>
          )}
          <div className="flex items-center gap-2 rounded-full border border-slate-800 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
            <span>{activeProject ? `Aktiv: ${activeProject.name}` : 'Kein aktives Projekt'}</span>
          </div>
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => {
          const isActive = activeProject?.id === project.id;
          const totalEstimate = project.tasks.reduce((sum, task) => sum + (task.estimateMin ?? 0), 0) || 1;
          const doneEstimate = project.tasks
            .filter((task) => task.status === 'DONE')
            .reduce((sum, task) => sum + (task.estimateMin ?? 0), 0);
          const progress = Math.min(100, Math.round((doneEstimate / totalEstimate) * 100));
          return (
            <div key={project.id} className="space-y-2">
              <Link href={`/app/projects/${project.id}`} className="group" aria-label={`Zu Project ${project.name}`}>
                <div className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_25px_40px_rgba(15,23,42,0.65)] transition hover:border-cyan-400 hover:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">{project.name}</h2>
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{project.goal ?? 'Status offen'}</span>
                  </div>
                  <p className="text-sm text-slate-400">{project.goal ?? 'Keine Beschreibung vorhanden.'}</p>
                  <div className="rounded-full bg-slate-800/60 p-1">
                    <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all group-hover:w-full" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
                    <span className="flex items-center gap-2">
                      {isActive && <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" aria-hidden />}
                      <span>Fortschritt</span>
                    </span>
                    <span>{progress}%</span>
                  </div>
                </div>
              </Link>
              <form action={setActiveProjectAction} className="mt-2">
                <input type="hidden" name="projectId" value={project.id} />
                <button
                  type="submit"
                  disabled={isActive}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:border-cyan-400 disabled:cursor-not-allowed disabled:border-emerald-500 disabled:bg-emerald-500/10 disabled:text-emerald-200"
                >
                  {isActive ? 'Aktives Projekt' : 'Als aktiv setzen'}
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </section>
  );
}
