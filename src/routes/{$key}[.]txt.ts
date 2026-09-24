import { createFileRoute } from '@tanstack/react-router';

import { getStoredIndexNowApiKey } from '@/modules/indexnow/service';

async function GET({
  params,
  request,
}: {
  params: { key?: string };
  request: Request;
}) {
  const pathname = new URL(request.url).pathname;
  const pathKey =
    pathname.startsWith('/') &&
    pathname.endsWith('.txt') &&
    !pathname.slice(1).includes('/')
      ? decodeURIComponent(pathname.slice(1, -4))
      : undefined;
  const requestedKey = params.key || pathKey;
  const storedKey = await getStoredIndexNowApiKey();
  if (!storedKey || requestedKey !== storedKey) {
    return new Response('Not found', {
      status: 404,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  }

  return new Response(storedKey, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

export const Route = createFileRoute('/{$key}.txt')({
  server: { handlers: { GET } },
});
