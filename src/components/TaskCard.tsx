export interface TaskCardProps {
  title: string;
  project: string;
  status: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  estimate: string;
  due: string;
  energy: number;
  tags?: string[];
  statusColor?: string;
}

const priorityStyles: Record<TaskCardProps['priority'], string> = {
  P1: 'bg-red-500 text-white',
  P2: 'bg-orange-500 text-white',
  P3: 'bg-amber-400 text-slate-900',
  P4: 'bg-slate-600 text-white',
};

export default function TaskCard({
  title,
  project,
  status,
  priority,
  estimate,
  due,
  energy,
  tags = [],
  statusColor = 'bg-cyan-500/10 text-cyan-300',
}: TaskCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950/40 to-slate-900/60 px-5 py-4 shadow-[0_25px_50px_rgba(15,23,42,0.45)]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className={`px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${priorityStyles[priority]}`}>
          {priority}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-400">{project}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
        <span className={`rounded-full px-3 py-1 text-[0.55rem] ${statusColor}`}>{status}</span>
        <span className="rounded-full bg-slate-800/60 px-3 py-1 text-[0.55rem] text-white">{estimate}</span>
        <span className="rounded-full bg-slate-800/60 px-3 py-1 text-[0.55rem] text-white">Energie {energy}</span>
        <span className="rounded-full bg-slate-800/60 px-3 py-1 text-[0.55rem] text-white">Fällig {due}</span>
      </div>
      {tags.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-700 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
