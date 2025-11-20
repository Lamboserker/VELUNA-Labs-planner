export interface CaptureBarProps {
  action?: (formData: FormData) => Promise<void>;
}

export default function CaptureBar({ action }: CaptureBarProps) {
  return (
    <form
      action={action}
      className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.5)]"
    >
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[220px]">
          <label className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
            Schnell hinzufügen
          </label>
          <input
            name="title"
            placeholder="Neue Aufgabe, Shortcut oder Idee"
            className="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
            Priorität
          </label>
          <select
            name="priority"
            className="w-32 rounded-2xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm text-white"
          >
            <option value="P1">P1</option>
            <option value="P2">P2</option>
            <option value="P3" defaultValue="P3">
              P3
            </option>
            <option value="P4">P4</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
            Aufwand
          </label>
          <select
            name="estimate"
            className="w-32 rounded-2xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm text-white"
          >
            <option value="30">30m</option>
            <option value="60">60m</option>
            <option value="90">90m</option>
          </select>
        </div>
        <button className="rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow">
          Hinzufügen
        </button>
      </div>
    </form>
  );
}
