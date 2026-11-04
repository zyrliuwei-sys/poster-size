import { ArrowLeft, ArrowUpRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { CalendarGenerator } from '@/components/calendar-generator';
import { PosterFooter } from '@/components/poster-footer';
import { PosterHeader } from '@/components/poster-header';

export function getCalendarFaq(locale = getLocale()) {
  const options = { locale };
  return [
    {
      question: m['calendar2027.faq.1.q']({}, options),
      answer: m['calendar2027.faq.1.a']({}, options),
    },
    {
      question: m['calendar2027.faq.2.q']({}, options),
      answer: m['calendar2027.faq.2.a']({}, options),
    },
    {
      question: m['calendar2027.faq.3.q']({}, options),
      answer: m['calendar2027.faq.3.a']({}, options),
    },
    {
      question: m['calendar2027.faq.4.q']({}, options),
      answer: m['calendar2027.faq.4.a']({}, options),
    },
    {
      question: m['calendar2027.faq.5.q']({}, options),
      answer: m['calendar2027.faq.5.a']({}, options),
    },
  ];
}

export function PrintableCalendar2027Block() {
  const locale = getLocale();
  const months = Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' }).format(
      new Date(Date.UTC(2027, i, 1))
    )
  );
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(2027, 7, 1 + i)))
  );
  const articles = [
    {
      id: 'about',
      title: m['calendar2027.guide.1.title'](),
      p1: m['calendar2027.guide.1.p1'](),
      p2: m['calendar2027.guide.1.p2'](),
    },
    {
      id: 'layouts',
      title: m['calendar2027.guide.2.title'](),
      p1: m['calendar2027.guide.2.p1'](),
      p2: m['calendar2027.guide.2.p2'](),
    },
    {
      id: 'how-to',
      title: m['calendar2027.guide.3.title'](),
      p1: m['calendar2027.guide.3.p1'](),
      p2: m['calendar2027.guide.3.p2'](),
    },
    {
      id: 'paper',
      title: m['calendar2027.guide.4.title'](),
      p1: m['calendar2027.guide.4.p1'](),
      p2: m['calendar2027.guide.4.p2'](),
    },
    {
      id: 'week-start',
      title: m['calendar2027.guide.5.title'](),
      p1: m['calendar2027.guide.5.p1'](),
      p2: m['calendar2027.guide.5.p2'](),
    },
    {
      id: 'planning',
      title: m['calendar2027.guide.6.title'](),
      p1: m['calendar2027.guide.6.p1'](),
      p2: m['calendar2027.guide.6.p2'](),
    },
    {
      id: 'printing',
      title: m['calendar2027.guide.7.title'](),
      p1: m['calendar2027.guide.7.p1'](),
      p2: m['calendar2027.guide.7.p2'](),
    },
  ];
  return (
    <div className="ps-page cal-page">
      <PosterHeader />
      <main className="cal-main">
        <nav
          className="cal-breadcrumb"
          aria-label={m['calendar2027.breadcrumb_label']()}
        >
          <Link href="/">
            <ArrowLeft size={13} aria-hidden="true" />
            {m['calendar2027.home']()}
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{m['calendar2027.breadcrumb']()}</span>
        </nav>
        <header className="cal-hero">
          <p className="cal-eyebrow">{m['calendar2027.kicker']()}</p>
          <h1>{m['calendar2027.title']()}</h1>
          <p>{m['calendar2027.description']()}</p>
        </header>

        <CalendarGenerator
          labels={{
            months,
            weekdays,
            notes: m['calendar2027.notes'](),
            yearLabel: m['calendar2027.year_label'](),
          }}
          copy={{
            controls: m['calendar2027.controls'](),
            reset: m['calendar2027.reset'](),
            layout: m['calendar2027.layout'](),
            year: m['calendar2027.layout.year'](),
            month: m['calendar2027.layout.month'](),
            allMonths: m['calendar2027.layout.all'](),
            paper: m['calendar2027.paper'](),
            orientation: m['calendar2027.orientation'](),
            portrait: m['calendar2027.portrait'](),
            landscape: m['calendar2027.landscape'](),
            weekStart: m['calendar2027.week_start'](),
            sunday: m['calendar2027.sunday'](),
            monday: m['calendar2027.monday'](),
            palette: m['calendar2027.palette'](),
            blue: m['calendar2027.blue'](),
            ink: m['calendar2027.ink'](),
            forest: m['calendar2027.forest'](),
            title: m['calendar2027.custom_title'](),
            titlePlaceholder: m['calendar2027.title_placeholder'](),
            weekends: m['calendar2027.weekends'](),
            notes: m['calendar2027.notes_option'](),
            download: m['calendar2027.download'](),
            exporting: m['calendar2027.exporting'](),
            print: m['calendar2027.print'](),
            svg: m['calendar2027.svg'](),
            error: m['calendar2027.error'](),
            ready: m['calendar2027.ready'](),
            preview: m['calendar2027.preview'](),
            previewAlt: m['calendar2027.preview_alt'](),
            printHint: m['calendar2027.print_hint'](),
            private: m['calendar2027.private'](),
            pages: (count) => m['calendar2027.pages']({ count }),
            previous: m['calendar2027.previous'](),
            next: m['calendar2027.next'](),
            monthIndex: m['calendar2027.month_index'](),
          }}
        />

        <div className="cal-guide-layout">
          <aside className="cal-contents">
            <h2>{m['calendar2027.contents']()}</h2>
            <nav aria-label={m['calendar2027.contents']()}>
              {articles.map((article) => (
                <a key={article.id} href={`#${article.id}`}>
                  {article.title}
                </a>
              ))}
              <a href="#calendar-faq">{m['calendar2027.faq.title']()}</a>
            </nav>
            <div className="cal-year-facts">
              <strong>2027</strong>
              <p>{m['calendar2027.facts']()}</p>
              <a
                href="https://www.timeanddate.com/calendar/?year=2027&country=1"
                target="_blank"
                rel="noopener noreferrer"
              >
                {m['calendar2027.date_source']()}
                <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            </div>
          </aside>
          <article
            className="cal-guide"
            aria-label={m['calendar2027.guide_label']()}
          >
            {articles.map((article) => (
              <section key={article.id} id={article.id}>
                <h2>{article.title}</h2>
                <p>{article.p1}</p>
                <p>{article.p2}</p>
              </section>
            ))}
            <section id="calendar-faq" className="cal-faq">
              <h2>{m['calendar2027.faq.title']()}</h2>
              {getCalendarFaq().map((item) => (
                <details key={item.question}>
                  <summary>
                    {item.question}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </section>
            <div className="cal-related">
              <h2>{m['calendar2027.related.title']()}</h2>
              <p>{m['calendar2027.related.description']()}</p>
              <Link href="/size-guide">
                {m['calendar2027.related.sizes']()}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/poster-generator">
                {m['calendar2027.related.poster']()}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </article>
        </div>
      </main>
      <PosterFooter />
    </div>
  );
}
