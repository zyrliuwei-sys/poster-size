import { m } from '@/paraglide/messages.js';

const ITEMS = [
  {
    title: m['landing.features.f1.title'],
    desc: m['landing.features.f1.desc'],
  },
  {
    title: m['landing.features.f2.title'],
    desc: m['landing.features.f2.desc'],
  },
  {
    title: m['landing.features.f3.title'],
    desc: m['landing.features.f3.desc'],
  },
] as const;

/**
 * What this AI room designer actually does — three plain-language promises.
 */
export function Features() {
  return (
    <section className="bg-background px-4 pt-24 pb-10 sm:pt-32 sm:pb-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {m['landing.features.title']()}
          </h2>
        </div>

        <div className="grid gap-12 md:grid-cols-3">
          {ITEMS.map((item) => (
            <div key={item.title}>
              <h3 className="text-xl font-semibold tracking-tight">
                {item.title()}
              </h3>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                {item.desc()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
