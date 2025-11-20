'use client';

import { useMemo, useState } from 'react';

export type WeekAppointmentKind = 'meeting' | 'focus' | 'break' | 'buffer';

export type WeekAppointment = {
  id: string;
  start: string;
  end: string;
  title: string;
  description: string;
  kind: WeekAppointmentKind;
};

export type WeekDay = {
  label: string;
  date: string;
  iso: string;
  appointments: WeekAppointment[];
};

export interface TimeGridProps {
  days: WeekDay[];
}

const kindStyles: Record<WeekAppointmentKind, string> = {
  meeting: 'bg-slate-800 text-white border border-slate-700',
  focus: 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white',
  break: 'bg-slate-800/50 text-slate-300 border border-slate-700',
  buffer: 'bg-amber-500/20 text-amber-100 border border-amber-400/60',
};

export default function TimeGrid({ days }: TimeGridProps) {
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  const toggleDay = (iso: string) => {
    setExpandedDays((prev) => ({ ...prev, [iso]: !prev[iso] }));
  };

  const visibleAppointments = useMemo(
    () =>
      days.map((day) => {
        const isExpanded = expandedDays[day.iso];
        const items = isExpanded ? day.appointments : day.appointments.slice(0, 5);
        return { ...day, items, isExpanded };
      }),
    [days, expandedDays]
  );

  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
      {visibleAppointments.map((day) => (
        <div key={day.iso} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">{day.label}</p>
              <p className="text-sm font-semibold text-white">{day.date}</p>
            </div>
            <span className="rounded-full bg-slate-800/70 px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-slate-400">
              {day.appointments.length} Termine
            </span>
          </header>
          <div className="space-y-3">
            {day.items.length ? (
              day.items.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`rounded-2xl border px-3 py-2 text-sm ${kindStyles[appointment.kind]}`}
                >
                  <div className="flex items-center justify-between text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-slate-200">
                    <span>{appointment.start}</span>
                    <span>{appointment.end}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-white">{appointment.title}</p>
                  <p className="text-[0.65rem] text-slate-300">{appointment.description}</p>
                </div>
              ))
            ) : (
              <p className="text-[0.7rem] uppercase tracking-[0.3em] text-slate-500">Keine Termine</p>
            )}
            {day.appointments.length > 5 ? (
              <button
                type="button"
                onClick={() => toggleDay(day.iso)}
                className="w-full rounded-xl border border-slate-700 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white transition hover:border-slate-500"
              >
                {day.isExpanded ? 'Weniger anzeigen' : 'Siehe alle Termine'}
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
