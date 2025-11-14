'use client';

import { useEffect, useMemo, useState } from 'react';

export interface PomodoroDockProps {
  activeTask?: string;
  remaining?: number;
  cycle?: number;
  workMinutes?: number;
  breakMinutes?: number;
}

const formatSeconds = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
};

export default function PomodoroDock({
  activeTask = 'Kein aktiver Task',
  remaining,
  cycle,
  workMinutes,
  breakMinutes,
}: PomodoroDockProps) {
  const defaultWorkMinutes = workMinutes ?? remaining ?? 25;
  const defaultBreakMinutes = breakMinutes ?? 5;

  const [secondsLeft, setSecondsLeft] = useState(defaultWorkMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [currentCycle, setCurrentCycle] = useState(cycle ?? 1);

  useEffect(() => {
    setSecondsLeft(defaultWorkMinutes * 60);
    setIsWorkSession(true);
    setCurrentCycle(cycle ?? 1);
    setIsRunning(false);
  }, [defaultWorkMinutes, defaultBreakMinutes, cycle]);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const interval = setInterval(() => {
      setSecondsLeft((value) => Math.max(value - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (secondsLeft > 0) {
      return;
    }

    setIsRunning(false);

    if (isWorkSession) {
      setIsWorkSession(false);
      setSecondsLeft(defaultBreakMinutes * 60);
      setIsRunning(true);
      return;
    }

    setIsWorkSession(true);
    setCurrentCycle((prevCycle) => (prevCycle >= 4 ? 1 : prevCycle + 1));
    setSecondsLeft(defaultWorkMinutes * 60);
    setIsRunning(true);
  }, [secondsLeft, isWorkSession, defaultWorkMinutes, defaultBreakMinutes]);

  const totalSeconds = useMemo(
    () => (isWorkSession ? defaultWorkMinutes : defaultBreakMinutes) * 60,
    [isWorkSession, defaultWorkMinutes, defaultBreakMinutes]
  );

  const progress = useMemo(() => {
    if (!totalSeconds) {
      return 0;
    }
    return Math.min(100, Math.max(0, ((totalSeconds - secondsLeft) / totalSeconds) * 100));
  }, [secondsLeft, totalSeconds]);

  const toggleRunning = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsWorkSession(true);
    setCurrentCycle(cycle ?? 1);
    setSecondsLeft(defaultWorkMinutes * 60);
  };

  const sessionLabel = isWorkSession ? 'Arbeitsphase' : 'Pause';

  return (
    <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950/40 to-slate-900/70 p-5 text-white shadow-[0_20px_35px_rgba(15,23,42,0.6)]">
      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Pomodoro Timer</p>
      <div className="mt-3">
        <p className="text-4xl font-semibold text-white">{formatSeconds(secondsLeft)}</p>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{sessionLabel}</p>
        <p className="text-sm text-slate-300">Task: {activeTask}</p>
      </div>
      <div className="mt-5 h-1.5 w-full rounded-full bg-slate-800/70">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-[width]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Cycle {currentCycle}/4</span>
        <button
          type="button"
          onClick={toggleRunning}
          className="rounded-2xl border border-cyan-500/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-cyan-400/80"
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          type="button"
          onClick={resetTimer}
          className="rounded-2xl border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:border-slate-500"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
