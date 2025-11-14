'use client';

import { ReactNode } from 'react';
import { TaskStatus } from '@prisma/client';
import { useFormStatus } from 'next/navigation';
import { Calendar, Play, Search, Check } from 'lucide-react';
import { setTaskStatusAction } from '@/actions/task';

const sectors: { status: TaskStatus; label: string; icon: ReactNode; bg: string }[] = [
  { status: TaskStatus.SCHEDULED, label: 'Plan', icon: <Calendar size={16} />, bg: 'from-yellow-400 via-amber-500 to-orange-500' },
  { status: TaskStatus.ACTIVE, label: 'Go', icon: <Play size={16} />, bg: 'from-emerald-400 via-teal-500 to-cyan-500' },
  { status: TaskStatus.BLOCKED, label: 'Test', icon: <Search size={16} />, bg: 'from-violet-400 via-purple-500 to-indigo-500' },
  { status: TaskStatus.DONE, label: 'Done', icon: <Check size={16} />, bg: 'from-emerald-500 via-lime-500 to-emerald-600' },
];

type StatusCircleProps = {
  taskId: string;
  currentStatus: TaskStatus;
};

export default function StatusCircle({ taskId, currentStatus }: StatusCircleProps) {
  const { pending } = typeof useFormStatus === 'function' ? useFormStatus() : { pending: false };

  return (
    <div className="grid h-32 w-32 grid-cols-2 grid-rows-2 gap-0 rounded-full border border-slate-800 bg-slate-950/60 shadow-[0_15px_25px_rgba(15,23,42,0.65)]">
      {sectors.map((sector) => (
        <form key={sector.status} action={setTaskStatusAction} className="overflow-hidden">
          <input type="hidden" name="taskId" value={taskId} />
          <input type="hidden" name="status" value={sector.status} />
          <button
            type="submit"
            disabled={pending}
            className={`flex h-full w-full flex-col items-center justify-center gap-1 rounded-none bg-gradient-to-br ${sector.bg} text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white transition ${
              currentStatus === sector.status ? 'ring-2 ring-white/70 ring-offset-2' : 'opacity-90'
            }`}
          >
            {sector.icon}
            <span className="leading-none">{sector.label}</span>
          </button>
        </form>
      ))}
    </div>
  );
}
