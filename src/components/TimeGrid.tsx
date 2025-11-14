export type TimeGridBlock = {
  start: string;
  end: string;
  label: string;
  kind: 'focus' | 'meeting' | 'break';
  color?: string;
};

export interface TimeGridProps {
  days: {
    label: string;
    date: string;
    blocks: TimeGridBlock[];
  }[];
}

const kindStyles: Record<TimeGridBlock['kind'], string> = {
  focus: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white',
  meeting: 'bg-slate-800 text-white border border-slate-700',
  break: 'bg-slate-800/50 text-slate-300 border border-slate-700',
};

export default function TimeGrid({ days }: TimeGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-7">
      {days.map((day) => (
        <div key={day.label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">{day.label}</p>
              <p className="text-sm font-semibold text-white">{day.date}</p>
            </div>
            <span className="rounded-full bg-slate-800/80 px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-slate-400">
              08-18
            </span>
          </header>
          <div className="space-y-3">
            {day.blocks.map((block) => (
              <div
                key={`${day.label}-${block.start}-${block.end}`}
                className={`rounded-2xl border border-slate-800 px-3 py-2 text-sm ${kindStyles[block.kind]}`}
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-200">
                  <span>{block.start}</span>
                  <span>{block.end}</span>
                </div>
                <p className="mt-1 text-sm font-semibold">{block.label}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
