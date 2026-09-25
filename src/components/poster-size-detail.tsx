import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { PosterFooter } from '@/components/poster-footer';
import { PosterHeader } from '@/components/poster-header';

export type PosterDetailSlug = '18x24' | '24x36';

type CopyKey =
  | 'title'
  | 'description'
  | 'intro'
  | 'dimensions'
  | 'ratio'
  | 'uses'
  | 'tips'
  | 'faq_question'
  | 'faq_answer';

const COPY_KEYS: Record<PosterDetailSlug, Record<CopyKey, string>> = {
  '18x24': {
    title: 'poster.detail.18x24.title',
    description: 'poster.detail.18x24.description',
    intro: 'poster.detail.18x24.intro',
    dimensions: 'poster.detail.18x24.dimensions',
    ratio: 'poster.detail.18x24.ratio',
    uses: 'poster.detail.18x24.uses',
    tips: 'poster.detail.18x24.tips',
    faq_question: 'poster.detail.18x24.faq_question',
    faq_answer: 'poster.detail.18x24.faq_answer',
  },
  '24x36': {
    title: 'poster.detail.24x36.title',
    description: 'poster.detail.24x36.description',
    intro: 'poster.detail.24x36.intro',
    dimensions: 'poster.detail.24x36.dimensions',
    ratio: 'poster.detail.24x36.ratio',
    uses: 'poster.detail.24x36.uses',
    tips: 'poster.detail.24x36.tips',
    faq_question: 'poster.detail.24x36.faq_question',
    faq_answer: 'poster.detail.24x36.faq_answer',
  },
};

function readCopy(key: string, locale?: string) {
  const message = m[key as 'poster.detail.18x24.title'];
  return locale ? message({}, { locale: locale as any }) : message();
}

export function getPosterDetailCopy(
  slug: PosterDetailSlug,
  key: CopyKey,
  locale?: string
) {
  return readCopy(COPY_KEYS[slug][key], locale);
}

export function PosterSizeDetail({ slug }: { slug: PosterDetailSlug }) {
  const copy = (key: CopyKey) => getPosterDetailCopy(slug, key);
  const is18x24 = slug === '18x24';
  const inches = is18x24 ? '18 × 24 in' : '24 × 36 in';
  const centimeters = is18x24 ? '45.72 × 60.96 cm' : '60.96 × 91.44 cm';

  return (
    <div className="ps-page">
      <PosterHeader />
      <main className="px-4 py-16 sm:py-24">
        <article className="mx-auto max-w-4xl">
          <p className="ps-eyebrow">POSTER SIZE / PRINT REFERENCE</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight sm:text-7xl">
            {copy('title')}
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed">
            {copy('description')}
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border p-5">
              <p className="text-muted-foreground text-xs tracking-widest uppercase">
                Inches
              </p>
              <p className="mt-2 text-2xl font-semibold">{inches}</p>
            </div>
            <div className="rounded-2xl border p-5">
              <p className="text-muted-foreground text-xs tracking-widest uppercase">
                Centimeters
              </p>
              <p className="mt-2 text-2xl font-semibold">{centimeters}</p>
            </div>
            <div className="rounded-2xl border p-5">
              <p className="text-muted-foreground text-xs tracking-widest uppercase">
                Aspect ratio
              </p>
              <p className="mt-2 text-2xl font-semibold">{copy('ratio')}</p>
            </div>
          </div>

          <div className="mt-14 space-y-10 text-lg leading-relaxed">
            <p>{copy('intro')}</p>
            <section>
              <h2 className="text-3xl font-semibold tracking-tight">
                Exact {slug} poster dimensions
              </h2>
              <p className="text-muted-foreground mt-4">{copy('dimensions')}</p>
            </section>
            <section>
              <h2 className="text-3xl font-semibold tracking-tight">
                Best uses for this poster size
              </h2>
              <p className="text-muted-foreground mt-4">{copy('uses')}</p>
            </section>
            <section>
              <h2 className="text-3xl font-semibold tracking-tight">
                Print setup tips
              </h2>
              <p className="text-muted-foreground mt-4">{copy('tips')}</p>
            </section>
            <section className="bg-muted/50 rounded-3xl p-6 sm:p-8">
              <h2 className="text-3xl font-semibold tracking-tight">
                {copy('faq_question')}
              </h2>
              <p className="text-muted-foreground mt-4">{copy('faq_answer')}</p>
            </section>
          </div>

          <div className="mt-14 flex flex-wrap gap-4">
            <Link href="/size-guide" className="ps-primary-button">
              Compare more poster sizes <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/poster-generator" className="ps-text-link">
              Create a poster
            </Link>
          </div>
        </article>
      </main>
      <PosterFooter />
    </div>
  );
}
