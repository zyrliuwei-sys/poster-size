import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { getPublishedPosterSizes } from '@/lib/poster-size-data';
import { socialMeta } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { PosterFooter } from '@/components/poster-footer';
import { PosterHeader } from '@/components/poster-header';
import { PosterSizeFinder } from '@/components/poster-size-finder';

function SizeGuidePage() {
  const { posterSizes } = Route.useLoaderData();
  return (
    <div className="ps-page">
      <PosterHeader />
      <main className="ps-guide-main">
        <PosterSizeFinder initialItems={posterSizes} />
      </main>
      <PosterFooter />
    </div>
  );
}

export const Route = createFileRoute('/size-guide')({
  loader: async () => ({
    locale: getLocale(),
    posterSizes: await getPublishedPosterSizes(),
  }),
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const L = locale as any;
    const posterSizes = loaderData?.posterSizes ?? [];
    const urlFor = (loc: string) =>
      localizeUrl(`${envConfigs.app_url}/size-guide`, {
        locale: loc as any,
      }).href;
    const title = m['poster.catalogue.meta_title']({}, { locale: L });
    const description = m['poster.catalogue.meta_description'](
      {},
      { locale: L }
    );

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { name: 'robots', content: 'index,follow' },
        ...socialMeta({
          title,
          description,
          url: urlFor(locale),
          locale,
          image: '/imgs/hero/loft-poster.webp',
        }),
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
            '@type': 'CollectionPage',
            name: title,
            description,
            url: urlFor(locale),
            isPartOf: {
              '@type': 'WebSite',
              name: envConfigs.app_name,
              url: urlFor(locale),
            },
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: posterSizes.length,
              itemListElement: posterSizes.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                description: item.description,
                url: `${urlFor(locale)}#${item.slug}`,
              })),
            },
          }),
        },
      ],
    };
  },
  component: SizeGuidePage,
});
