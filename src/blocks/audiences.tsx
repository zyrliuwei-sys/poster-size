import { m } from '@/paraglide/messages.js';

const AUDIENCES = [
  {
    title: m['landing.audiences.homeowners'],
    desc: m['landing.audiences.homeowners_desc'],
  },
  {
    title: m['landing.audiences.renters'],
    desc: m['landing.audiences.renters_desc'],
  },
  {
    title: m['landing.audiences.agents'],
    desc: m['landing.audiences.agents_desc'],
  },
  {
    title: m['landing.audiences.designers'],
    desc: m['landing.audiences.designers_desc'],
  },
  {
    title: m['landing.audiences.shoppers'],
    desc: m['landing.audiences.shoppers_desc'],
  },
] as const;

/**
 * Who uses an AI room design generator — five audiences, two-column list.
 */
export function Audiences() {
  return (
    <section className="bg-background px-4 pb-24 sm:pb-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {m['landing.audiences.title']()}
          </h2>
        </div>

        <ul className="grid gap-10 sm:grid-cols-2">
          {AUDIENCES.map((a) => (
            <li key={a.title}>
              <h3 className="text-lg font-semibold tracking-tight">
                {a.title()}
              </h3>
              <p className="text-muted-foreground mt-2 leading-relaxed">
                {a.desc()}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
