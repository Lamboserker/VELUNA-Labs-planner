'use client';

import { useEffect, useMemo, useState } from 'react';

type RecipientOption = { id: string; label: string; number: string };

type GitSummary = {
  message: string;
  branch?: string;
  repository?: string;
  timestamp: string;
  commits?: { id?: string; message?: string; author?: { name?: string } | null }[];
};

type ApiState =
  | { status: 'idle'; message?: string }
  | { status: 'loading'; message?: string }
  | { status: 'error'; message: string }
  | { status: 'success'; message: string };

const formatTimestamp = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  return isNaN(date.getTime()) ? value : date.toLocaleString();
};

export default function WatcherDashboardPage() {
  const [recipients, setRecipients] = useState<RecipientOption[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
  const [customNumber, setCustomNumber] = useState('');
  const [message, setMessage] = useState('');
  const [gitSummary, setGitSummary] = useState<GitSummary | null>(null);
  const [sendState, setSendState] = useState<ApiState>({ status: 'idle' });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [recRes, gitRes] = await Promise.all([
          fetch('/api/waba-recipients'),
          fetch('/api/git-last'),
        ]);
        const recJson = await recRes.json();
        const gitJson = await gitRes.json();
        const opts = (recJson?.recipients as RecipientOption[]) ?? [];
        setRecipients(opts);
        setSelectedRecipientId(opts[0]?.id ?? 'custom');
        setGitSummary(gitJson as GitSummary);
        setMessage((gitJson as GitSummary)?.message ?? '');
      } catch {
        // fall back to manual input
        setRecipients([]);
        setSelectedRecipientId('custom');
      }
    };
    void loadData();
  }, []);

  const selectedNumber = useMemo(() => {
    if (selectedRecipientId === 'custom') return customNumber.trim();
    return recipients.find((r) => r.id === selectedRecipientId)?.number ?? '';
  }, [selectedRecipientId, customNumber, recipients]);

  const handleSend = async () => {
    if (!selectedNumber) {
      setSendState({ status: 'error', message: 'Bitte Empfänger wählen oder Nummer eingeben.' });
      return;
    }
    if (!message.trim()) {
      setSendState({ status: 'error', message: 'Nachricht darf nicht leer sein.' });
      return;
    }

    setSendState({ status: 'loading', message: 'Sende via WhatsApp…' });
    try {
      const res = await fetch('/api/whatsapp-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: selectedNumber, message }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error ?? `HTTP ${res.status}`);
      }

      setSendState({ status: 'success', message: 'Nachricht gesendet.' });
    } catch (error) {
      setSendState({
        status: 'error',
        message: (error as Error).message ?? 'Versand fehlgeschlagen.',
      });
    }
  };

  const hydrateFromGitSummary = () => {
    if (gitSummary?.message) {
      setMessage(gitSummary.message);
      setSendState({ status: 'idle' });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-10 text-white sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Watcher Dashboard
            </p>
            <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">
              Power Monitoring & WhatsApp Dispatch
            </h1>
            <p className="mt-2 text-sm text-slate-300 sm:text-base">
              Überwache Aktivität, verschicke Updates und halte Stakeholder synchron.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.2)]" />
            Live
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Letzter Push', value: gitSummary?.branch ?? '—', hint: gitSummary?.repository ?? '' },
            {
              label: 'Commits im letzten Push',
              value: gitSummary?.commits?.length ? gitSummary.commits.length.toString() : '0',
              hint: gitSummary?.commits?.[0]?.author?.name ?? '—',
            },
            {
              label: 'Zuletzt aktualisiert',
              value: formatTimestamp(gitSummary?.timestamp) || '—',
              hint: 'Git Webhook',
            },
            {
              label: 'WhatsApp Ziel',
              value: selectedNumber || 'Wähle Nummer',
              hint: selectedRecipientId === 'custom' ? 'Custom' : 'Aus Preset',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_16px_30px_rgba(15,23,42,0.65)]"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{item.label}</p>
              <div className="mt-2 text-xl font-semibold text-white">{item.value}</div>
              <p className="text-xs text-slate-500">{item.hint}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-[0_28px_60px_rgba(15,23,42,0.75)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  WhatsApp Composer
                </p>
                <h2 className="text-2xl font-semibold text-white">Nachricht senden</h2>
              </div>
              <button
                type="button"
                onClick={hydrateFromGitSummary}
                className="rounded-full border border-cyan-400/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition hover:border-cyan-300 hover:text-white"
              >
                Letzte Änderung laden
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Empfänger
                <select
                  value={selectedRecipientId}
                  onChange={(e) => setSelectedRecipientId(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-white outline-none transition focus:border-cyan-400"
                >
                  {recipients.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label} — {r.number}
                    </option>
                  ))}
                  <option value="custom">Custom Nummer</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Custom Nummer (falls ausgewählt)
                <input
                  type="text"
                  placeholder="z.B. 49XXXXXXXX oder Gruppen-ID"
                  value={customNumber}
                  onChange={(e) => setCustomNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-white outline-none transition focus:border-cyan-400"
                />
              </label>
            </div>

            <label className="mt-4 flex flex-col gap-2 text-sm text-slate-300">
              Nachricht
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={7}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                placeholder="Schreibe eine Nachricht oder lade die letzte Änderung…"
              />
            </label>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {sendState.status !== 'idle' && (
                <div
                  className={`text-sm ${
                    sendState.status === 'error'
                      ? 'text-rose-300'
                      : sendState.status === 'success'
                        ? 'text-emerald-300'
                        : 'text-slate-300'
                  }`}
                >
                  {sendState.message}
                </div>
              )}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sendState.status === 'loading'}
                  className="rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-purple-500 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-950 shadow-[0_18px_40px_rgba(14,165,233,0.4)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {sendState.status === 'loading' ? 'Sende…' : 'WhatsApp senden'}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/50 p-6 shadow-[0_28px_60px_rgba(15,23,42,0.65)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Letzte Änderung (Git Push)
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">Snapshot</h3>

            <div className="mt-4 space-y-3 rounded-2xl border border-slate-800/70 bg-slate-900/50 p-4">
              <div className="text-sm text-slate-300">
                <span className="text-slate-500">Branch:</span> {gitSummary?.branch ?? '—'}
              </div>
              <div className="text-sm text-slate-300">
                <span className="text-slate-500">Repo:</span> {gitSummary?.repository ?? '—'}
              </div>
              <div className="text-sm text-slate-300">
                <span className="text-slate-500">Zeit:</span> {formatTimestamp(gitSummary?.timestamp) || '—'}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-800/70 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Nachricht</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">
                {gitSummary?.message ?? 'Keine Daten vorhanden.'}
              </p>
            </div>

            <div className="mt-5 space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Commits</p>
              <div className="space-y-2">
                {gitSummary?.commits?.length ? (
                  gitSummary.commits.map((commit) => (
                    <div
                      key={commit.id ?? Math.random().toString(36)}
                      className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-3 text-sm text-slate-200"
                    >
                      <div className="font-mono text-xs text-cyan-300">{commit.id?.slice(0, 10) ?? 'unknown'}</div>
                      <div className="mt-1 font-semibold">{(commit.message ?? '').split('\n')[0] || 'Kein Titel'}</div>
                      <div className="text-xs text-slate-400">Author: {commit.author?.name ?? '—'}</div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-800/80 p-3 text-xs text-slate-500">
                    Keine Commits vorhanden.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
