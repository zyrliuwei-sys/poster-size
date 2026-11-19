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
    <div
      className={cn(
        'footer-badge-marquee',
        badges.length > 1 && 'footer-badge-marquee-animated',
        className
      )}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          event.currentTarget.scrollLeft = 0;
        }
      }}
    >
      <div
        className="footer-badge-track"
        style={{ animationDuration: `${Math.max(24, badges.length * 4)}s` }}
      >
        {Array.from({ length: badges.length > 1 ? 2 : 1 }, (_, copy) => (
          <div
            key={copy}
            className={cn(
              'footer-badge-group',
              copy === 1 && 'footer-badge-group-copy'
            )}
            aria-hidden={copy === 1 || undefined}
          >
            {badges.map((badge, index) => (
              <FooterBadgeLink
                key={`${badge.href}:${badge.src}:${index}`}
                badge={badge}
                hidden={copy === 1}
                className="footer-badge-link"
                imageClassName="footer-badge-image"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
