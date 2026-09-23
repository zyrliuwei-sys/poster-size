'use client';

import { Sparkles } from 'lucide-react';

import { m } from '@/paraglide/messages.js';

type RoomKey =
  | 'living'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'dining'
  | 'office';
type StyleKey =
  | 'modern'
  | 'minimalist'
  | 'scandinavian'
  | 'japandi'
  | 'bohemian'
  | 'coastal'
  | 'midcentury';

interface Work {
  src: string;
  room: RoomKey;
  style: StyleKey;
  featured?: boolean;
}

/** Intrinsic sizes — demo AVIFs are 1376×768, generated PNGs 886×665. */
const dimsFor = (src: string) =>
  src.endsWith('.avif')
    ? { width: 1376, height: 768 }
    : { width: 886, height: 665 };

const WORKS: Work[] = [
  {
    src: '/imgs/demo/livingRoom-modern.avif',
    room: 'living',
    style: 'modern',
    featured: true,
  },
  {
    src: '/imgs/demo/bedroom-scandinavian.avif',
    room: 'bedroom',
    style: 'scandinavian',
  },
  {
    src: '/imgs/generated/work-kitchen-scandinavian.png',
    room: 'kitchen',
    style: 'scandinavian',
  },
  {
    src: '/imgs/demo/diningRoom-modern.avif',
    room: 'dining',
    style: 'modern',
  },
  {
    src: '/imgs/demo/livingRoom-minimalist.avif',
    room: 'living',
    style: 'minimalist',
  },
  { src: '/imgs/demo/bedroom-modern.avif', room: 'bedroom', style: 'modern' },
  {
    src: '/imgs/generated/work-office-japandi.png',
    room: 'office',
    style: 'japandi',
  },
  {
    src: '/imgs/demo/livingRoom-scandinavian.avif',
    room: 'living',
    style: 'scandinavian',
  },
  {
    src: '/imgs/demo/diningRoom-scandinavian.avif',
    room: 'dining',
    style: 'scandinavian',
  },
  {
    src: '/imgs/generated/work-bathroom-modern.png',
    room: 'bathroom',
    style: 'modern',
  },
  {
    src: '/imgs/demo/bedroom-minimalist.avif',
    room: 'bedroom',
    style: 'minimalist',
  },
  {
    src: '/imgs/demo/diningRoom-minimalist.avif',
    room: 'dining',
    style: 'minimalist',
  },
];

/** Broadcast a work's room + style to the studio (listened in DesignStudio). */
function applyLook(work: Work) {
  window.dispatchEvent(
    new CustomEvent('design:apply-look', {
      detail: { room: work.room, style: work.style },
    })
  );
}

/**
 * Works showcase. Tapping a work loads its
 * room + style into the studio above.
 */
export function Showcase() {
  return (
    <section className="bg-background px-4 py-24 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-[44rem] text-center sm:mb-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl sm:leading-[1.1]">
            {m['create.showcase.title']()}
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-[34rem] text-base leading-7 text-balance sm:text-lg sm:leading-8">
            {m['create.showcase.subtitle']()}
          </p>
        </div>

        <div
          className="relative left-1/2 flex w-screen -translate-x-1/2 snap-x snap-mandatory gap-4 overflow-x-auto px-0 pb-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="list"
          aria-label={m['create.showcase.title']()}
        >
          {WORKS.map((work, index) => (
            <figure
              key={work.src}
              role="listitem"
              className={`group bg-muted relative isolate h-[20rem] w-[82vw] shrink-0 snap-start overflow-hidden rounded-[1.5rem] shadow-[0_8px_30px_-18px_rgb(0_0_0_/_0.28)] transition-shadow duration-500 focus-within:shadow-[0_16px_38px_-18px_rgb(0_0_0_/_0.42)] hover:shadow-[0_16px_38px_-18px_rgb(0_0_0_/_0.42)] sm:h-[25rem] sm:w-[23rem] lg:h-[28rem] ${work.featured ? 'sm:w-[34rem] lg:w-[39rem]' : ''}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={work.src}
                alt={`${m[`create.room.${work.room}` as 'create.room.living']()} · ${m[`create.style.${work.style}` as 'create.style.modern']()}`}
                {...dimsFor(work.src)}
                loading={index < 2 ? 'eager' : 'lazy'}
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-[1.045] motion-reduce:transition-none"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0 opacity-80" />
              <figcaption className="pointer-events-none absolute inset-x-4 bottom-4 z-10">
                <span className="inline-flex rounded-full bg-black/70 px-3 py-1.5 text-[11px] leading-none font-medium text-white shadow-sm backdrop-blur-md">
                  {m[`create.room.${work.room}` as 'create.room.living']()} ·{' '}
                  {m[`create.style.${work.style}` as 'create.style.modern']()}
                </span>
              </figcaption>
              <button
                type="button"
                onClick={() => applyLook(work)}
                aria-label={m['create.showcase.try']()}
                className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30 focus-visible:bg-black/30 focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:outline-none focus-visible:ring-inset"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-medium text-neutral-900 opacity-100 shadow-lg backdrop-blur-md transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
                  <Sparkles className="size-3.5 text-[#0071e3]" />
                  {m['create.showcase.try']()}
                </span>
              </button>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
