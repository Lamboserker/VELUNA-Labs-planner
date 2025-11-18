'use server';

import { z } from 'zod';
import { RoleCategory } from '@prisma/client';
import prisma from '@/lib/db';
import { ensureCurrentUserRecord } from '@/lib/clerkUser';
import { normalizeUserCategories } from '@/lib/accessControl';

const categoriesSchema = z.object({
  userId: z.string().min(1),
  categories: z.array(z.nativeEnum(RoleCategory)).optional(),
});

export async function updateUserCategoriesByAdmin(formData: FormData) {
  const admin = await ensureCurrentUserRecord();
  if (!admin.isPowerUser) {
    throw new Error('Nur Power User können Rollen bearbeiten.');
  }

  const raw = categoriesSchema.parse({
    userId: formData.get('userId')?.toString() ?? '',
    categories: formData.getAll('categories').map((value) => value?.toString()),
  });

  const categories = normalizeUserCategories(raw.categories ?? []);
  if (categories.length < 1 || categories.length > 2) {
    throw new Error('Wähle eine bis zwei Kategorien.');
  }

  const target = await prisma.user.findUnique({
    where: { id: raw.userId },
    select: { isPowerUser: true },
  });
  if (!target) {
    throw new Error('Benutzer nicht gefunden.');
  }
  if (target.isPowerUser) {
    throw new Error('Power-User haben immer Vollzugriff und benötigen keine Kategorien.');
  }

  await prisma.user.update({
    where: { id: raw.userId },
    data: { categories },
  });

  return { success: true };
}
