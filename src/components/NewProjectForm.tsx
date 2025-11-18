'use client';

import { useFormStatus } from 'react-dom';
import { createProjectAction } from '@/actions/project';
import { ROLE_CATEGORY_LABELS, ROLE_CATEGORIES, type RoleCategoryValue } from '@/lib/roleCategories';

const spinnerDots = (
  <span className="inline-flex h-4 w-4 animate-spin rounded-full border border-transparent border-t-[2px] border-t-white" aria-hidden />
);

type NewProjectFormProps = {
  availableCategories: RoleCategoryValue[];
};

export default function NewProjectForm({ availableCategories }: NewProjectFormProps) {
  const { pending } = useFormStatus();
  const categoryOptions = availableCategories.length ? availableCategories : ROLE_CATEGORIES;

  const handleSubmit = async (formData: FormData) => {
    const data = {
      name: formData.get('name') as string,
      goal: formData.get('goal') as string | undefined,
      visibleToCategory: (formData.get('visibleToCategory') as RoleCategoryValue) ?? categoryOptions[0],
    };
    await createProjectAction(data);
  };

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_25px_40px_rgba(15,23,42,0.65)]"
    >
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
          Projektname
          <input
            name="name"
            required
            minLength={3}
            placeholder="Projektname"
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </label>
        <label className="flex-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
          Ziel
          <input
            name="goal"
            placeholder="Was soll erreicht werden?"
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </label>
        <label className="flex-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
          Kategorie
          <select
            name="visibleToCategory"
            defaultValue={categoryOptions[0]}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {ROLE_CATEGORY_LABELS[category]} ({category})
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="flex items-center justify-center rounded-2xl border border-cyan-500/60 bg-cyan-500/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-cyan-400 hover:bg-cyan-500/30 disabled:cursor-wait disabled:opacity-70"
          disabled={pending}
        >
          {pending ? (
            <>
              {spinnerDots}
              <span className="ml-2 text-[0.55rem] tracking-[0.2em]">Laden</span>
            </>
          ) : (
            <span className="text-[0.55rem] tracking-[0.3em]">Neu</span>
          )}
        </button>
      </div>
      <p className="text-xs text-slate-400">
        Nutze klare Projektziele, damit die Planung genaue Fokusblöcke erzeugen kann.
      </p>
    </form>
  );
}
