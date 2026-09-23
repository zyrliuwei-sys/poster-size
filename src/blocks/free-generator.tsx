import { ArrowRight, CalendarCheck, CreditCard, Unlock } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/** FAQ keys — also drives the FAQPage JSON-LD on the route. */
export const FREE_FAQ_KEYS = ['q1', 'q2', 'q3'] as const;

const FEATURES = [
  { icon: CalendarCheck, title: m['free.f1.title'], desc: m['free.f1.desc'] },
  { icon: CreditCard, title: m['free.f2.title'], desc: m['free.f2.desc'] },
  { icon: Unlock, title: m['free.f3.title'], desc: m['free.f3.desc'] },
] as const;

/**
 * Landing page for the "ai room design free" intent — points at the studio
 * where the anonymous daily free design lives.
 */
export function FreeGenerator() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <main>
        {/* Hero */}
        <section className="bg-background px-4 pt-20 pb-16 text-center sm:pt-28">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-6xl">
              {m['free.hero.title']()}
            </h1>
            <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-balance">
              {m['free.hero.subtitle']()}
            </p>
            <Link
              href="/room-design"
              className="bg-primary mt-8 inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-lg font-medium text-white shadow-lg transition-all hover:bg-[#0077ed]"
            >
              {m['free.hero.cta']()}
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-[#f5f5f7] px-4 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {m['free.how.title']()}
            </h2>
            <div className="mt-12 grid gap-10 md:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title()} className="text-center">
                  <span className="bg-primary/10 mx-auto flex size-12 items-center justify-center rounded-2xl">
                    <f.icon className="text-primary size-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight">
                    {f.title()}
                  </h3>
                  <p className="text-muted-foreground mt-2 leading-relaxed">
                    {f.desc()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Watermark explainer */}
        <section className="bg-background px-4 py-20 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {m['free.watermark.title']()}
            </h2>
            <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
              {m['free.watermark.desc']({ app: envConfigs.app_name })}
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-[#f5f5f7] px-4 py-20 sm:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {m['free.faq.title']()}
            </h2>
            <Accordion className="w-full">
              {FREE_FAQ_KEYS.map((key) => (
                <AccordionItem key={key} value={key}>
                  <AccordionTrigger className="cursor-pointer py-6 text-left text-lg font-medium hover:no-underline">
                    {m[`free.faq.${key}` as 'free.faq.q1']()}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 text-base leading-relaxed">
                    {m[`free.faq.a${key.slice(1)}` as 'free.faq.a1']()}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-background px-4 py-20 text-center sm:py-24">
          <Link
            href="/room-design"
            className="bg-primary inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-lg font-medium text-white shadow-lg transition-all hover:bg-[#0077ed]"
          >
            {m['free.hero.cta']()}
            <ArrowRight className="size-5" />
          </Link>
        </section>
      </main>
    </div>
  );
}
