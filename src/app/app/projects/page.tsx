import Link from 'next/link';
import prisma from '../../../lib/db';
import { ensureCurrentUserRecord } from '../../../lib/clerkUser';
import NewProjectForm from '../../../components/NewProjectForm';

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

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: { tasks: true },
  });

  return (
    <section className="space-y-8">
      <NewProjectForm />
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Projekte</p>
          <h1 className="text-3xl font-semibold text-white">Alle Projekte</h1>
        </div>
        <button className="rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow">
          Neu
        </button>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => {
          const totalEstimate = project.tasks.reduce((sum, task) => sum + (task.estimateMin ?? 0), 0) || 1;
          const doneEstimate = project.tasks
            .filter((task) => task.status === 'DONE')
            .reduce((sum, task) => sum + (task.estimateMin ?? 0), 0);
          const progress = Math.min(100, Math.round((doneEstimate / totalEstimate) * 100));
          return (
            <Link
              key={project.id}
              href={`/app/projects/${project.id}`}
              className="group"
              aria-label={`Zu Project ${project.name}`}
            >
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
                  <span>Fortschritt</span>
                  <span>{progress}%</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
