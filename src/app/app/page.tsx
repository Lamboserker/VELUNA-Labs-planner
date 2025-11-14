export default function AppDashboardPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-10 text-center shadow-[0_25px_40px_rgba(15,23,42,0.65)]">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Dashboard</p>
        <h1 className="text-3xl font-semibold">Willkommen zurück</h1>
        <p className="text-sm text-slate-400">Dein Plan liegt bereit. Navigiere zu Fokusblocks oder Inbox.</p>
      </div>
    </section>
  );
}
