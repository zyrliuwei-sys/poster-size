import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { socialMeta } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { FREE_FAQ_KEYS, FreeGenerator } from '@/blocks/free-generator';
import { Header } from '@/blocks/header';

const PATH = '/ai-room-design-free';

function seoSchema(locale: string, pageUrl: string) {
  const L = locale as any;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        mainEntity: FREE_FAQ_KEYS.map((key) => ({
          '@type': 'Question',
          name: m[`free.faq.${key}` as 'free.faq.q1']({}, { locale: L }),
          acceptedAnswer: {
            '@type': 'Answer',
            text: m[`free.faq.a${key.slice(1)}` as 'free.faq.a1'](
              {},
              { locale: L }
            ),
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: localizeUrl(`${envConfigs.app_url}/`, { locale: L }).href,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: m['free.hero.title']({}, { locale: L }),
            item: pageUrl,
          },
        ],
      },
    ],
  };
}

export const Route = createFileRoute('/ai-room-design-free')({
  loader: () => ({ locale: getLocale() }),
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const L = locale as any;
    const urlFor = (loc: string) =>
      localizeUrl(`${envConfigs.app_url}${PATH}`, { locale: loc as any }).href;
    const title = m['free.metadata.title']({}, { locale: L });
    const description = m['free.metadata.description']({}, { locale: L });
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
  component: function FreeRoomDesignPage() {
    return (
      <div className="bg-background text-foreground flex min-h-screen flex-col">
        <Header />
        <FreeGenerator />
        <Footer />
      </div>
    );
  },
});
