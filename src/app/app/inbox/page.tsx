import CaptureBar from '../../../components/CaptureBar';
import PomodoroDock from '../../../components/PomodoroDock';
import TaskCard from '../../../components/TaskCard';
import { createTask } from '../../../actions/task';
import prisma from '../../../lib/db';
import { authOptions } from '../../../lib/auth';
import { getServerSession } from 'next-auth/server';
import { Priority } from '@prisma/client';

async function fetchTasks() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return [];
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return [];
  }
  return prisma.task.findMany({
    where: { userId: user.id },
    include: {
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });
}

async function handleCreateTask(formData: FormData) {
  'use server';
  const priority = (formData.get('priority') as Priority) ?? ('P3' as Priority);
  const payload = {
    title: formData.get('title')?.toString() ?? '',
    priority,
    estimateMin: Number(formData.get('estimate') ?? 30),
  };
  await createTask(payload);
}

export default async function InboxPage() {
  const tasks = await fetchTasks();
  return (
    <section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <CaptureBar action={handleCreateTask} />
        <PomodoroDock activeTask="Inbox aufraeumen & Tag planen" remaining={22} cycle={2} />
      </div>

      <div className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Inbox</p>
            <h1 className="text-3xl font-semibold text-white">Alles schnell erfassen</h1>
          </div>
          <button className="rounded-2xl border border-slate-700 px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white">
            Batch-Edit oeffnen
          </button>
        </header>
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              title={task.title}
              project={task.projectId ?? 'Persoenlicher Planer'}
              status={task.status}
              priority={task.priority}
              estimate={`${task.estimateMin}m`}
              due={task.dueAt ? task.dueAt.toLocaleDateString('de-DE') : '—'}
              energy={task.energy}
              tags={task.tags?.map((tag) => tag.tag?.name ?? tag.tagId)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
