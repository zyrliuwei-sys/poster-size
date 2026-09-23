import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';

/**
 * Final CTA — Apple-style centered closer.
 */
export function CTA() {
  return (
    <section className="bg-background px-4 py-28 text-center sm:py-36">
      <h2 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
        {m['landing.cta.headline']()}
      </h2>
      <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-lg">
        {m['landing.cta.subheadline']()}
      </p>
      <div className="mt-8">
        <Link
          href="/room-design"
          className="bg-primary inline-block rounded-full px-8 py-3.5 text-lg font-medium text-white shadow-lg transition-all hover:bg-[#0077ed] hover:shadow-xl"
        >
          {m['landing.cta.button']()}
        </Link>
      </div>
    </section>
  );
}
