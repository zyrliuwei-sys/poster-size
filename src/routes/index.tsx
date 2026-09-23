import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { socialMeta } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { Audiences } from '@/blocks/audiences';
import { ChangesKeeps } from '@/blocks/changes-keeps';
import { Compare } from '@/blocks/compare';
import { CTA } from '@/blocks/cta';
import { FAQ, FAQ_KEYS } from '@/blocks/faq';
import { Features } from '@/blocks/features';
import { Footer } from '@/blocks/footer';
import { FreeTier } from '@/blocks/free-tier';
import { Gallery } from '@/blocks/gallery';
import { Header } from '@/blocks/header';
import { Hero } from '@/blocks/hero';
import { HowItWorks } from '@/blocks/how-it-works';
import { Pricing } from '@/blocks/pricing';
import { Rooms } from '@/blocks/rooms';
import { StyleGuide } from '@/blocks/style-guide';
import { SupportWidget } from '@/blocks/support-widget';

function HomePage() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <ChangesKeeps />
        <Gallery />
        <StyleGuide />
        <FreeTier />
        <Pricing />
        <Compare />
        <Rooms />
        <Audiences />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      <SupportWidget />
    </div>
  );
}

/** Schema.org @graph — WebApplication + FAQPage (mirrors the on-page FAQ) + BreadcrumbList. */
function seoSchema(locale: string, homeUrl: string) {
  const L = locale as any;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: `${envConfigs.app_name} — AI Room Design`,
        url: homeUrl,
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Web browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description:
            'First design free with a free account (one per account, watermarked, personal use); paid credits from $5',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ_KEYS.map((key) => ({
          '@type': 'Question',
          name: m[`landing.faq.${key}.question` as 'landing.faq.free.question'](
            {},
            { locale: L }
          ),
          acceptedAnswer: {
            '@type': 'Answer',
            text: m[`landing.faq.${key}.answer` as 'landing.faq.free.answer'](
              {},
              { locale: L }
            ),
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: homeUrl },
        ],
      },
    ],
  };
}

export const Route = createFileRoute('/')({
  loader: () => {
    const locale = getLocale();
    return { locale };
  },
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const urlFor = (loc: string) =>
      localizeUrl(`${envConfigs.app_url}/`, { locale: loc as any }).href;
    const title = m['common.metadata.title']({}, { locale: locale as any });
    const description = m['common.metadata.description'](
      {},
      { locale: locale as any }
    );
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
          children: JSON.stringify(seoSchema(locale, urlFor(locale))),
        },
      ],
    };
  },
  component: HomePage,
});
