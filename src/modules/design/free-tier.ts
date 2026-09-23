import { eq } from 'drizzle-orm';

import { db } from '@/core/db';
import { freeDesignUsage } from '@/config/db/schema';
import { getUuid } from '@/lib/hash';

/**
 * Sign-up gift: every account gets exactly one free design, ever. The result
 * is watermarked; further generations are charged in credits.
 */

/** Has the account's free design been used? */
export async function hasFreeDesign(userId: string): Promise<boolean> {
  const rows = await db()
    .select({ id: freeDesignUsage.id })
    .from(freeDesignUsage)
    .where(eq(freeDesignUsage.userId, userId))
    .limit(1);
  return rows.length === 0;
}

/**
 * Atomically claim the account's free design. Returns false when the gift
 * was already used — the unique index on user_id makes this race-free, so
 * concurrent requests cannot both claim it. Any insert failure also returns
 * false (falling through to the paid path) rather than granting a second
 * free design.
 */
export async function claimFreeDesign(userId: string): Promise<boolean> {
  try {
    await db().insert(freeDesignUsage).values({ id: getUuid(), userId });
    return true;
  } catch {
    return false;
  }
}

/** Give the claim back when the generation itself failed. */
export async function releaseFreeDesign(userId: string): Promise<void> {
  await db().delete(freeDesignUsage).where(eq(freeDesignUsage.userId, userId));
}
