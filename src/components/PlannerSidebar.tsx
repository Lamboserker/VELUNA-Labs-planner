export interface PlannerSidebarProps {
  focusBlocks?: number;
  capacityHours?: number;
  plannedEnergy?: number;
  topFocus?: { title: string; project: string; eta: string }[];
  wipLimit?: number;
}

export default function PlannerSidebar({
  capacityHours = 8,
  focusBlocks = 3,
  plannedEnergy = 2,
  topFocus = [],
  wipLimit = 3,
}: PlannerSidebarProps) {
  return (
    <aside className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-[0_25px_50px_rgba(15,23,42,0.55)]">
      <div className="rounded-2xl bg-slate-950/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Tagesfokus</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-left">
          <div>
            <p className="text-2xl font-bold text-white">{focusBlocks}</p>
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-400">Fokusbloecke</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{capacityHours}h</p>
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-400">Kapazitaet</p>
          </div>
        </div>
        <div className="mt-4 h-1.5 w-full rounded-full bg-slate-800">
          <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
        </div>
        <p className="mt-2 text-[0.7rem] uppercase tracking-[0.4em] text-slate-500">Geplante Energie {plannedEnergy}</p>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Heute</p>
        {topFocus.length ? (
          topFocus.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.project}</p>
              <p className="text-xs text-slate-500">ETA {item.eta}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">Noch keine Fokusaufgaben geplant.</p>
        )}
      </div>

      <div className="rounded-2xl bg-slate-950/60 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">WIP-Limits</p>
        <p className="mt-1 text-lg font-semibold text-white">{wipLimit} Projekte aktiv</p>
        <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-400">Kontextwechsel gering halten</p>
      </div>
    </aside>
  );
}
