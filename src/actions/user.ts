'use server';

import { z } from 'zod';
import prisma from '@/lib/db';
import { ensureCurrentUserRecord } from '@/lib/clerkUser';
import { RoleCategory } from '@prisma/client';
import { isPowerUserEmail, normalizeUserCategories } from '@/lib/accessControl';

const categoriesSchema = z.object({
  categories: z.array(z.nativeEnum(RoleCategory)).optional(),
});

export async function updateUserCategoriesAction(formData: FormData) {
  const user = await ensureCurrentUserRecord();
  const rawCategories = formData
    .getAll('categories')
    .map((category) => category?.toString())
    .filter(Boolean);
  const parsed = categoriesSchema.parse({ categories: rawCategories });
  const normalized = normalizeUserCategories(parsed.categories ?? []);

  if (!isPowerUserEmail(user.email) && (normalized.length < 1 || normalized.length > 2)) {
    throw new Error('Bitte wähle mindestens eine und maximal zwei Kategorien.');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      categories: normalized,
      isPowerUser: isPowerUserEmail(user.email),
    },
  });

  return { categories: normalized };
}
