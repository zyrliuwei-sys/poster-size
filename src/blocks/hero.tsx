import { ChevronRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';

const BRAND_LOGOS = [
  { src: '/imgs/brands/ikea_logo.svg', alt: 'IKEA' },
  { src: '/imgs/brands/wayfair_logo_hq.webp', alt: 'Wayfair' },
  { src: '/imgs/brands/amazon_logo.svg', alt: 'Amazon' },
  { src: '/imgs/brands/potterybarn_logo_sm.webp', alt: 'Pottery Barn' },
  { src: '/imgs/brands/westelm_logo.svg', alt: 'West Elm' },
  { src: '/imgs/brands/costco_logo.webp', alt: 'Costco' },
  { src: '/imgs/brands/walmart_logo.svg', alt: 'Walmart' },
  { src: '/imgs/brands/roomstogo_logo.webp', alt: 'Rooms To Go' },
  { src: '/imgs/brands/ashley_logo.svg', alt: 'Ashley' },
];

/**
 * Apple-style hero — centered headline, pill CTA, full-width product video.
 */
export function Hero() {
  return (
    <section className="bg-background px-4 pt-16 pb-20 sm:pt-24">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          {m['landing.hero.badge']()}
        </p>
        <h1 className="mt-4 text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
          {m['landing.hero.headline']()}
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-balance sm:text-xl">
          {m['landing.hero.subheadline']()}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/room-design"
            className="bg-primary rounded-full px-8 py-3 text-lg font-medium text-white shadow-lg transition-all hover:bg-[#0077ed] hover:shadow-xl"
          >
            {m['landing.hero.cta']()}
          </Link>
          <Link
            href="/#how"
            className="text-primary inline-flex items-center gap-1 text-lg transition-colors hover:underline"
          >
            {m['landing.hero.cta_secondary']()}
            <ChevronRight className="size-5" />
          </Link>
        </div>

        <p className="text-muted-foreground mt-6 text-sm">
          {m['landing.hero.trust']()}
        </p>
      </div>

      {/* Product video */}
      <div className="mx-auto mt-14 max-w-5xl px-0 sm:px-6">
        <div className="overflow-hidden rounded-none shadow-2xl sm:rounded-[28px]">
          <video
            src="/imgs/hero/loft.mp4"
            poster="/imgs/hero/loft-poster.webp"
            autoPlay
            muted
            loop
            playsInline
            className="aspect-video w-full object-cover"
          />
        </div>
      </div>

      {/* Brand strip */}
      <div className="mx-auto mt-16 max-w-6xl">
        <p className="text-muted-foreground mb-6 text-center text-xs tracking-wide uppercase">
          {m['landing.hero.brands']()}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {BRAND_LOGOS.map((b) => (
            <img
              key={b.alt}
              src={b.src}
              alt={b.alt}
              className="h-6 max-w-24 object-contain opacity-60 grayscale transition-opacity hover:opacity-100 sm:h-7"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
