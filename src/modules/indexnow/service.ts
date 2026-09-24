import { eq, inArray } from 'drizzle-orm';

import { db } from '@/core/db';
import { config } from '@/config/db/schema';
import { decryptSecret, encryptSecret, isEncryptedSecret } from '@/lib/crypto';

const API_KEY_CONFIG = 'indexnow_api_key';
const ENABLED_CONFIG = 'indexnow_enabled';
const AUTO_SUBMIT_CONFIG = 'indexnow_auto_submit';
const LAST_SUBMITTED_AT_CONFIG = 'indexnow_last_submitted_at';
const LAST_SUBMITTED_COUNT_CONFIG = 'indexnow_last_submitted_count';
const LAST_ERROR_CONFIG = 'indexnow_last_error';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_URLS_PER_REQUEST = 10_000;
const CONFIG_NAMES = [
  API_KEY_CONFIG,
  ENABLED_CONFIG,
  AUTO_SUBMIT_CONFIG,
  LAST_SUBMITTED_AT_CONFIG,
  LAST_SUBMITTED_COUNT_CONFIG,
  LAST_ERROR_CONFIG,
] as const;

type StoredSettings = {
  apiKey?: string;
  enabled: boolean;
  autoSubmit: boolean;
  lastSubmittedAt: string | null;
  lastSubmittedCount: number;
  lastError: string | null;
};

async function readConfig(
  name: string,
  secret = false
): Promise<string | undefined> {
  const [row] = await db()
    .select({ value: config.value })
    .from(config)
    .where(eq(config.name, name))
    .limit(1);

  const value = row?.value;
  if (typeof value !== 'string' || value.length === 0) return undefined;
  if (!secret || !isEncryptedSecret(value)) return value;
  return (await decryptSecret(value)) ?? undefined;
}

async function upsertConfigs(entries: Array<[string, string]>) {
  await db().transaction(async (tx: any) => {
    for (const [name, value] of entries) {
      const [existing] = await tx
        .select({ name: config.name })
        .from(config)
        .where(eq(config.name, name))
        .limit(1);

      if (existing) {
        await tx.update(config).set({ value }).where(eq(config.name, name));
      } else {
        await tx.insert(config).values({ name, value });
      }
    }
  });
}

async function getStoredSettings(): Promise<StoredSettings> {
  const rows = await db()
    .select({ name: config.name, value: config.value })
    .from(config)
    .where(inArray(config.name, CONFIG_NAMES));
  const values = new Map<string, string | undefined>(
    rows.map((row: { name: string; value: string | null }) => [
      row.name,
      row.value ?? undefined,
    ])
  );
  const encryptedApiKey = values.get(API_KEY_CONFIG);
  const apiKey = encryptedApiKey
    ? isEncryptedSecret(encryptedApiKey)
      ? ((await decryptSecret(encryptedApiKey)) ?? undefined)
      : encryptedApiKey
    : undefined;
  const enabled = values.get(ENABLED_CONFIG);
  const autoSubmit = values.get(AUTO_SUBMIT_CONFIG);
  const lastSubmittedAt = values.get(LAST_SUBMITTED_AT_CONFIG);
  const lastSubmittedCount = values.get(LAST_SUBMITTED_COUNT_CONFIG);
  const lastError = values.get(LAST_ERROR_CONFIG);

  return {
    apiKey: apiKey || undefined,
    enabled: enabled !== '0',
    autoSubmit: autoSubmit !== '0',
    lastSubmittedAt: lastSubmittedAt || null,
    lastSubmittedCount: Number.parseInt(lastSubmittedCount || '0', 10) || 0,
    lastError: lastError || null,
  };
}

export function getIndexNowKeyLocation(origin: string, apiKey: string): string {
  return new URL(`/${apiKey}.txt`, origin).href;
}

export async function getStoredIndexNowApiKey(): Promise<string | undefined> {
  return readConfig(API_KEY_CONFIG, true);
}

export async function getIndexNowSettings(origin: string) {
  const stored = await getStoredSettings();
  return {
    configured: Boolean(stored.apiKey),
    enabled: stored.enabled,
    autoSubmit: stored.autoSubmit,
    apiKeyMasked: stored.apiKey ? `••••••••${stored.apiKey.slice(-4)}` : null,
    keyLocation: stored.apiKey
      ? getIndexNowKeyLocation(origin, stored.apiKey)
      : null,
    lastSubmittedAt: stored.lastSubmittedAt,
    lastSubmittedCount: stored.lastSubmittedCount,
    lastError: stored.lastError,
  };
}

export async function saveIndexNowSettings(params: {
  apiKey?: string;
  enabled: boolean;
  autoSubmit: boolean;
}) {
  const entries: Array<[string, string]> = [
    [ENABLED_CONFIG, params.enabled ? '1' : '0'],
    [AUTO_SUBMIT_CONFIG, params.autoSubmit ? '1' : '0'],
  ];

  if (params.apiKey !== undefined) {
    entries.push([API_KEY_CONFIG, await encryptSecret(params.apiKey)]);
  }

  await upsertConfigs(entries);
}

async function recordSubmission(params: { count: number; error?: string }) {
  const entries: Array<[string, string]> = [
    [LAST_SUBMITTED_COUNT_CONFIG, String(params.count)],
    [LAST_ERROR_CONFIG, params.error || ''],
  ];
  if (!params.error) {
    entries.push([LAST_SUBMITTED_AT_CONFIG, new Date().toISOString()]);
  }
  await upsertConfigs(entries);
}

function cleanUrls(origin: string, urls: string[]): string[] {
  const host = new URL(origin).host;
  return Array.from(
    new Set(
      urls.filter((value) => {
        try {
          const url = new URL(value);
          return (
            (url.protocol === 'http:' || url.protocol === 'https:') &&
            url.host === host
          );
        } catch {
          return false;
        }
      })
    )
  );
}

export async function submitIndexNowUrls(origin: string, urls: string[]) {
  const stored = await getStoredSettings();
  if (!stored.apiKey) throw new Error('IndexNow API key is not configured');

  const clean = cleanUrls(origin, urls);
  if (clean.length === 0) throw new Error('No URLs from this host were found');

  const keyLocation = getIndexNowKeyLocation(origin, stored.apiKey);
  let submitted = 0;
  let batches = 0;

  try {
    for (let i = 0; i < clean.length; i += MAX_URLS_PER_REQUEST) {
      const urlList = clean.slice(i, i + MAX_URLS_PER_REQUEST);
      const response = await fetch(INDEXNOW_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          host: new URL(origin).host,
          key: stored.apiKey,
          keyLocation,
          urlList,
        }),
      });

      if (!response.ok) {
        const detail = (await response.text()).slice(0, 240);
        if (response.status === 429) {
          throw new Error(
            'IndexNow rate limit reached (429). Bing limits requests from this server; wait before retrying. Automatic retries are disabled to avoid extending the limit.'
          );
        }
        throw new Error(
          `IndexNow rejected the request (${response.status})${detail ? `: ${detail}` : ''}`
        );
      }

      submitted += urlList.length;
      batches += 1;
    }

    await recordSubmission({ count: submitted });
    return { submitted, batches, status: 200 };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'IndexNow request failed';
    await recordSubmission({ count: submitted, error: message });
    throw error;
  }
}

export async function getSitemapUrls(origin: string): Promise<string[]> {
  const response = await fetch(new URL('/sitemap.xml', origin), {
    headers: { Accept: 'application/xml, text/xml' },
  });
  if (!response.ok) {
    throw new Error(`Could not load sitemap (${response.status})`);
  }

  const xml = await response.text();
  const urls = Array.from(xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gim)).map(
    (match) => match[1]
  );
  const alternateUrls = Array.from(
    xml.matchAll(/hreflang="[^"]+"\s+href="([^"]+)"/gim)
  ).map((match) => match[1]);
  return Array.from(new Set([...urls, ...alternateUrls]));
}

export async function submitSitemapUrls(
  origin: string,
  generatedUrls: string[] = []
) {
  const urls =
    generatedUrls.length > 0 ? generatedUrls : await getSitemapUrls(origin);
  return submitIndexNowUrls(origin, urls);
}

export async function verifyIndexNowKey(origin: string) {
  const stored = await getStoredSettings();
  if (!stored.apiKey) throw new Error('IndexNow API key is not configured');

  const keyLocation = getIndexNowKeyLocation(origin, stored.apiKey);
  const verificationUrl = new URL(keyLocation);
  // Bypass any proxy/CDN cache that may still hold a 404 from before setup.
  verificationUrl.searchParams.set('_indexnow_verify', Date.now().toString());
  const response = await fetch(verificationUrl, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' },
  });
  const value = (await response.text()).trim();
  if (!response.ok || value !== stored.apiKey) {
    return {
      ok: false,
      message: `The key file could not be verified at ${keyLocation}`,
    };
  }

  return { ok: true, message: 'The IndexNow key file is reachable and valid' };
}

/** Best-effort notification for content mutations; publishing must not fail if IndexNow is down. */
export async function notifyIndexNow(
  origin: string,
  urls: string[]
): Promise<void> {
  const stored = await getStoredSettings();
  if (!stored.apiKey || !stored.enabled || !stored.autoSubmit) return;

  try {
    await submitIndexNowUrls(origin, urls);
  } catch (error) {
    console.warn(
      '[indexnow] notification failed:',
      error instanceof Error ? error.message : error
    );
  }
}
