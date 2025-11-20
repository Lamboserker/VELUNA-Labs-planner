'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { TaskStatus } from '@prisma/client';
import { useFormStatus } from 'react-dom';
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
  className?: string;
};

type AlertVariant = 'info' | 'success' | 'error';
type AlertState = { message: string; variant: AlertVariant } | null;

export default function StatusCircle({ taskId, currentStatus, className }: StatusCircleProps) {
  const { pending } = useFormStatus();
  const [alert, setAlert] = useState<AlertState>(null);
  const prevPending = useRef(pending);

  useEffect(() => {
    if (pending && !prevPending.current) {
      setAlert({ message: 'Status wird aktualisiert…', variant: 'info' });
    } else if (!pending && prevPending.current) {
      setAlert({ message: 'Status gesetzt', variant: 'success' });
    }
    prevPending.current = pending;
  }, [pending]);

  useEffect(() => {
    if (alert && alert.variant !== 'info') {
      const timeout = setTimeout(() => setAlert(null), 2500);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [alert]);

  const alertClasses: Record<AlertVariant, string> = {
    info: 'border-cyan-400/40 bg-slate-900/90 text-cyan-200',
    success: 'border-emerald-500/50 bg-emerald-900/80 text-emerald-200',
    error: 'border-rose-500/50 bg-rose-900/80 text-rose-200',
  };

  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      {alert && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.3em] ${alertClasses[alert.variant]}`}
        >
          {alert.variant === 'info' && (
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-white/90" />
          )}
          <span>{alert.message}</span>
        </div>
      )}
      {pending && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-[0.55rem] uppercase tracking-[0.4em] text-cyan-100">
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
          <span>status aktualisiert…</span>
        </div>
      )}
      <div className="grid aspect-square w-32 max-w-[12rem] grid-cols-2 grid-rows-2 gap-0 rounded-full border border-slate-800 bg-slate-950/60 shadow-[0_15px_25px_rgba(15,23,42,0.65)] overflow-hidden md:w-36">
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
    </div>
  );
}
