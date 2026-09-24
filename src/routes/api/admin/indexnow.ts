import { createFileRoute } from '@tanstack/react-router';
import { normalizeIndexNowKey } from '@/features/indexnow/validation';
import { STATIC_PATHS } from '@/routes/sitemap[.]xml';

import { getAuth } from '@/core/auth';
import {
  getIndexNowSettings,
  saveIndexNowSettings,
  submitSitemapUrls,
} from '@/modules/indexnow/service';
import * as postsService from '@/modules/posts/service';
import { hasPermission } from '@/modules/rbac/service';
import { respData, respErr } from '@/lib/resp';
import { baseLocale } from '@/paraglide/runtime.js';
import { getLocalPosts, mergePosts, type BlogPost } from '@/content/posts';

const noStore = {
  headers: {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  },
};

function requestOrigin(request: Request) {
  return new URL(request.url).origin;
}

async function generatedSiteUrls(origin: string) {
  const paths = [...STATIC_PATHS];
  const dbPosts: BlogPost[] = [];

  try {
    const posts = await postsService.listPublishedArticles({ limit: 10_000 });
    dbPosts.push(
      ...posts.map((post) => ({
        slug: post.slug,
        title: post.title || post.slug,
        description: post.description || '',
        createdAt: new Date(post.createdAt).toISOString(),
        source: 'db' as const,
      }))
    );
  } catch {
    // Static and local content URLs remain available when the database is offline.
  }

  for (const post of mergePosts(dbPosts, getLocalPosts(baseLocale))) {
    paths.push(`/blog/${encodeURIComponent(post.slug)}`);
  }

  return Array.from(
    new Set(
      paths.flatMap((path) => [
        new URL(path || '/', origin).href,
        new URL(path ? `/zh${path}` : '/zh', origin).href,
      ])
    )
  );
}

async function checkPermission(request: Request, permission: string) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return respErr('Unauthorized', { status: 401 });

  const allowed = await hasPermission(session.user.id, permission);
  if (!allowed) return respErr('Forbidden', { status: 403 });
  return null;
}

async function GET({ request }: { request: Request }) {
  try {
    const denied = await checkPermission(request, 'admin.settings.read');
    if (denied) return denied;
    return respData(await getIndexNowSettings(requestOrigin(request)), noStore);
  } catch (error) {
    return respErr(error instanceof Error ? error.message : 'Internal error');
  }
}

async function POST({ request }: { request: Request }) {
  try {
    const denied = await checkPermission(request, 'admin.settings.write');
    if (denied) return denied;

    const body = await request.json();
    const action = body?.action || 'save';
    const origin = requestOrigin(request);

    if (action === 'save') {
      const hasKey = Object.prototype.hasOwnProperty.call(body, 'apiKey');
      const apiKey = hasKey ? normalizeIndexNowKey(body.apiKey) : undefined;
      const enabled = body.enabled !== false;
      const autoSubmit = body.autoSubmit !== false;

      await saveIndexNowSettings({ apiKey, enabled, autoSubmit });

      return respData(await getIndexNowSettings(origin), noStore);
    }

    if (action === 'submit') {
      return respData(
        await submitSitemapUrls(origin, await generatedSiteUrls(origin)),
        noStore
      );
    }

    return respErr('Unsupported IndexNow action');
  } catch (error) {
    return respErr(error instanceof Error ? error.message : 'Internal error');
  }
}

export const Route = createFileRoute('/api/admin/indexnow')({
  server: { handlers: { GET, POST } },
});
