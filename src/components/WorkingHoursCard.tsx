"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { WorkingDayPreference } from "@/lib/planner/types";
import { saveWorkingPreferencesAction } from "@/actions/workingPreferences";
import {
  DEFAULT_WORKING_PREFERENCES,
  WorkingPreferences,
  mergeWorkingDays,
} from "@/lib/workingPreferencesShared";

export interface WorkingHoursCardProps {
  initialPreferences?: WorkingPreferences;
}

type DayState = {
  day: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
};

const dayLabels = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const dayDescriptions = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
];

const toTimeString = (hour: number) => {
  const clamped = Math.min(24, Math.max(0, hour));
  const h = Math.floor(clamped);
  const minutes = Math.round((clamped - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const toHourValue = (value: string) => {
  const [h, m] = value.split(":").map((part) => Number(part) || 0);
  return h + m / 60;
};

const buildDayState = (days: WorkingDayPreference[]): DayState[] =>
  mergeWorkingDays(days).map((day) => ({
    day: day.day,
    enabled: Boolean(day.enabled),
    startTime: toTimeString(day.startHour),
    endTime: toTimeString(day.endHour),
  }));

export default function WorkingHoursCard({
  initialPreferences,
}: WorkingHoursCardProps) {
  const basePreferences = useMemo(
    () =>
      initialPreferences ?? {
        ...DEFAULT_WORKING_PREFERENCES,
        workingDays: DEFAULT_WORKING_PREFERENCES.workingDays,
      },
    [initialPreferences]
  );
  const router = useRouter();
  const [days, setDays] = useState<DayState[]>(() =>
    buildDayState(basePreferences.workingDays)
  );
  const [slotMinutes, setSlotMinutes] = useState<number>(
    basePreferences.slotMinutes ?? 30
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setDays(buildDayState(basePreferences.workingDays));
    setSlotMinutes(basePreferences.slotMinutes ?? 30);
  }, [basePreferences]);

  const handleTimeChange = (
    dayIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setDays((prev) =>
      prev.map((item, idx) =>
        idx === dayIndex ? { ...item, [field]: value } : item
      )
    );
    setStatus("idle");
  };

  const handleToggle = (dayIndex: number) => {
    setDays((prev) =>
      prev.map((item, idx) =>
        idx === dayIndex ? { ...item, enabled: !item.enabled } : item
      )
    );
    setStatus("idle");
  };

  const totalWeeklyHours = useMemo(
    () =>
      days.reduce((sum, day) => {
        if (!day.enabled) return sum;
        return (
          sum +
          Math.max(0, toHourValue(day.endTime) - toHourValue(day.startTime))
        );
      }, 0),
    [days]
  );

  const savePreferences = () => {
    const payload = {
      workingDays: days.map((day) => ({
        day: day.day,
        enabled: day.enabled,
        startHour: toHourValue(day.startTime),
        endHour: toHourValue(day.endTime),
      })),
      slotMinutes,
    };

    startTransition(async () => {
      try {
        setStatus("saving");
        await saveWorkingPreferencesAction(payload);
        setStatus("saved");
        router.refresh();
      } catch (error) {
        console.error("Failed to save working hours", error);
        setStatus("error");
      }
    });
  };

  const statusLabel =
    status === "saved"
      ? "Gespeichert"
      : status === "saving" || isPending
        ? "Speichert …"
        : status === "error"
          ? "Fehler"
          : "Bereit";

  const statusColor =
    status === "saved"
      ? "text-emerald-300"
      : status === "error"
        ? "text-rose-300"
        : "text-slate-300";

  return (
    <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.35em] text-slate-400">
            Arbeitszeiten
          </p>
          <p className="text-lg font-semibold text-white">
            Steuere deine Planungsfenster
          </p>
          <p className="text-sm text-slate-400">
            Definiere Arbeitstage, Start- und Endzeiten damit Tasks gleichmäßig
            über die Slots verteilt werden.
          </p>
        </div>
        <div
          className={`text-xs font-semibold uppercase tracking-[0.35em] ${statusColor}`}
        >
          {statusLabel}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {days.map((day, index) => {
          const duration = Math.max(
            0,
            toHourValue(day.endTime) - toHourValue(day.startTime)
          );
          return (
            <div
              key={day.day}
              className={`space-y-2 rounded-2xl border px-4 py-3 ${
                day.enabled
                  ? "border-cyan-700/40 bg-slate-950/50"
                  : "border-slate-800 bg-slate-950/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                    {dayLabels[day.day]}
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {dayDescriptions[day.day]}
                  </p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                  <span>{day.enabled ? "An" : "Aus"}</span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800"
                    checked={day.enabled}
                    onChange={() => handleToggle(index)}
                  />
                </label>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="time"
                  value={day.startTime}
                  onChange={(event) =>
                    handleTimeChange(index, "startTime", event.target.value)
                  }
                  className="w-[110px] rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white shadow-inner"
                  aria-label={`${dayDescriptions[day.day]} Start`}
                />
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  bis
                </span>
                <input
                  type="time"
                  value={day.endTime}
                  onChange={(event) =>
                    handleTimeChange(index, "endTime", event.target.value)
                  }
                  className="w-[110px] rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white shadow-inner"
                  aria-label={`${dayDescriptions[day.day]} Ende`}
                />
              </div>
              <p className="text-xs text-slate-400">
                Arbeitszeit:{" "}
                <span className="font-semibold text-white">
                  {duration.toFixed(1)}h
                </span>
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3">
          <p className="text-[0.6rem] uppercase tracking-[0.35em] text-slate-400">
            Slotlänge
          </p>
          <div className="mt-1 flex items-center gap-2 text-sm text-white">
            <input
              type="number"
              min={15}
              max={180}
              step={5}
              value={slotMinutes}
              onChange={(event) =>
                setSlotMinutes(Number(event.target.value) || 30)
              }
              className="w-20 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
            <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Minuten
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-cyan-700/60 bg-cyan-500/10 px-4 py-3">
          <p className="text-[0.6rem] uppercase tracking-[0.35em] text-cyan-200">
            Kapazität
          </p>
          <p className="text-sm font-semibold text-white">
            {totalWeeklyHours.toFixed(1)}h pro Woche
          </p>
          <p className="text-xs text-slate-300">
            Nach 3h wird automatisch eine 15-Minuten-Pause geblockt.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setDays(buildDayState(DEFAULT_WORKING_PREFERENCES.workingDays));
              setSlotMinutes(DEFAULT_WORKING_PREFERENCES.slotMinutes ?? 30);
              setStatus("idle");
            }}
            className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-slate-500"
          >
            Standardzeiten
          </button>
          <button
            type="button"
            onClick={savePreferences}
            disabled={isPending}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:shadow-cyan-500/20 disabled:opacity-70"
          >
            {isPending ? "Speichern …" : "Arbeitsplan sichern"}
          </button>
        </div>
      </div>
    </div>
  );
}
