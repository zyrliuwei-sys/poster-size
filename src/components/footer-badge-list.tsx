import { getRouteApi } from '@tanstack/react-router';
import { DEFAULT_FOOTER_BADGES } from '@/features/footer-badges/defaults';
import { parseStoredFooterBadges } from '@/features/footer-badges/validation';

import { cn } from '@/lib/utils';
import { usePublicConfig } from '@/hooks/use-public-config';
import { FooterBadgeLink } from '@/components/footer-badge-link';

const rootRoute = getRouteApi('__root__');

export function FooterBadgeList({ className }: { className?: string }) {
  const { data } = usePublicConfig();
  const ssrStored = rootRoute.useLoaderData({ select: (d) => d.footerBadges });
  const stored = data ? data.footer_badges : (ssrStored ?? undefined);
  const badges =
    stored === undefined
      ? DEFAULT_FOOTER_BADGES
      : parseStoredFooterBadges(stored);

  if (badges.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-4', className)}>
      {badges.map((badge) => (
        <FooterBadgeLink
          key={`${badge.href}:${badge.src}`}
          badge={badge}
          className="inline-flex max-w-full transition-opacity hover:opacity-80"
          imageClassName="h-auto max-w-full"
        />
      ))}
    </div>
  );
}
