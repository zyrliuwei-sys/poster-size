import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import * as posterSizes from '@/modules/poster-sizes/service';
import { respData, respErr } from '@/lib/resp';

async function getUser(request: Request) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user;
}

async function GET({ request }: { request: Request }) {
  try {
    const user = await getUser(request);
    if (!user) return respErr('Unauthorized');
    return respData(await posterSizes.listFavorites(user.id));
  } catch (error: any) {
    return respErr(error.message || 'Could not load favourites');
  }
}

async function POST({ request }: { request: Request }) {
  try {
    const user = await getUser(request);
    if (!user) return respErr('Unauthorized');
    const body = await request.json();
    if (!body?.posterSizeId || typeof body.posterSizeId !== 'string') {
      return respErr('posterSizeId is required');
    }
    return respData(
      await posterSizes.toggleFavorite({
        userId: user.id,
        posterSizeId: body.posterSizeId,
      })
    );
  } catch (error: any) {
    return respErr(error.message || 'Could not update favourite');
  }
}

async function DELETE({ request }: { request: Request }) {
  try {
    const user = await getUser(request);
    if (!user) return respErr('Unauthorized');
    const url = new URL(request.url);
    const posterSizeId = url.searchParams.get('posterSizeId');
    if (!posterSizeId) return respErr('posterSizeId is required');
    const result = await posterSizes.removeFavorite({
      userId: user.id,
      posterSizeId,
    });
    return respData(result);
  } catch (error: any) {
    return respErr(error.message || 'Could not update favourite');
  }
}

export const Route = createFileRoute('/api/poster-sizes/favorites')({
  server: {
    handlers: { GET, POST, DELETE },
  },
});
