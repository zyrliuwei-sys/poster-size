import { m } from '@/paraglide/messages.js';
import { SiteFooter } from '@/components/site-footer';

export function Footer() {
  return (
    <SiteFooter
      columns={[
        {
          title: m['landing.footer.col_product'](),
          links: [{ label: m['landing.nav.pricing'](), href: '/pricing' }],
        },
        {
          title: m['landing.footer.col_resources'](),
          links: [{ label: m['landing.nav.faq'](), href: '/#faq' }],
        },
        {
          title: m['landing.footer.col_legal'](),
          links: [
            { label: m['landing.footer.privacy'](), href: '/privacy-policy' },
            { label: m['landing.footer.terms'](), href: '/terms-of-service' },
          ],
        },
      ]}
    />
  );
}
