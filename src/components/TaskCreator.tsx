'use client';

import { Priority } from '@prisma/client';
import { useFormStatus } from 'next/navigation';
import { createTaskWithForm } from '@/actions/task';

const priorityOptions: Priority[] = ['P1', 'P2', 'P3', 'P4'];

type TaskCreatorProps = {
  projectId: string;
};

export default function TaskCreator({ projectId }: TaskCreatorProps) {
  const { pending } = typeof useFormStatus === 'function' ? useFormStatus() : { pending: false };

  const rangeSteps = [
    { label: 'Low', value: 1 },
    { label: 'Med', value: 2 },
    { label: 'High', value: 3 },
  ];

  return (
    <form
      action={createTaskWithForm}
      className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_25px_40px_rgba(15,23,42,0.65)]"
    >
      <input type="hidden" name="projectId" value={projectId} />
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Titel</label>
        <input
          name="title"
          required
          placeholder="Was soll erledigt werden?"
          className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Beschreibung</label>
        <textarea
          name="description"
          rows={3}
          placeholder="Details, Akzeptanzkriterien, Kontext"
          className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
        />
      </div>
      <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.3em] text-slate-400">
        <label className="flex-1">
          Prioritaet
          <select
            name="priority"
            defaultValue="P3"
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
          >
            {priorityOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1">
          Aufwand (Min)
          <input
            name="estimateMin"
            type="number"
            min={5}
            step={5}
            defaultValue="30"
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
          />
        </label>
        <label className="flex-1">
          Energie
          <input
            name="energy"
            type="range"
            min={1}
            max={3}
            defaultValue="2"
            className="mt-2 w-full"
          />
          <div className="flex justify-between text-[0.6rem] tracking-[0.3em] text-slate-500">
            {rangeSteps.map((step) => (
              <span key={step.value}>{step.label}</span>
            ))}
          </div>
        </label>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Faelligkeitsdatum
          <input
            type="date"
            name="dueAt"
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
          />
        </label>
        <label className="flex-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Dateien / Bilder
          <input
            name="files"
            type="file"
            multiple
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
          />
        </label>
      </div>
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-cyan-500/60 bg-gradient-to-r from-cyan-500/20 to-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-cyan-500 disabled:cursor-wait disabled:opacity-70"
        disabled={pending}
      >
        {pending ? (
          <>
            <span className="inline-flex h-4 w-4 animate-spin rounded-full border border-transparent border-t-[2px] border-white" aria-hidden />
            <span>Laedt...</span>
          </>
        ) : (
          'Task anlegen'
        )}
      </button>
    </form>
  );
}
