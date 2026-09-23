import { Check, Sparkles } from 'lucide-react';

import { m } from '@/paraglide/messages.js';

const CHANGES = [
  m['landing.changes.change1'],
  m['landing.changes.change2'],
  m['landing.changes.change3'],
  m['landing.changes.change4'],
  m['landing.changes.change5'],
  m['landing.changes.change6'],
] as const;

const KEEPS = [
  m['landing.changes.keep1'],
  m['landing.changes.keep2'],
  m['landing.changes.keep3'],
  m['landing.changes.keep4'],
  m['landing.changes.keep5'],
  m['landing.changes.keep6'],
] as const;

/**
 * What the AI changes vs. keeps — two plain lists so visitors know exactly
 * what they are buying before they spend credits.
 */
export function ChangesKeeps() {
  return (
    <section className="bg-background px-4 pt-10 pb-12 sm:pt-12 sm:pb-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {m['landing.changes.title']()}
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            {m['landing.changes.subtitle']()}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-[28px] bg-[#f5f5f7] p-8 sm:p-10">
            <h3 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight">
              <span className="bg-primary flex size-9 items-center justify-center rounded-full text-white">
                <Sparkles className="size-4" />
              </span>
              {m['landing.changes.change_col']()}
            </h3>
            <ul className="mt-6 space-y-3.5">
              {CHANGES.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="bg-primary mt-2 size-1.5 shrink-0 rounded-full" />
                  <span className="leading-relaxed">{item()}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[28px] border border-neutral-200 p-8 sm:p-10">
            <h3 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight">
              <span className="flex size-9 items-center justify-center rounded-full bg-neutral-900 text-white">
                <Check className="size-4" />
              </span>
              {m['landing.changes.keep_col']()}
            </h3>
            <ul className="mt-6 space-y-3.5">
              {KEEPS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="mt-1 size-4 shrink-0 text-neutral-900" />
                  <span className="leading-relaxed">{item()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
