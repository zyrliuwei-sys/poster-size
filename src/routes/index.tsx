import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { getPublishedPosterSizes } from '@/lib/poster-size-data';
import { socialMeta } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { PosterHome } from '@/blocks/poster-home';

function HomePage() {
  const { posterSizes } = Route.useLoaderData();
  return <PosterHome initialItems={posterSizes} />;
}

function seoSchema(homeUrl: string, description: string, locale: string) {
  const L = locale as any;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: envConfigs.app_name,
        url: homeUrl,
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Web browser',
        description,
      },
      {
        '@type': 'FAQPage',
        mainEntity: [1, 2, 3, 4, 5].map((number) => ({
          '@type': 'Question',
          name: m[`poster.faq.q${number}` as 'poster.faq.q1'](
            {},
            { locale: L }
          ),
          acceptedAnswer: {
            '@type': 'Answer',
            text: m[`poster.faq.a${number}` as 'poster.faq.a1'](
              {},
              { locale: L }
            ),
          },
        })),
      },
    ],
  };
}

export const Route = createFileRoute('/')({
  loader: async () => ({
    locale: getLocale(),
    posterSizes: await getPublishedPosterSizes(),
  }),
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
          children: JSON.stringify(
            seoSchema(urlFor(locale), description, locale)
          ),
        },
      ],
    };
  },
  component: HomePage,
});
