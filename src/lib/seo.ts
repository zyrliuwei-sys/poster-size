import { envConfigs } from '@/config';

/** Shared 1200×630 social card — real before/after pair from the demo set. */
export const OG_IMAGE = '/imgs/og/home.jpg';

/**
 * Open Graph + Twitter card meta, shared by every page head so links unfurl
 * the same way everywhere. `url` must already be locale-localized and absolute.
 */
export function socialMeta(params: {
  title: string;
  description: string;
  url: string;
  locale: string;
  image?: string;
}): { property?: string; name?: string; content: string }[] {
  const image = `${envConfigs.app_url}${params.image ?? OG_IMAGE}`;
  const ogLocale = params.locale === 'zh' ? 'zh_CN' : 'en_US';
  const ogAlt = params.locale === 'zh' ? 'en_US' : 'zh_CN';
  return [
    { property: 'og:title', content: params.title },
    { property: 'og:description', content: params.description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: params.url },
    { property: 'og:image', content: image },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: params.title },
    { property: 'og:site_name', content: envConfigs.app_name },
    { property: 'og:locale', content: ogLocale },
    { property: 'og:locale:alternate', content: ogAlt },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: params.title },
    { name: 'twitter:description', content: params.description },
    { name: 'twitter:image', content: image },
  ];
}
