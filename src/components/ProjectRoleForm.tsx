'use client';

import { useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { ROLE_CATEGORIES, ROLE_CATEGORY_LABELS, type RoleCategoryValue } from '@/lib/roleCategories';
import { updateProjectCategoryAction } from '@/actions/project';

type Props = {
  projectId: string;
  currentCategory: RoleCategoryValue;
  availableCategories: RoleCategoryValue[];
};

type AlertState = { message: string; variant: 'success' | 'error' } | null;

const spinnerDots = (
  <span className="inline-flex h-3 w-3 animate-spin rounded-full border border-transparent border-t-[2px] border-t-white" />
);

export default function ProjectRoleForm({ projectId, currentCategory, availableCategories }: Props) {
  const router = useRouter();
  const formStatus = useFormStatus();
  const pending = formStatus?.pending ?? false;
  const [alert, setAlert] = useState<AlertState>(null);

  const categoryOptions = availableCategories.length ? availableCategories : ROLE_CATEGORIES;

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [alert]);

  const handleSubmit = async (formData: FormData) => {
    const visibleToCategory = (formData.get('visibleToCategory') as RoleCategoryValue) ?? currentCategory;
    try {
      await updateProjectCategoryAction({ projectId, visibleToCategory });
      setAlert({ message: 'Projektrolle gespeichert.', variant: 'success' });
      router.refresh();
    } catch (error) {
      setAlert({
        message: error instanceof Error ? error.message : 'Fehler beim Speichern der Rolle.',
        variant: 'error',
      });
      throw error;
    }
  };

  return (
    <form
      action={handleSubmit}
      className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_25px_40px_rgba(15,23,42,0.65)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Rollensteuerung</p>
          <p className="text-sm text-slate-300">
            Bestimme, welche Kategorie Zugriff auf dieses Projekt hat. Nur Projektinhaber und Power User können
            die Rolle ändern.
          </p>
        </div>
        <span className="rounded-full border border-slate-800 px-3 py-1 text-[0.55rem] uppercase tracking-[0.3em] text-slate-400">
          {ROLE_CATEGORY_LABELS[currentCategory]}
        </span>
      </div>
      <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
        Rolle
        <select
          name="visibleToCategory"
          defaultValue={currentCategory}
          className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
        >
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {ROLE_CATEGORY_LABELS[category]} ({category})
            </option>
          ))}
        </select>
      </label>
      {alert && (
        <div
          className={`rounded-2xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
            alert.variant === 'success'
              ? 'border-emerald-500 text-emerald-200'
              : 'border-rose-500 text-rose-200'
          }`}
        >
          {alert.message}
        </div>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-500/60 bg-gradient-to-r from-cyan-500/20 to-slate-900 px-5 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-white transition hover:border-cyan-400 disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? (
          <>
            {spinnerDots}
            <span>Speichere…</span>
          </>
        ) : (
          'Rolle speichern'
        )}
      </button>
    </form>
  );
}
