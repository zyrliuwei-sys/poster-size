import { m } from '@/paraglide/messages.js';
import { STYLE_THUMBS, type Style } from '@/blocks/design-studio';

const STYLES: Style[] = [
  'modern',
  'minimalist',
  'scandinavian',
  'japandi',
  'industrial',
  'bohemian',
  'coastal',
  'midcentury',
];

/**
 * The eight curated styles with a one-line "when to pick this" — the single
 * authoritative style list the rest of the site agrees with.
 */
export function StyleGuide() {
  return (
    <section id="styles" className="bg-[#f5f5f7] px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {m['landing.styles.title']()}
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            {m['landing.styles.subtitle']()}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STYLES.map((s) => (
            <article key={s} className="overflow-hidden rounded-2xl bg-white">
              <img
                src={STYLE_THUMBS[s]}
                alt={m[`create.style.${s}` as 'create.style.modern']()}
                width={STYLE_THUMBS[s].endsWith('.avif') ? 1376 : 800}
                height={STYLE_THUMBS[s].endsWith('.avif') ? 768 : 600}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-5">
                <h3 className="text-base font-semibold tracking-tight">
                  {m[`create.style.${s}` as 'create.style.modern']()}
                </h3>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                  {m[`landing.styles.${s}` as 'landing.styles.modern']()}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
