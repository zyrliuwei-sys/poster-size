import type { PosterSizeItem } from '@/types/poster-size';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { PosterFooter } from '@/components/poster-footer';
import { PosterHeader } from '@/components/poster-header';
import { PosterSizeFinder } from '@/components/poster-size-finder';

const WORKFLOW_STEPS = [
  {
    index: '01',
    title: m['poster.workflow.step1.title'],
    body: m['poster.workflow.step1.body'],
  },
  {
    index: '02',
    title: m['poster.workflow.step2.title'],
    body: m['poster.workflow.step2.body'],
  },
  {
    index: '03',
    title: m['poster.workflow.step3.title'],
    body: m['poster.workflow.step3.body'],
  },
  {
    index: '04',
    title: m['poster.workflow.step4.title'],
    body: m['poster.workflow.step4.body'],
  },
] as const;

const SCENARIOS = [
  {
    index: 'PRINT',
    title: m['poster.scenarios.print.title'],
    body: m['poster.scenarios.print.body'],
  },
  {
    index: 'SOCIAL',
    title: m['poster.scenarios.social.title'],
    body: m['poster.scenarios.social.body'],
  },
  {
    index: 'SLIDES',
    title: m['poster.scenarios.slides.title'],
    body: m['poster.scenarios.slides.body'],
  },
  {
    index: 'SIGNAGE',
    title: m['poster.scenarios.signage.title'],
    body: m['poster.scenarios.signage.body'],
  },
] as const;

const POSTER_FAQ = [
  { question: m['poster.faq.q1'], answer: m['poster.faq.a1'] },
  { question: m['poster.faq.q2'], answer: m['poster.faq.a2'] },
  { question: m['poster.faq.q3'], answer: m['poster.faq.a3'] },
  { question: m['poster.faq.q4'], answer: m['poster.faq.a4'] },
  { question: m['poster.faq.q5'], answer: m['poster.faq.a5'] },
] as const;

export function PosterHome({
  initialItems,
}: {
  initialItems?: PosterSizeItem[];
}) {
  return (
    <div className="ps-page">
      <PosterHeader />
      <main>
        <section className="ps-hero">
          <div className="ps-hero-copy">
            <p className="ps-eyebrow">{m['poster.hero.kicker']()}</p>
            <h1>{m['poster.hero.title']()}</h1>
            <p className="ps-hero-description">
              {m['poster.hero.description']()}
            </p>
            <div className="ps-hero-actions">
              <Link href="/poster-generator" className="ps-primary-button">
                {m['poster.hero.browse']()}
                <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/settings/favorites" className="ps-text-link">
                {m['poster.hero.saved']()}
              </Link>
            </div>
            <div
              className="ps-hero-proof"
              aria-label={m['poster.hero.formats_label']()}
            >
              <span>{m['poster.hero.print']()}</span>
              <span>{m['poster.hero.social']()}</span>
              <span>{m['poster.hero.slides']()}</span>
              <span>{m['poster.hero.ratios']()}</span>
            </div>
          </div>
          <div
            className="ps-specimen-wall ps-hero-stage"
            aria-label={m['poster.hero.specimen_alt']()}
          >
            <div className="ps-stage-label">
              {m['poster.hero.format_library']()}
            </div>
            <div className="ps-specimen ps-specimen-a4">
              <span>01</span>
              <strong>A4</strong>
              <small>{m['poster.specimen.a4_unit']()}</small>
            </div>
            <div className="ps-specimen ps-specimen-poster">
              <span>02</span>
              <strong>18 × 24</strong>
              <small>{m['poster.specimen.poster_unit']()}</small>
            </div>
            <div className="ps-specimen ps-specimen-wide">
              <span>03</span>
              <strong>16:9</strong>
              <small>{m['poster.specimen.presentation_unit']()}</small>
            </div>
            <div className="ps-stage-footer">
              <span>{m['poster.hero.stage_footer']()}</span>
              <span aria-hidden="true">↘</span>
            </div>
          </div>
        </section>

        <PosterSizeFinder compact initialItems={initialItems} />

        <section className="ps-next-step">
          <div className="ps-next-step-head">
            <div>
              <p className="ps-eyebrow">{m['poster.next.kicker']()}</p>
              <h2>{m['poster.next.title']()}</h2>
            </div>
            <div>
              <p>{m['poster.next.description']()}</p>
              <div className="ps-next-step-actions">
                <Link href="/poster-generator" className="ps-primary-button">
                  {m['poster.next.generator']()}{' '}
                  <span aria-hidden="true">↗</span>
                </Link>
                <Link href="/size-guide" className="ps-text-link">
                  {m['poster.next.guide']()}
                </Link>
              </div>
            </div>
          </div>
          <div className="ps-next-step-grid">
            <article>
              <span className="ps-guide-index">01 / PRINT</span>
              <h3>{m['poster.next.print.title']()}</h3>
              <p>{m['poster.next.print.body']()}</p>
            </article>
            <article>
              <span className="ps-guide-index">02 / DIGITAL</span>
              <h3>{m['poster.next.digital.title']()}</h3>
              <p>{m['poster.next.digital.body']()}</p>
            </article>
            <article>
              <span className="ps-guide-index">03 / AI</span>
              <h3>{m['poster.next.ai.title']()}</h3>
              <p>{m['poster.next.ai.body']()}</p>
            </article>
          </div>
        </section>

        <section className="ps-notes">
          <div className="ps-notes-head">
            <p className="ps-eyebrow">{m['poster.notes.kicker']()}</p>
            <h2>{m['poster.notes.title']()}</h2>
          </div>
          <div className="ps-note-grid">
            <article>
              <span className="ps-note-index">BLEED</span>
              <h3>{m['poster.notes.bleed.title']()}</h3>
              <p>{m['poster.notes.bleed.description']()}</p>
            </article>
            <article>
              <span className="ps-note-index">UNITS</span>
              <h3>{m['poster.notes.pixels.title']()}</h3>
              <p>{m['poster.notes.pixels.description']()}</p>
            </article>
            <article>
              <span className="ps-note-index">RATIO</span>
              <h3>{m['poster.notes.ratio.title']()}</h3>
              <p>{m['poster.notes.ratio.description']()}</p>
            </article>
          </div>
        </section>

        <section className="ps-editorial-guide">
          <div className="ps-editorial-guide-head">
            <p className="ps-eyebrow">{m['poster.guide.kicker']()}</p>
            <h2>{m['poster.guide.title']()}</h2>
          </div>
          <div className="ps-editorial-guide-body">
            <p>{m['poster.guide.intro']()}</p>
            <p>{m['poster.guide.print']()}</p>
            <p>{m['poster.guide.digital']()}</p>
            <p>{m['poster.guide.finish']()}</p>
            <Link href="/size-guide" className="ps-editorial-link">
              {m['poster.guide.link']()} <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>

        <section className="ps-workflow">
          <div className="ps-workflow-head">
            <div>
              <p className="ps-eyebrow">{m['poster.workflow.kicker']()}</p>
              <h2>{m['poster.workflow.title']()}</h2>
            </div>
            <p>{m['poster.workflow.description']()}</p>
          </div>
          <div className="ps-workflow-grid">
            {WORKFLOW_STEPS.map((step) => (
              <article key={step.index}>
                <span className="ps-guide-index">{step.index}</span>
                <h3>{step.title()}</h3>
                <p>{step.body()}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="ps-scenarios">
          <div className="ps-scenarios-head">
            <p className="ps-eyebrow">{m['poster.scenarios.kicker']()}</p>
            <h2>{m['poster.scenarios.title']()}</h2>
            <p>{m['poster.scenarios.description']()}</p>
          </div>
          <div className="ps-scenario-grid">
            {SCENARIOS.map((scenario) => (
              <article key={scenario.index}>
                <span className="ps-guide-index">{scenario.index}</span>
                <h3>{scenario.title()}</h3>
                <p>{scenario.body()}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="ps-faq">
          <div className="ps-faq-head">
            <p className="ps-eyebrow">{m['poster.faq.kicker']()}</p>
            <h2>{m['poster.faq.title']()}</h2>
          </div>
          <div className="ps-faq-list">
            {POSTER_FAQ.map((item) => (
              <details key={item.question()} className="ps-faq-item">
                <summary>{item.question()}</summary>
                <p>{item.answer()}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <PosterFooter />
    </div>
  );
}
