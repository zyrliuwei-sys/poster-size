import { createServerFn } from '@tanstack/react-start';
import type { PosterSizeItem } from '@/types/poster-size';

/**
 * The catalogue is part of the page's SEO content, so fetch it in the route
 * loader instead of waiting for the browser-only query to finish.
 */
export const getPublishedPosterSizes = createServerFn({
  method: 'GET',
}).handler(async (): Promise<PosterSizeItem[]> => {
  const { listPublished } = await import('@/modules/poster-sizes/service');
  const rows = await listPublished({});

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    region: row.region,
    width: row.width,
    height: row.height,
    unit: row.unit,
    aspectRatio: row.aspectRatio,
    description: row.description,
    sortOrder: row.sortOrder,
    status: row.status,
  }));
});
