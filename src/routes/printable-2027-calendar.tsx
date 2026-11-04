import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { socialMeta } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import {
  getCalendarFaq,
  PrintableCalendar2027Block,
} from '@/blocks/printable-calendar-2027';

export const Route = createFileRoute('/printable-2027-calendar')({
  loader: () => ({ locale: getLocale() }),
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const options = { locale };
    const urlFor = (loc: typeof locale) =>
      localizeUrl(`${envConfigs.app_url}/printable-2027-calendar`, {
        locale: loc,
      }).href;
    const url = urlFor(locale);
    const title = m['calendar2027.meta_title']({}, options);
    const description = m['calendar2027.meta_description']({}, options);
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { name: 'robots', content: 'index,follow' },
        ...socialMeta({ title, description, url, locale }),
      ],
      links: [
        { rel: 'canonical', href: url },
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
                '@type': 'WebApplication',
                '@id': `${url}#generator`,
                name: m['calendar2027.title']({}, options),
                url,
                description,
                applicationCategory: 'DesignApplication',
                operatingSystem: 'Any',
                browserRequirements:
                  'Requires a modern browser with JavaScript.',
                inLanguage: locale,
                isAccessibleForFree: true,
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                featureList: [
                  '2027 yearly and monthly calendars',
                  'A4 and US Letter PDF download',
                  'Monday or Sunday week start',
                  'Portrait and landscape printing',
                ],
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: envConfigs.app_name,
                    item: localizeUrl(`${envConfigs.app_url}/`, options).href,
                  },
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: m['calendar2027.breadcrumb']({}, options),
                    item: url,
                  },
                ],
              },
              {
                '@type': 'FAQPage',
                mainEntity: getCalendarFaq(locale).map((item) => ({
                  '@type': 'Question',
                  name: item.question,
                  acceptedAnswer: { '@type': 'Answer', text: item.answer },
                })),
              },
            ],
          }).replace(/</g, '\\u003c'),
        },
      ],
    };
  },
  component: PrintableCalendar2027Block,
});
