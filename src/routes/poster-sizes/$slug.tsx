import { createFileRoute, notFound } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { socialMeta } from '@/lib/seo';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import {
  getPosterDetailCopy,
  PosterSizeDetail,
} from '@/components/poster-size-detail';

const SLUGS = ['18x24', '24x36'] as const;

function isPosterDetailSlug(value: string): value is (typeof SLUGS)[number] {
  return SLUGS.includes(value as (typeof SLUGS)[number]);
}

export const Route = createFileRoute('/poster-sizes/$slug')({
  loader: ({ params }) => {
    if (!isPosterDetailSlug(params.slug)) throw notFound();
    return { locale: getLocale(), slug: params.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { locale, slug } = loaderData;
    const urlFor = (loc: string) =>
      localizeUrl(`${envConfigs.app_url}/poster-sizes/${slug}`, {
        locale: loc as any,
      }).href;
    const title = getPosterDetailCopy(slug, 'title', locale);
    const description = getPosterDetailCopy(slug, 'description', locale);
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
            '@graph': [
              {
                '@type': 'Article',
                headline: title,
                description,
                mainEntityOfPage: urlFor(locale),
                author: { '@type': 'Organization', name: envConfigs.app_name },
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: localizeUrl(`${envConfigs.app_url}/`, {
                      locale: locale as any,
                    }).href,
                  },
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: title,
                    item: urlFor(locale),
                  },
                ],
              },
            ],
          }),
        },
      ],
    };
  },
  component: () => {
    const { slug } = Route.useLoaderData();
    return <PosterSizeDetail slug={slug} />;
  },
});
