'use client';

import { useCallback, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';

const GALLERY = [
  { src: '/imgs/demo/bedroom-modern.avif', room: 'bedroom', style: 'modern' },
  {
    src: '/imgs/demo/diningRoom-scandinavian.avif',
    room: 'dining',
    style: 'scandinavian',
  },
  {
    src: '/imgs/demo/livingRoom-minimalist.avif',
    room: 'living',
    style: 'minimalist',
  },
  {
    src: '/imgs/demo/livingRoom-scandinavian.avif',
    room: 'living',
    style: 'scandinavian',
  },
  {
    src: '/imgs/demo/bedroom-minimalist.avif',
    room: 'bedroom',
    style: 'minimalist',
  },
  {
    src: '/imgs/demo/diningRoom-modern.avif',
    room: 'dining',
    style: 'modern',
  },
] as const;

/** Draggable before/after comparison slider. */
function BeforeAfterSlider({
  before,
  after,
}: {
  before: string;
  after: string;
}) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const update = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  return (
    <div
      ref={ref}
      className="relative aspect-[16/10] w-full cursor-ew-resize touch-none overflow-hidden rounded-[28px] shadow-xl select-none sm:rounded-[36px]"
      onPointerDown={(e) => {
        dragging.current = true;
        try {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        } catch {
          // pointer already gone — drag still works via container events
        }
        update(e.clientX);
      }}
      onPointerMove={(e) => {
        if (dragging.current) update(e.clientX);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
    >
      <img
        src={after}
        alt={m['landing.gallery.after']()}
        width={1376}
        height={768}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <img
        src={before}
        alt={m['landing.gallery.before']()}
        width={1376}
        height={768}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        draggable={false}
      />

      {/* Handle */}
      <div
        className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.4)]"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg">
          <svg viewBox="0 0 24 24" className="size-5 fill-neutral-800">
            <path d="M8.5 5 3 12l5.5 7v-4.5h7V19l5.5-7-5.5-7v4.5h-7V5Z" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <span className="absolute top-4 left-4 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
        {m['landing.gallery.before']()}
      </span>
      <span className="absolute top-4 right-4 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
        {m['landing.gallery.after']()}
      </span>
    </div>
  );
}

/**
 * Gallery — featured before/after slider plus a grid of real results.
 */
export function Gallery() {
  return (
    <section id="gallery" className="bg-background px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {m['landing.gallery.title']()}
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            {m['landing.gallery.subtitle']()}
          </p>
        </div>

        <BeforeAfterSlider
          before="/imgs/demo/before-empty.avif"
          after="/imgs/demo/livingRoom-modern.avif"
        />

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GALLERY.map((item) => (
            <figure
              key={item.src}
              className="group relative overflow-hidden rounded-2xl"
            >
              <img
                src={item.src}
                alt=""
                width={1376}
                height={768}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <figcaption className="absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                {m[`landing.try.room.${item.room}` as const]()} ·{' '}
                {m[`landing.try.style.${item.style}` as const]()}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
