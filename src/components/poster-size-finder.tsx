import { useDeferredValue, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  PosterSizeItem,
  PosterSizeListResponse,
} from '@/types/poster-size';
import {
  ArrowUpRight,
  Heart,
  LoaderCircle,
  RotateCcw,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

import { useSession } from '@/core/auth/client';
import { useRouter } from '@/core/i18n/navigation';
import { apiGet, apiPost } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';

const categories = ['all', 'print', 'social', 'presentation'] as const;

const previewAssets = {
  portrait: '/imgs/generated/print-portrait-specimen.png',
  square: '/imgs/generated/print-square-specimen.png',
  wide: '/imgs/generated/print-wide-specimen.png',
} as const;

function getPreviewAsset(item: PosterSizeItem) {
  const ratio = item.width / item.height;

  if (ratio > 1.12) return previewAssets.wide;
  if (ratio > 0.88) return previewAssets.square;
  return previewAssets.portrait;
}

export function PosterSizeFinder({
  compact = false,
  initialItems,
}: {
  compact?: boolean;
  initialItems?: PosterSizeItem[];
}) {
  const Heading = compact ? 'h2' : 'h1';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<(typeof categories)[number]>('all');
  const deferredSearch = useDeferredValue(search);
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['poster-sizes', deferredSearch, category],
    queryFn: () => {
      const params = new URLSearchParams();
      if (deferredSearch.trim()) params.set('search', deferredSearch.trim());
      if (category !== 'all') params.set('category', category);
      const queryString = params.toString();
      return apiGet<PosterSizeListResponse>(
        `/api/poster-sizes${queryString ? `?${queryString}` : ''}`
      );
    },
    initialData: initialItems
      ? {
          items: initialItems,
          favoriteIds: [],
          total: initialItems.length,
        }
      : undefined,
    initialDataUpdatedAt: 0,
    staleTime: 60_000,
  });

  const favoriteMutation = useMutation({
    mutationFn: (posterSizeId: string) =>
      apiPost<{ favorited: boolean }>('/api/poster-sizes/favorites', {
        posterSizeId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poster-sizes'] });
      queryClient.invalidateQueries({ queryKey: ['poster-favorites'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const items = query.data?.items ?? [];
  const favoriteIds = useMemo(
    () => new Set(query.data?.favoriteIds ?? []),
    [query.data?.favoriteIds]
  );

  function toggleFavorite(item: PosterSizeItem) {
    if (!session?.user) {
      router.push('/sign-in?callbackUrl=%2Fsize-guide');
      return;
    }
    favoriteMutation.mutate(item.id);
  }

  return (
    <section
      className={`ps-catalogue ${compact ? 'ps-catalogue-compact' : ''}`}
    >
      <div className="ps-catalogue-head">
        <div>
          <p className="ps-eyebrow">{m['poster.catalogue.kicker']()}</p>
          <Heading>
            {compact
              ? m['poster.catalogue.home_title']()
              : m['poster.catalogue.title']()}
          </Heading>
          <p className="ps-catalogue-description">
            {m['poster.catalogue.description']()}
          </p>
        </div>
        <span className="ps-result-count">
          {m['poster.catalogue.result_count']({ count: items.length })}
        </span>
      </div>

      <div className="ps-catalogue-toolbar">
        <label className="ps-search-field">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">{m['poster.catalogue.search']()}</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={m['poster.catalogue.search']()}
            type="search"
          />
        </label>
        <div
          className="ps-filter-tabs"
          role="tablist"
          aria-label={m['poster.catalogue.categories']()}
        >
          {categories.map((item) => {
            const label =
              item === 'all'
                ? m['poster.catalogue.all']()
                : m[`poster.catalogue.${item}` as 'poster.catalogue.print']();
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={category === item}
                className={category === item ? 'is-active' : ''}
                onClick={() => setCategory(item)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {query.isPending ? (
        <div
          className="ps-card-grid"
          aria-label={m['poster.catalogue.loading']()}
        >
          {Array.from({ length: compact ? 6 : 8 }).map((_, index) => (
            <div className="ps-size-card ps-size-card-skeleton" key={index} />
          ))}
        </div>
      ) : query.isError ? (
        <div className="ps-inline-state">
          <p>{m['poster.catalogue.load_error']()}</p>
          <button type="button" onClick={() => query.refetch()}>
            <RotateCcw size={15} /> {m['poster.catalogue.retry']()}
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="ps-inline-state">
          <p>{m['poster.catalogue.no_results']()}</p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setCategory('all');
            }}
          >
            {m['poster.catalogue.reset']()}
          </button>
        </div>
      ) : (
        <div className="ps-card-grid">
          {items.map((item) => {
            const isFavorite = favoriteIds.has(item.id);
            const previewAsset = getPreviewAsset(item);
            return (
              <article
                className="ps-size-card"
                id={compact ? undefined : item.slug}
                key={item.id}
              >
                <div className="ps-size-card-topline">
                  <span>{item.category}</span>
                  <button
                    type="button"
                    className={`ps-favorite-button ${isFavorite ? 'is-favorite' : ''}`}
                    aria-label={
                      isFavorite
                        ? m['poster.catalogue.saved']({ name: item.name })
                        : m['poster.catalogue.save']({ name: item.name })
                    }
                    onClick={() => toggleFavorite(item)}
                    disabled={favoriteMutation.isPending}
                  >
                    {favoriteMutation.isPending &&
                    favoriteMutation.variables === item.id ? (
                      <LoaderCircle size={17} className="ps-spin" />
                    ) : (
                      <Heart
                        size={17}
                        fill={isFavorite ? 'currentColor' : 'none'}
                      />
                    )}
                  </button>
                </div>
                <div className="ps-size-preview">
                  <div
                    className="ps-preview-sheet"
                    style={{ aspectRatio: `${item.width} / ${item.height}` }}
                  >
                    <img
                      className="ps-preview-art"
                      src={previewAsset}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                    />
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
                    <span>
                      {m['poster.catalogue.ratio']({ ratio: item.aspectRatio })}
                    </span>
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {!compact && items.length > 0 ? (
        <div className="ps-size-table-wrap">
          <table className="ps-size-table">
            <caption className="sr-only">
              {m['poster.catalogue.table_caption']()}
            </caption>
            <thead>
              <tr>
                <th scope="col">{m['poster.catalogue.table_name']()}</th>
                <th scope="col">{m['poster.catalogue.table_dimensions']()}</th>
                <th scope="col">{m['poster.catalogue.table_ratio']()}</th>
                <th scope="col">{m['poster.catalogue.table_use']()}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={`table-${item.id}`}>
                  <th scope="row">{item.name}</th>
                  <td>
                    {item.width} × {item.height} {item.unit}
                  </td>
                  <td>{item.aspectRatio}</td>
                  <td>{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
