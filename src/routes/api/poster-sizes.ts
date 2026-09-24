import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import * as posterSizes from '@/modules/poster-sizes/service';
import { respData, respErr } from '@/lib/resp';

async function getOptionalUser(request: Request) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user;
}

async function GET({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);
    const items = await posterSizes.listPublished({
      search: url.searchParams.get('search') || undefined,
      category: url.searchParams.get('category') || undefined,
    });
    const user = await getOptionalUser(request);
    const favoriteIds = user ? await posterSizes.getFavoriteIds(user.id) : [];
    return respData({ items, favoriteIds, total: items.length });
  } catch (error: any) {
    return respErr(error.message || 'Could not load poster sizes');
  }
}

export const Route = createFileRoute('/api/poster-sizes')({
  server: {
    handlers: { GET },
  },
});
