import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import {
  getIndexNowKey,
  isValidIndexNowKey,
  keyFileUrl,
  saveIndexNowKey,
  submitUrls,
} from '@/modules/indexnow/service';
import { hasPermission } from '@/modules/rbac/service';
import { respData, respErr } from '@/lib/resp';

const noStore = { headers: { 'Cache-Control': 'no-store' } };

// Same permissions as the admin settings page.
async function guard(request: Request, permission: string) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session?.user) return respErr('Unauthorized', { status: 401 });
  if (!(await hasPermission(session.user.id, permission))) {
    return respErr('Forbidden', { status: 403 });
  }
  return null;
}

async function status() {
  const key = await getIndexNowKey();
  return { key, keyFileUrl: key ? keyFileUrl(key) : null };
}

// Current key and its public key-file URL (the page checks it is live).
async function GET({ request }: { request: Request }) {
  try {
    const denied = await guard(request, 'admin.settings.read');
    if (denied) return denied;
    return respData(await status(), noStore);
  } catch (error) {
    return respErr(
      error instanceof Error ? error.message : 'Query failed',
      noStore
    );
  }
}

// Save the key from Bing Webmaster Tools.
async function PUT({ request }: { request: Request }) {
  try {
    const denied = await guard(request, 'admin.settings.write');
    if (denied) return denied;
    const body = await request.json().catch(() => ({}));
    const key = typeof body?.key === 'string' ? body.key.trim() : '';
    if (!isValidIndexNowKey(key)) {
      return respErr('Key must be 8–128 characters: a-z, A-Z, 0-9 or -');
    }
    await saveIndexNowKey(key);
    return respData(await status(), noStore);
  } catch (error) {
    return respErr(
      error instanceof Error ? error.message : 'Save failed',
      noStore
    );
  }
}

// Submit URLs: { urls: [...] }. The page reads sitemap.xml itself and sends
// the list, since the Worker can't fetch its own domain.
async function POST({ request }: { request: Request }) {
  try {
    const denied = await guard(request, 'admin.settings.write');
    if (denied) return denied;
    const key = await getIndexNowKey();
    if (!key) return respErr('Save an IndexNow key first');
    const body = await request.json().catch(() => ({}));
    if (
      !Array.isArray(body?.urls) ||
      !body.urls.every((url: unknown) => typeof url === 'string')
    ) {
      return respErr('URLs must be an array of strings');
    }
    const urls: string[] = body.urls;
    const results = await submitUrls(key, urls);
    const submitted = results.reduce(
      (count, batch) => count + (batch.ok ? batch.count : 0),
      0
    );
    return respData({ submitted, results }, noStore);
  } catch (error) {
    return respErr(
      error instanceof Error ? error.message : 'Submit failed',
      noStore
    );
  }
}

export const Route = createFileRoute('/api/admin/indexnow')({
  server: { handlers: { GET, PUT, POST } },
});
