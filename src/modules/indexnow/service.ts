/**
 * IndexNow — push changed URLs to Bing, Yandex, Naver, Seznam, … in one call.
 *
 * The key lives in the DB config table (`indexnow_key`, set at /admin/indexnow)
 * and is served at `/{key}.txt` (src/routes/{$key}[.]txt.ts) so search
 * engines can verify the site owns it.
 * Spec: https://www.indexnow.org/documentation
 *
 * The key-file check and sitemap reading run in the admin's browser: a
 * Cloudflare Worker can't fetch its own custom domain (HTTP 522).
 */

import { eq, inArray } from 'drizzle-orm';

import { db } from '@/core/db';
import { envConfigs } from '@/config';
import { config } from '@/config/db/schema';
import { decryptSecret, encryptSecret } from '@/lib/crypto';

export const INDEXNOW_CONFIG_KEY = 'indexnow_key';
// The old deployment published this key. Keep its verification URL working
// until an administrator saves a replacement; it is no longer locked in code.
const LEGACY_DEFAULT_KEY = '4c7f4e7d194d46498fb7775716c95d68';
// Tried in order. Submissions are shared between engines, so one success is
// enough; the next is only tried on an error such as 429 (Workers egress IPs
// are shared and can be rate-limited by one endpoint but not another).
export const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
];
const MAX_URLS_PER_POST = 10_000;

/** 8–128 chars of a-z, A-Z, 0-9 and dashes. */
export function isValidIndexNowKey(key: string) {
  return /^[a-zA-Z0-9-]{8,128}$/.test(key);
}

export async function getIndexNowKey() {
  const rows = await db()
    .select({ name: config.name, value: config.value })
    .from(config)
    .where(inArray(config.name, [INDEXNOW_CONFIG_KEY, 'indexnow_api_key']));
  for (const name of [INDEXNOW_CONFIG_KEY, 'indexnow_api_key']) {
    const stored = rows.find(
      (row: { name: string }) => row.name === name
    )?.value;
    if (!stored) continue;
    const key = (await decryptSecret(stored))?.trim();
    if (key && isValidIndexNowKey(key)) return key;
  }
  return LEGACY_DEFAULT_KEY;
}

export async function saveIndexNowKey(key: string) {
  key = key.trim();
  if (!isValidIndexNowKey(key)) throw new Error('Invalid IndexNow key');
  const value = await encryptSecret(key);
  await db().transaction(async (tx: ReturnType<typeof db>) => {
    const [existing] = await tx
      .select({ name: config.name })
      .from(config)
      .where(eq(config.name, INDEXNOW_CONFIG_KEY))
      .limit(1);
    if (existing) {
      await tx
        .update(config)
        .set({ value })
        .where(eq(config.name, INDEXNOW_CONFIG_KEY));
    } else {
      await tx.insert(config).values({ name: INDEXNOW_CONFIG_KEY, value });
    }
  });
}

export function siteOrigin() {
  return new URL(envConfigs.app_url).origin;
}

export function keyFileUrl(key: string) {
  return `${siteOrigin()}/${key}.txt`;
}

const MEANINGS: Record<number, string> = {
  200: 'OK — URLs submitted',
  202: 'Accepted — key validation pending',
  400: 'Bad request — invalid format',
  403: 'Forbidden — key not valid (key file missing or wrong content)',
  422: "Unprocessable — URLs don't belong to this host or key doesn't match",
  429: 'Too many requests — slow down',
};

/**
 * Submit URLs (must be on this site's host). Splits into 10k batches.
 * Returns one result per batch with the engine's status code.
 */
export async function submitUrls(key: string, urls: string[]) {
  if (!isValidIndexNowKey(key)) throw new Error('Invalid IndexNow key');
  const origin = siteOrigin();
  const host = new URL(origin).host;
  const list = [...new Set(urls.map((u) => u.trim()).filter(Boolean))];
  const foreign = list.filter((u) => {
    try {
      const url = new URL(u);
      return (
        !['http:', 'https:'].includes(url.protocol) ||
        url.host !== host ||
        Boolean(url.username || url.password)
      );
    } catch {
      return true;
    }
  });
  if (foreign.length) {
    throw new Error(
      `URLs must be on ${host}: ${foreign.slice(0, 3).join(', ')}`
    );
  }
  if (!list.length) throw new Error('No URLs to submit');

  const results = [];
  for (let i = 0; i < list.length; i += MAX_URLS_PER_POST) {
    const batch = list.slice(i, i + MAX_URLS_PER_POST);
    const body = JSON.stringify({
      host,
      key,
      keyLocation: keyFileUrl(key),
      urlList: batch,
    });
    const attempts: { endpoint: string; status: number; meaning: string }[] =
      [];
    for (const endpoint of INDEXNOW_ENDPOINTS) {
      let status = 0;
      let meaning: string;
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body,
          signal: AbortSignal.timeout(15_000),
        });
        status = res.status;
        meaning = MEANINGS[status] ?? (await res.text()).slice(0, 200);
      } catch (error) {
        meaning = error instanceof Error ? error.message : 'Network error';
      }
      attempts.push({ endpoint: new URL(endpoint).host, status, meaning });
      if (status === 200 || status === 202) break;
      // A bad request or key won't get better on another engine.
      if (status === 400 || status === 403 || status === 422) break;
    }
    const last = attempts[attempts.length - 1];
    results.push({
      ok: last.status === 200 || last.status === 202,
      count: batch.length,
      attempts,
    });
  }
  return results;
}

/** Preserve existing article notifications without making publishing fail. */
export async function notifyIndexNow(
  _origin: string,
  urls: string[]
): Promise<void> {
  try {
    const rows = await db()
      .select({ name: config.name, value: config.value })
      .from(config)
      .where(
        inArray(config.name, ['indexnow_enabled', 'indexnow_auto_submit'])
      );
    if (rows.some((row: { value: string | null }) => row.value === '0')) return;
    const key = await getIndexNowKey();
    if (!key) return;
    // Use the configured public origin, including when the admin is on a preview URL.
    const canonicalUrls = urls.map((url) => {
      const parsed = new URL(url);
      return new URL(parsed.pathname + parsed.search, siteOrigin()).href;
    });
    const results = await submitUrls(key, canonicalUrls);
    if (results.some((result) => !result.ok)) {
      console.warn('[indexnow] article notification rejected', results);
    }
  } catch (error) {
    console.warn(
      '[indexnow] article notification failed:',
      error instanceof Error ? error.message : error
    );
  }
}
