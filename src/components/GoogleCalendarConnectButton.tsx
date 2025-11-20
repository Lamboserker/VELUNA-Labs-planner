"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

type Props = {
  connected: boolean;
};

export default function GoogleCalendarConnectButton({ connected }: Props) {
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    setLoading(true);
    fetch("/api/calendar/google/auth-url")
      .then(async (res) => {
        if (!res.ok) {
          const { error } = await res.json().catch(() => ({ error: "Verbindung fehlgeschlagen" }));
          throw new Error(error ?? "Verbindung fehlgeschlagen");
        }
        return res.json();
      })
      .then((payload: { url: string }) => {
        window.location.href = payload.url;
      })
      .catch((error: Error) => {
        console.error(error);
        toast.error(error.message || "Kalender-Verbindung fehlgeschlagen");
        setLoading(false);
      });
  };

  const handleSync = () => {
    startTransition(async () => {
      const res = await fetch("/api/calendar/google/sync", { method: "POST" });
      if (!res.ok) {
        toast.error("Sync fehlgeschlagen");
        return;
      }
      toast.success("Kalender synchronisiert");
      window.location.reload();
    });
  };

  const isBusy = loading || pending;
  const label = connected ? "Synchronisieren" : "Kalender verbinden";

  return (
    <button
      onClick={connected ? handleSync : handleConnect}
      disabled={isBusy}
      className="mt-3 w-full rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white disabled:opacity-70"
    >
      {isBusy ? "Bitte warten..." : label}
    </button>
  );
}
