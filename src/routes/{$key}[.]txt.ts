import { createFileRoute } from '@tanstack/react-router';

import { getStoredIndexNowApiKey } from '@/modules/indexnow/service';

async function GET({ params }: { params: { key: string } }) {
  const storedKey = await getStoredIndexNowApiKey();
  if (!storedKey || params.key !== storedKey) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(storedKey, {
    headers: {
      'Cache-Control': 'public, max-age=300',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

export const Route = createFileRoute('/{$key}.txt')({
  server: { handlers: { GET } },
});
