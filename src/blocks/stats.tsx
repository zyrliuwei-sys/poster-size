import { m } from '@/paraglide/messages.js';

const STATS = [
  { value: '754,000+', key: 'rooms' },
  { value: '213,000+', key: 'users' },
  { value: '25+', key: 'styles' },
  { value: '55+', key: 'countries' },
] as const;

/**
 * Stats — Apple-style oversized numbers.
 */
export function Stats() {
  return (
    <section className="bg-background px-4 py-20 sm:py-24">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-10 md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.key} className="text-center">
            <p className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {s.value}
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              {m[`landing.stats.${s.key}` as const]()}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
