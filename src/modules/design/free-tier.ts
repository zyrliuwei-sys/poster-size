import { and, eq, sql } from 'drizzle-orm';

import { db } from '@/core/db';
import { freeDesignUsage } from '@/config/db/schema';
import { getUuid, md5 } from '@/lib/hash';

/** Free anonymous generations per visitor per UTC day. Results are watermarked. */
export const FREE_DAILY_LIMIT = 1;

function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Stable per-day key so the raw IP address never reaches the database. */
export function clientDayKey(request: Request): string {
  // Platform-set headers win. XFF is append-only through proxies, so its LAST
  // entry is the edge-observed client IP — the first entry is client-supplied
  // and spoofable (rotating it would bypass the daily quota).
  const xff = request.headers.get('x-forwarded-for');
  const lastXff = xff ? xff.split(',').pop()?.trim() : '';
  const ip =
    request.headers.get('cf-connecting-ip')?.trim() ||
    lastXff ||
    request.headers.get('x-real-ip')?.trim() ||
    'unknown';
  return md5(`${utcDay()}:${ip}`);
}

export async function freeDesignsUsedToday(dayKey: string): Promise<number> {
  const rows = await db()
    .select({ count: sql<number>`count(*)` })
    .from(freeDesignUsage)
    .where(
      and(eq(freeDesignUsage.ipHash, dayKey), eq(freeDesignUsage.day, utcDay()))
    );
  return Number(rows[0]?.count ?? 0);
}

/**
 * Record one free generation. The unique (ip_hash, day) index makes this the
 * quota gate itself: a second insert on the same day throws, so concurrent
 * requests cannot both pass the limit.
 */
export async function recordFreeDesign(dayKey: string): Promise<void> {
  await db().insert(freeDesignUsage).values({
    id: getUuid(),
    ipHash: dayKey,
    day: utcDay(),
  });
}
