export interface PomodoroDockProps {
  activeTask?: string;
  remaining?: number;
  cycle?: number;
}

export default function PomodoroDock({
  activeTask = 'Kein aktiver Task',
  remaining = 25,
  cycle = 1,
}: PomodoroDockProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950/40 to-slate-900/70 p-5 text-white shadow-[0_20px_35px_rgba(15,23,42,0.6)]">
      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Pomodoro Timer</p>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-sm text-slate-400">Aktiv</p>
        <p className="text-3xl font-semibold">{remaining} min</p>
      </div>
      <p className="text-sm text-slate-300">Task: {activeTask}</p>
      <div className="mt-4 flex items-center gap-3">
        <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Cycle {cycle}/4</span>
        <div className="flex-1 rounded-full bg-slate-800/60">
          <div className="h-1.5 w-3/5 rounded-full bg-cyan-400" />
        </div>
        <button className="rounded-2xl border border-slate-700 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white">
          Start
        </button>
      </div>
    </div>
  );
}
