import CategorySetupForm from '@/components/CategorySetupForm';
import { normalizeUserCategories } from '@/lib/accessControl';
import { ensureCurrentUserRecord } from '@/lib/clerkUser';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const user = await ensureCurrentUserRecord();
  const categories = normalizeUserCategories(user.categories);
  if (user.isPowerUser || categories.length > 0) {
    redirect('/app/plan');
  }

  return (
    <section className="flex min-h-[70vh] items-center justify-center">
      <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-[0_25px_40px_rgba(15,23,42,0.65)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Onboarding</p>
          <h1 className="text-3xl font-semibold text-white">Deine Sichtbarkeit einstellen</h1>
          <p className="text-sm text-slate-400">Wähle bis zu zwei Kategorien aus, damit du Zugriff auf die passenden Projekte bekommst.</p>
        </div>
        <CategorySetupForm initialCategories={categories} />
      </div>
    </section>
  );
}
