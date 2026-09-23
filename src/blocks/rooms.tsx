import { m } from '@/paraglide/messages.js';

const ROOMS = [
  { key: 'bathroom', hasDesc: true },
  { key: 'bedroom' },
  { key: 'living' },
  { key: 'kitchen' },
  { key: 'dining' },
  { key: 'office' },
  { key: 'basement' },
  { key: 'attic' },
  { key: 'study' },
] as const;

const TOOLS = [
  m['landing.rooms.planner'],
  m['landing.rooms.makeover'],
  m['landing.rooms.organizer'],
] as const;

/**
 * Room types and styles — plain-text walkthrough list.
 * (Spoke pages like /ai-bathroom-design can be added later; links land here.)
 */
export function Rooms() {
  return (
    <section id="rooms" className="bg-background px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {m['landing.rooms.title']()}
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            {m['landing.rooms.subtitle']()}
          </p>
        </div>

        <ul className="flex flex-wrap justify-center gap-3">
          {ROOMS.map(({ key, hasDesc }) => (
            <li
              key={key}
              className="rounded-full bg-[#f5f5f7] px-5 py-2.5 text-base font-medium"
            >
              {m[`landing.rooms.${key}` as 'landing.rooms.bedroom']()}
              {hasDesc && (
                <span className="text-muted-foreground font-normal">
                  {' '}
                  — {m['landing.rooms.bathroom_desc']()}
                </span>
              )}
            </li>
          ))}
        </ul>

        <ul className="mx-auto mt-6 max-w-3xl space-y-2 text-center">
          {TOOLS.map((tool) => (
            <li key={tool} className="text-muted-foreground text-lg">
              {tool()}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
