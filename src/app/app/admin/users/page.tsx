import Link from 'next/link';
import prisma from '@/lib/db';
import { ensureCurrentUserRecord } from '@/lib/clerkUser';
import { redirect } from 'next/navigation';
import { ROLE_CATEGORIES, ROLE_CATEGORY_LABELS } from '@/lib/roleCategories';
import { updateUserCategoriesByAdmin } from '@/actions/admin';

export const dynamic = 'force-dynamic';

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  categories: string[];
  isPowerUser: boolean;
};

export default async function AdminUsersPage() {
  const user = await ensureCurrentUserRecord();
  if (!user.isPowerUser) {
    redirect('/app/plan');
  }

  const users = await prisma.user.findMany({
    orderBy: { email: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      categories: true,
      isPowerUser: true,
    },
  });

  return (
    <section className="space-y-8">
      <header className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_25px_40px_rgba(15,23,42,0.65)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Admin</p>
            <h1 className="text-3xl font-semibold text-white">Rollen-Verwaltung</h1>
            <p className="text-sm text-slate-400">Power User können hier Kategorien für Nutzer anpassen.</p>
          </div>
          <Link href="/app/projects" className="rounded-full border border-slate-700 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-300">
            Zurück zu Projekten
          </Link>
        </div>
        <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">
          Jeder normale Nutzer braucht 1–2 Kategorien; Power-User haben automatisch Vollzugriff.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {users.map((target) => (
          <form
            key={target.id}
            action={updateUserCategoriesByAdmin}
            className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_25px_40px_rgba(15,23,42,0.65)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  {target.name ?? 'Unbenannter User'}
                </p>
                <p className="text-sm text-white">{target.email}</p>
              </div>
              {target.isPowerUser && (
                <span className="rounded-full border border-emerald-500 px-3 py-1 text-[0.55rem] uppercase tracking-[0.3em] text-emerald-300">
                  Power User
                </span>
              )}
            </div>
            <input type="hidden" name="userId" value={target.id} />

            {target.isPowerUser ? (
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Power User brauchen keine Kategorie-Auswahl.
              </p>
            ) : (
              <div className="grid gap-2">
                {ROLE_CATEGORIES.map((category) => {
                  const isSelected = target.categories.includes(category);
                  return (
                    <label
                      key={category}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-500/10 text-white shadow-sm'
                          : 'border-slate-800 bg-slate-950 text-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="categories"
                        value={category}
                        defaultChecked={isSelected}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-400 focus:ring-cyan-400"
                      />
                      <span>{ROLE_CATEGORY_LABELS[category]}</span>
                    </label>
                  );
                })}
                <p className="text-[0.6rem] uppercase tracking-[0.4em] text-slate-500">
                  {target.categories.length || 0} / 2 Kategorien gesetzt
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={target.isPowerUser}
              className="w-full rounded-2xl border border-cyan-500/60 bg-cyan-500/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {target.isPowerUser ? 'Nicht verfügbar' : 'Kategorien speichern'}
            </button>
          </form>
        ))}
      </div>
    </section>
  );
}
