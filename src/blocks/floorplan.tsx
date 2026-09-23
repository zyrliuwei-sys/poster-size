import { ArrowRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';

/**
 * Floorplan — dark Apple-style feature section with input/output pair.
 */
export function Floorplan() {
  return (
    <section id="floorplan" className="bg-black px-4 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-sm font-semibold tracking-wide text-[#2997ff] uppercase">
            {m['landing.floorplan.eyebrow']()}
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
            {m['landing.floorplan.title']()}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-neutral-400">
            {m['landing.floorplan.desc']()}
          </p>
          <Link
            href="/sign-up"
            className="mt-8 inline-flex items-center gap-1 text-lg text-[#2997ff] transition-colors hover:underline"
          >
            {m['landing.floorplan.cta']()}
            <ArrowRight className="size-5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="overflow-hidden rounded-2xl">
            <img
              src="/imgs/floorplan/start.jpg"
              alt="Floorplan"
              width={3704}
              height={1976}
              loading="lazy"
              decoding="async"
              className="aspect-[3/4] w-full object-cover"
            />
          </div>
          <div className="overflow-hidden rounded-2xl shadow-2xl">
            <img
              src="/imgs/floorplan/after.jpg"
              alt="3D visualization"
              width={1024}
              height={585}
              loading="lazy"
              decoding="async"
              className="aspect-[3/4] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
