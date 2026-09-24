import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { socialMeta } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { PosterGeneratorBlock } from '@/blocks/poster-generator';

export const Route = createFileRoute('/poster-generator')({
  loader: () => ({ locale: getLocale() }),
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const urlFor = (loc: string) =>
      localizeUrl(`${envConfigs.app_url}/poster-generator`, {
        locale: loc as any,
      }).href;
    const title = m['poster.generator.meta_title'](
      {},
      { locale: locale as any }
    );
    const description = m['poster.generator.meta_description'](
      {},
      { locale: locale as any }
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
    };
  },
  component: PosterGeneratorBlock,
});
