import { and, asc, desc, eq, like, or, type SQL } from 'drizzle-orm';

import { db } from '@/core/db';
import { posterFavorite, posterSize } from '@/config/db/schema';
import { getUuid } from '@/lib/hash';

export async function listPublished(params: {
  search?: string;
  category?: string;
}) {
  const conditions: SQL[] = [eq(posterSize.status, 'published')];

  if (params.category && params.category !== 'all') {
    conditions.push(eq(posterSize.category, params.category));
  }
  if (params.search) {
    conditions.push(
      or(
        like(posterSize.name, `%${params.search}%`),
        like(posterSize.slug, `%${params.search}%`),
        like(posterSize.region, `%${params.search}%`),
        like(posterSize.description, `%${params.search}%`)
      )!
    );
  }

  return db()
    .select()
    .from(posterSize)
    .where(and(...conditions))
    .orderBy(asc(posterSize.sortOrder), asc(posterSize.name));
}

export async function listFavorites(userId: string) {
  return db()
    .select({
      id: posterSize.id,
      slug: posterSize.slug,
      name: posterSize.name,
      category: posterSize.category,
      region: posterSize.region,
      width: posterSize.width,
      height: posterSize.height,
      unit: posterSize.unit,
      aspectRatio: posterSize.aspectRatio,
      description: posterSize.description,
      sortOrder: posterSize.sortOrder,
      status: posterSize.status,
    })
    .from(posterFavorite)
    .innerJoin(posterSize, eq(posterFavorite.posterSizeId, posterSize.id))
    .where(
      and(eq(posterFavorite.userId, userId), eq(posterSize.status, 'published'))
    )
    .orderBy(desc(posterFavorite.createdAt));
}

export async function getFavoriteIds(userId: string) {
  const rows = await db()
    .select({ posterSizeId: posterFavorite.posterSizeId })
    .from(posterFavorite)
    .where(eq(posterFavorite.userId, userId));
  return rows.map((row) => row.posterSizeId);
}

export async function toggleFavorite(params: {
  userId: string;
  posterSizeId: string;
}) {
  const existing = await db()
    .select({ id: posterFavorite.id })
    .from(posterFavorite)
    .where(
      and(
        eq(posterFavorite.userId, params.userId),
        eq(posterFavorite.posterSizeId, params.posterSizeId)
      )
    )
    .limit(1);

  if (existing[0]) {
    await db()
      .delete(posterFavorite)
      .where(eq(posterFavorite.id, existing[0].id));
    return { favorited: false };
  }

  await db().insert(posterFavorite).values({
    id: getUuid(),
    userId: params.userId,
    posterSizeId: params.posterSizeId,
  });
  return { favorited: true };
}

export async function removeFavorite(params: {
  userId: string;
  posterSizeId: string;
}) {
  await db()
    .delete(posterFavorite)
    .where(
      and(
        eq(posterFavorite.userId, params.userId),
        eq(posterFavorite.posterSizeId, params.posterSizeId)
      )
    );
  return { favorited: false };
}

export async function listAdmin(params: { search?: string }) {
  const search = params.search?.trim();
  const where = search
    ? or(
        like(posterSize.name, `%${search}%`),
        like(posterSize.slug, `%${search}%`),
        like(posterSize.category, `%${search}%`)
      )
    : undefined;

  return db()
    .select()
    .from(posterSize)
    .where(where)
    .orderBy(asc(posterSize.sortOrder), asc(posterSize.name));
}

export async function createSize(data: {
  slug: string;
  name: string;
  category: string;
  region: string;
  width: number;
  height: number;
  unit: string;
  aspectRatio: string;
  description: string;
  sortOrder?: number;
}) {
  const [result] = await db()
    .insert(posterSize)
    .values({
      id: getUuid(),
      ...data,
      slug: data.slug.trim().toLowerCase(),
      sortOrder: data.sortOrder ?? 0,
      status: 'published',
    })
    .returning();
  return result;
}

export async function updateSize(
  id: string,
  data: Partial<{
    slug: string;
    name: string;
    category: string;
    region: string;
    width: number;
    height: number;
    unit: string;
    aspectRatio: string;
    description: string;
    sortOrder: number;
    status: string;
  }>
) {
  const [result] = await db()
    .update(posterSize)
    .set({
      ...data,
      ...(data.slug ? { slug: data.slug.trim().toLowerCase() } : {}),
      updatedAt: new Date(),
    })
    .where(eq(posterSize.id, id))
    .returning();
  return result;
}

export async function archiveSize(id: string) {
  await db()
    .update(posterSize)
    .set({ status: 'archived', updatedAt: new Date() })
    .where(eq(posterSize.id, id));
}
