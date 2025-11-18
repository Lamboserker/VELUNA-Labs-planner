'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { updateUserCategoriesAction } from '@/actions/user';
import { ROLE_CATEGORIES, ROLE_CATEGORY_LABELS, type RoleCategoryValue } from '@/lib/roleCategories';

type CategorySetupFormProps = {
  initialCategories: RoleCategoryValue[];
};

type AlertState = { message: string; variant: 'success' | 'error' } | null;

export default function CategorySetupForm({ initialCategories }: CategorySetupFormProps) {
  const [selected, setSelected] = useState<RoleCategoryValue[]>(initialCategories);
  const [alert, setAlert] = useState<AlertState>(null);
  const formStatus = useFormStatus();
  const pending = formStatus?.pending ?? false;
  const router = useRouter();

  const handleCheckbox = (category: RoleCategoryValue) => {
    setSelected((current) => {
      if (current.includes(category)) {
        return current.filter((item) => item !== category);
      }
      if (current.length >= 2) {
        return current;
      }
      return [...current, category];
    });
  };

  const handleSubmit = async (formData: FormData) => {
    if (!formData.getAll('categories').length) {
      setAlert({ message: 'Bitte wähle mindestens eine Kategorie.', variant: 'error' });
      throw new Error('Missing categories');
    }
    try {
      await updateUserCategoriesAction(formData);
      setAlert({ message: 'Kategorien gespeichert. Du wirst weitergeleitet.', variant: 'success' });
      router.push('/app/plan');
    } catch (error) {
      setAlert({ message: (error as Error).message ?? 'Fehler beim Speichern.', variant: 'error' });
    }
  };

  return (
    <form
      action={handleSubmit}
      className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_25px_40px_rgba(15,23,42,0.65)]"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Kategorien wählen</p>
        <p className="text-sm text-slate-300">Wähle 1 bis 2 Bereiche für deine Projekte.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {ROLE_CATEGORIES.map((category) => {
          const isSelected = selected.includes(category);
          const borderStyle =
            'flex items-center gap-3 rounded-2xl border px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] transition ' +
            (isSelected
              ? 'border-cyan-400 bg-cyan-500/10 text-white'
              : 'border-slate-800 bg-slate-950 text-slate-300');
          return (
            <label key={category} className={borderStyle}>
              <input
                type="checkbox"
                name="categories"
                value={category}
                checked={isSelected}
                className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-400 focus:ring-cyan-400"
                disabled={!isSelected && selected.length >= 2}
                onChange={() => handleCheckbox(category)}
              />
              <span>{ROLE_CATEGORY_LABELS[category]}</span>
            </label>
          );
        })}
      </div>
      <p className="text-[0.6rem] uppercase tracking-[0.4em] text-slate-500">
        {selected.length} / 2 Kategorien gewählt
      </p>
      {alert && (
        <div
          className={
            'rounded-2xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] '
            + (alert.variant === 'success'
              ? 'border-emerald-500 text-emerald-200'
              : 'border-rose-500 text-rose-200')
          }
        >
          {alert.message}
        </div>
      )}
      <button
        type="submit"
        disabled={pending || selected.length === 0}
        className="w-full rounded-2xl border border-cyan-500/60 bg-cyan-500/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-cyan-400 disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? 'Speichere…' : 'Kategorien speichern'}
      </button>
    </form>
  );
}
