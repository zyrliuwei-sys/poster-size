import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';

type TextKey =
  | 'landing.compare.time_20s'
  | 'landing.compare.them_weeks'
  | 'landing.compare.cost_free'
  | 'landing.compare.them_cost'
  | 'landing.compare.us_unlimited'
  | 'landing.compare.them_concepts'
  | 'landing.compare.us_revisions'
  | 'landing.compare.them_revisions'
  | 'landing.compare.us_layout'
  | 'landing.compare.them_layout'
  | 'landing.compare.us_best'
  | 'landing.compare.them_best';

const ROWS: { label: () => string; us: TextKey; them: TextKey }[] = [
  {
    label: m['landing.compare.row_concept'],
    us: 'landing.compare.time_20s',
    them: 'landing.compare.them_weeks',
  },
  {
    label: m['landing.compare.row_cost'],
    us: 'landing.compare.cost_free',
    them: 'landing.compare.them_cost',
  },
  {
    label: m['landing.compare.row_concepts'],
    us: 'landing.compare.us_unlimited',
    them: 'landing.compare.them_concepts',
  },
  {
    label: m['landing.compare.row_revisions'],
    us: 'landing.compare.us_revisions',
    them: 'landing.compare.them_revisions',
  },
  {
    label: m['landing.compare.row_layout'],
    us: 'landing.compare.us_layout',
    them: 'landing.compare.them_layout',
  },
  {
    label: m['landing.compare.row_best'],
    us: 'landing.compare.us_best',
    them: 'landing.compare.them_best',
  },
];

/**
 * Comparison table — AI room design vs hiring an interior designer, our column highlighted.
 */
export function Compare() {
  return (
    <section className="bg-background px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {m['landing.compare.title']()}
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            {m['landing.compare.subtitle']()}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className="w-44" />
                {/* our column */}
                <th className="rounded-t-2xl bg-[#f5f5f7] px-4 pt-5 pb-3 text-base font-semibold">
                  {m['landing.compare.col_us']()}
                </th>
                <th className="text-muted-foreground px-4 pt-5 pb-3 text-base font-medium">
                  {m['landing.compare.col_them']()}
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, ri) => (
                <tr key={row.label()}>
                  <td className="text-muted-foreground py-4 pr-4 font-medium">
                    {row.label()}
                  </td>
                  <td
                    className={cn(
                      'bg-[#f5f5f7] px-4 py-4 font-semibold',
                      ri === ROWS.length - 1 && 'rounded-b-2xl'
                    )}
                  >
                    {m[row.us]()}
                  </td>
                  <td className="text-muted-foreground border-border border-t px-4 py-4">
                    {m[row.them]()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
