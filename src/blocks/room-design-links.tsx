import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';

const RELATED_ROOMS = [
  { key: 'bathroom', href: '/ai-bathroom-design' },
  { key: 'bedroom', href: '/ai-bedroom-design' },
  { key: 'kitchen', href: '/ai-kitchen-design' },
] as const;

export function RoomDesignLinks() {
  return (
    <section className="bg-background px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {m['roompage.related.title']()}
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {RELATED_ROOMS.map(({ key, href }) => (
            <article
              key={key}
              className="rounded-2xl border border-neutral-200 bg-[#f5f5f7] p-5"
            >
              <Link
                href={href}
                className="text-base font-semibold tracking-tight hover:text-[#0071e3]"
              >
                {m[`roompage.${key}.title` as 'roompage.bathroom.title']()}
              </Link>
              <span className="text-muted-foreground mt-1.5 block text-sm leading-relaxed">
                {m[`roompage.${key}.intro` as 'roompage.bathroom.intro']()}
              </span>
            </article>
          ))}
        </div>
        <p className="text-muted-foreground mt-8 text-sm">
          {m['roompage.related.home_before']()}{' '}
          <Link href="/" className="text-primary font-medium hover:underline">
            {m['roompage.related.home_anchor']()}
          </Link>
          {m['roompage.related.home_after']()}
        </p>
      </div>
    </section>
  );
}
