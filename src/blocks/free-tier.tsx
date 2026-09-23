import { Check } from 'lucide-react';

import { m } from '@/paraglide/messages.js';

const BULLETS = [
  m['landing.free.b1'],
  m['landing.free.b3'],
  m['landing.free.b4'],
  m['landing.free.b5'],
  m['landing.free.b6'],
] as const;

/**
 * Explains the credit model and the entry-level paid package.
 */
export function FreeTier() {
  return (
    <section
      id="free"
      className="bg-[#f5f5f7] px-4 pt-12 pb-24 sm:pt-16 sm:pb-32"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {m['landing.free.title']()}
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
            {m['landing.free.subtitle']()}
          </p>
        </div>

        <ul className="space-y-4">
          {BULLETS.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3">
              <Check className="text-primary mt-1 size-5 shrink-0" />
              <span className="text-lg leading-relaxed">{bullet()}</span>
            </li>
          ))}
        </ul>

        <p className="text-muted-foreground mt-10 text-center text-lg">
          {m['landing.free.outro']()}
        </p>
      </div>
    </section>
  );
}
