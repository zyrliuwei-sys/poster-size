import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { CreateHero, DesignStudio, DesignTips } from '@/blocks/design-studio';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { Showcase } from '@/blocks/showcase';
import { SupportWidget } from '@/blocks/support-widget';

function RoomDesignPage() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header />
      <main>
        <CreateHero />
        <DesignStudio />
        <Showcase />
        <DesignTips />
      </main>
      <Footer />
      <SupportWidget />
    </div>
  );
}

export const Route = createFileRoute('/room-design')({
  loader: () => ({ locale: getLocale() }),
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const urlFor = (loc: string) =>
      localizeUrl(`${envConfigs.app_url}/room-design`, {
        locale: loc as any,
      }).href;
    return {
      meta: [
        {
          title: m['create.metadata.title']({}, { locale: locale as any }),
        },
        {
          name: 'description',
          content: m['create.metadata.description'](
            {},
            { locale: locale as any }
          ),
        },
        { name: 'robots', content: 'index,follow' },
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
  component: RoomDesignPage,
});
