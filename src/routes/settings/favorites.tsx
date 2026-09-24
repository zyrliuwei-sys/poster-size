import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type { PosterSizeItem } from '@/types/poster-size';
import { ArrowUpRight, Heart, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Link, useRouter } from '@/core/i18n/navigation';
import { apiGet, apiPost } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';

function FavoritesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['poster-favorites'],
    queryFn: () => apiGet<PosterSizeItem[]>('/api/poster-sizes/favorites'),
  });
  const removeMutation = useMutation({
    mutationFn: (posterSizeId: string) =>
      apiPost<{ favorited: boolean }>('/api/poster-sizes/favorites', {
        posterSizeId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poster-favorites'] });
      queryClient.invalidateQueries({ queryKey: ['poster-sizes'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (query.isPending) {
    return (
      <div className="ps-settings-page ps-settings-state">
        <LoaderCircle className="ps-spin" size={22} />
      </div>
    );
  }

  return (
    <div className="ps-settings-page">
      <div className="ps-settings-head">
        <div>
          <h1>{m['settings.favorites.title']()}</h1>
          <p>{m['settings.favorites.description']()}</p>
        </div>
        <Link href="/size-guide" className="ps-primary-button">
          {m['settings.favorites.browse']()}
          <span aria-hidden="true">↗</span>
        </Link>
      </div>

      {query.isError ? (
        <div className="ps-inline-state">
          <p>{m['poster.catalogue.load_error']()}</p>
          <button type="button" onClick={() => query.refetch()}>
            {m['poster.catalogue.retry']()}
          </button>
        </div>
      ) : query.data?.length ? (
        <div className="ps-card-grid">
          {query.data.map((item) => (
            <article className="ps-size-card" key={item.id}>
              <div className="ps-size-card-topline">
                <span>{item.category}</span>
                <button
                  type="button"
                  className="ps-favorite-button is-favorite"
                  aria-label={m['settings.favorites.remove']()}
                  onClick={() => removeMutation.mutate(item.id)}
                  disabled={removeMutation.isPending}
                >
                  <Heart size={17} fill="currentColor" />
                </button>
              </div>
              <div className="ps-size-preview">
                <div
                  className="ps-preview-sheet"
                  style={{ aspectRatio: `${item.width} / ${item.height}` }}
                >
                  <span>{item.name}</span>
                  <small>{item.aspectRatio}</small>
                </div>
              </div>
              <div className="ps-size-card-body">
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    {item.width} × {item.height} {item.unit}
                  </p>
                </div>
                <div className="ps-size-card-footer">
                  <span>{item.region}</span>
                  <ArrowUpRight size={17} aria-hidden="true" />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="ps-empty-card">
          <Heart size={20} />
          <p>{m['settings.favorites.empty']()}</p>
          <button type="button" onClick={() => router.push('/size-guide')}>
            {m['settings.favorites.browse']()}
          </button>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute('/settings/favorites')({
  component: FavoritesPage,
});
