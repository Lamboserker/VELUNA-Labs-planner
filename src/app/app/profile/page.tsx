import WorkingHoursCard from "@/components/WorkingHoursCard";
import { ensureCurrentUserRecord } from "@/lib/clerkUser";
import { loadWorkingPreferences } from "@/lib/workingPreferences";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await ensureCurrentUserRecord();
  const workingPreferences = await loadWorkingPreferences(user.id);

  return (
    <section className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_25px_40px_rgba(15,23,42,0.65)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
            Profil
          </p>
          <h1 className="text-2xl font-semibold text-white">
            Arbeitszeiten & Kapazität
          </h1>
          <p className="text-sm text-slate-400">
            Lege fest, an welchen Tagen und zu welchen Zeiten du arbeiten
            möchtest. Die Planung verteilt Aufgaben gleichmäßig über deine
            gewählten Slots und fügt nach 3 Stunden automatisch eine 15-Minuten-Pause ein.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Angemeldet als
          </p>
          <p className="text-sm font-semibold text-white">{user.name ?? user.email}</p>
          <p className="text-xs text-slate-400">{user.email}</p>
        </div>
      </header>

      <WorkingHoursCard initialPreferences={workingPreferences} />
    </section>
  );
}
