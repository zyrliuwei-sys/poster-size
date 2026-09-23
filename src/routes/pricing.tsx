import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { socialMeta } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { Pricing } from '@/blocks/pricing';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/** FAQ keys — also drives the FAQPage JSON-LD below. */
const PRICING_FAQ_KEYS = ['q1', 'q2', 'q3'] as const;

export const Route = createFileRoute('/pricing')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['landing.pricing.meta_title']({}, { locale }),
      description: m['landing.pricing.meta_description']({}, { locale }),
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { locale, title, description } = loaderData;
    const L = locale as any;
    const urlFor = (loc: string) =>
      localizeUrl(`${envConfigs.app_url}/pricing`, { locale: loc as any }).href;
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { name: 'robots', content: 'index,follow' },
        ...socialMeta({ title, description, url: urlFor(locale), locale }),
      ],
      links: [
        { rel: 'canonical', href: urlFor(locale) },
        ...locales.map((loc) => ({
          rel: 'alternate',
          hrefLang: loc,
          href: urlFor(loc),
        })),
        { rel: 'alternate', hrefLang: 'x-default', href: urlFor('en') },
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: PRICING_FAQ_KEYS.map((key) => ({
              '@type': 'Question',
              name: m[`landing.pricing.faq_${key}` as 'landing.pricing.faq_q1'](
                {},
                { locale: L }
              ),
              acceptedAnswer: {
                '@type': 'Answer',
                text: m[
                  `landing.pricing.faq_a${key.slice(1)}` as 'landing.pricing.faq_a1'
                ]({}, { locale: L }),
              },
            })),
          }),
        },
      ],
    };
  },
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Pricing
          heading="h1"
          title={m['landing.pricing.h1']()}
          subtitle={m['landing.pricing.title']()}
        />

        {/* How credits work */}
        <section className="bg-[#f5f5f7] px-4 py-20 sm:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {m['landing.pricing.credits_title']()}
            </h2>
            <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
              {m['landing.pricing.credits_body']()}
            </p>
          </div>
        </section>

        {/* Pricing FAQ — high purchase-intent questions */}
        <section className="bg-background px-4 py-20 sm:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {m['landing.pricing.faq_title']()}
            </h2>
            <Accordion className="mt-10 w-full">
              {PRICING_FAQ_KEYS.map((key) => (
                <AccordionItem key={key} value={key}>
                  <AccordionTrigger className="cursor-pointer py-6 text-left text-lg font-medium hover:no-underline">
                    {m[
                      `landing.pricing.faq_${key}` as 'landing.pricing.faq_q1'
                    ]()}
                  </AccordionTrigger>
                  {/* keepMounted: answer stays in the served HTML so it
                      matches the FAQPage JSON-LD verbatim. */}
                  <AccordionContent
                    keepMounted
                    className="text-muted-foreground pb-6 text-base leading-relaxed"
                  >
                    {m[
                      `landing.pricing.faq_a${key.slice(1)}` as 'landing.pricing.faq_a1'
                    ]()}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
