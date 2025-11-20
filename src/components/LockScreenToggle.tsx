'use client';

import { useEffect, useState } from 'react';
import {
  ensurePushRegistration,
  removePushRegistration,
  PushResult,
} from '../lib/pushClient';

type LockState = 'enabled' | 'disabled' | 'blocked';

const STORAGE_KEY = 'lockscreen-updates-enabled';

const supportsNotifications = () =>
  typeof window !== 'undefined' && typeof Notification !== 'undefined';

export default function LockScreenToggle() {
  const [state, setState] = useState<LockState>('disabled');
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (!supportsNotifications()) {
      setNote('Benachrichtigungen werden hier simuliert – native Hooks folgen.');
      return;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === '1') {
      setState(Notification.permission === 'denied' ? 'blocked' : 'enabled');
    }
  }, []);

  const enable = async () => {
    if (!supportsNotifications()) {
      setState('enabled');
      window.localStorage.setItem(STORAGE_KEY, '1');
      setNote('Simulierter Status. Für iOS/Desktop später via native Push-Bindings.');
      return;
    }

    if (Notification.permission === 'granted') {
      setState('enabled');
      window.localStorage.setItem(STORAGE_KEY, '1');
      // Hook for future push registration (web / native bridge).
      return;
    }

    const result = await Notification.requestPermission();
    if (result === 'denied') {
      setState('blocked');
      window.localStorage.removeItem(STORAGE_KEY);
      setNote('Benachrichtigungen im Browser/OS erlauben, um Lock-Screen-Status zu aktivieren.');
      return;
    }

    const pushResult: PushResult = await ensurePushRegistration();
    if (pushResult.status === 'enabled') {
      setState('enabled');
      window.localStorage.setItem(STORAGE_KEY, '1');
      setNote(pushResult.message ?? null);
    } else if (pushResult.status === 'blocked') {
      setState('blocked');
      window.localStorage.removeItem(STORAGE_KEY);
      setNote(pushResult.message ?? 'Benachrichtigungen blockiert.');
    } else {
      setState('disabled');
      setNote(pushResult.message ?? 'Push konnte nicht eingerichtet werden.');
    }
  };

  const disable = () => {
    setState('disabled');
    window.localStorage.removeItem(STORAGE_KEY);
    removePushRegistration();
  };

  const toggle = () => {
    if (state === 'enabled') {
      disable();
      return;
    }
    enable();
  };

  const label =
    state === 'enabled'
      ? 'Lock-Screen Updates an'
      : state === 'blocked'
      ? 'Lock-Screen blockiert'
      : 'Lock-Screen Updates aus';

  const chipClasses =
    state === 'enabled'
      ? 'border-cyan-400/70 text-cyan-100 bg-cyan-500/10'
      : state === 'blocked'
      ? 'border-amber-500/60 text-amber-100 bg-amber-500/10'
      : 'border-slate-700 text-white bg-slate-900/70';

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={toggle}
        className={`rounded-full border px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] transition ${chipClasses}`}
      >
        {label}
      </button>
      {note ? (
        <p className="text-xs text-slate-400">
          {note}
        </p>
      ) : null}
    </div>
  );
}
