import { ArrowRight, ChevronRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { DesignStudio } from '@/blocks/design-studio';

/** Real before/after pairs and results — all generated from single photos. */
const FEATURED_RESULT = {
  before: '/imgs/demo/before-empty.avif',
  after: '/imgs/demo/livingRoom-modern.avif',
};

const RESULT_THUMBS = [
  { src: '/imgs/demo/bedroom-scandinavian.avif', width: 1376, height: 768 },
  {
    src: '/imgs/generated/work-kitchen-scandinavian.png',
    width: 886,
    height: 665,
  },
  { src: '/imgs/demo/diningRoom-minimalist.avif', width: 1376, height: 768 },
] as const;

/**
 * Apple-style hero — headline, studio in the first screen, then the
 * product video and a strip of real before/after results.
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

      {/* The studio itself — upload and design without leaving the page */}
      <DesignStudio />

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
            preload="none"
            className="aspect-video w-full object-cover"
          />
        </div>
      </div>

      {/* Real results strip — replaces the third-party brand logos */}
      <div className="mx-auto mt-16 max-w-6xl">
        <p className="text-muted-foreground mb-6 text-center text-xs tracking-wide uppercase">
          {m['landing.hero.results_label']()}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <Link
            href="/#gallery"
            className="group flex items-center gap-2"
            aria-label={m['landing.hero.results_label']()}
          >
            <img
              src={FEATURED_RESULT.before}
              alt={m['landing.gallery.before']()}
              width={1376}
              height={768}
              loading="lazy"
              decoding="async"
              className="h-20 w-32 rounded-xl object-cover grayscale transition-transform duration-500 group-hover:scale-[1.03] sm:h-24 sm:w-40"
            />
            <ArrowRight className="text-muted-foreground size-4 shrink-0" />
            <img
              src={FEATURED_RESULT.after}
              alt={m['landing.gallery.after']()}
              width={1376}
              height={768}
              loading="lazy"
              decoding="async"
              className="h-20 w-32 rounded-xl object-cover shadow-md transition-transform duration-500 group-hover:scale-[1.03] sm:h-24 sm:w-40"
            />
          </Link>
          {RESULT_THUMBS.map((t) => (
            <Link
              key={t.src}
              href="/#gallery"
              aria-label={m['landing.hero.results_label']()}
            >
              <img
                src={t.src}
                alt={m['landing.gallery.after']()}
                width={t.width}
                height={t.height}
                loading="lazy"
                decoding="async"
                className="h-20 w-32 rounded-xl object-cover shadow-md transition-transform duration-500 hover:scale-[1.03] sm:h-24 sm:w-40"
              />
            </Link>
          ))}
        </div>
        <p className="text-muted-foreground mt-6 text-center text-sm">
          {m['landing.hero.results_hint']()}
        </p>
      </div>
    </section>
  );
}
