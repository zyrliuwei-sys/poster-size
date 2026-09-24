import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import {
  getDesignHistoryItem,
  listDesignHistory,
} from '@/modules/design/service';
import { respData, respErr } from '@/lib/resp';

async function getUser(request: Request) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user;
}

/** GET /api/design-history — list the signed-in user's saved room designs. */
async function GET({ request }: { request: Request }) {
  try {
    const user = await getUser(request);
    if (!user) return respErr('Unauthorized');

    const url = new URL(request.url);
    const downloadId = url.searchParams.get('download');
    if (!downloadId) {
      return respData(await listDesignHistory(user.id));
    }

    const item = await getDesignHistoryItem({
      userId: user.id,
      id: downloadId,
    });
    if (!item) return respErr('Design not found');

    const imageUrl = new URL(item.imageUrl, request.url);
    if (!['http:', 'https:'].includes(imageUrl.protocol)) {
      return respErr('Design download is unavailable');
    }

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return respErr('Design image is no longer available');
    }

    const contentType =
      imageResponse.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      return respErr('Design image is invalid');
    }

    return new Response(imageResponse.body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="poster-size-design-${item.id}.jpg"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (e: any) {
    console.error('get design history failed:', e);
    return respErr(e?.message || 'get design history failed');
  }
}

export const Route = createFileRoute('/api/design-history')({
  server: {
    handlers: { GET },
  },
});
