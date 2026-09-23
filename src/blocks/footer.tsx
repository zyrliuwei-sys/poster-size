import { m } from '@/paraglide/messages.js';
import { SiteFooter } from '@/components/site-footer';

export function Footer() {
  return (
    <SiteFooter
      tagline={m['landing.footer.tagline']()}
      columns={[
        {
          title: m['landing.footer.col_product'](),
          links: [
            { label: m['landing.nav.create'](), href: '/room-design' },
            { label: m['landing.nav.how'](), href: '/#how' },
            { label: m['landing.nav.gallery'](), href: '/#gallery' },
            { label: m['landing.nav.pricing'](), href: '/pricing' },
          ],
        },
        {
          title: m['landing.footer.col_resources'](),
          links: [
            { label: m['landing.blog.title'](), href: '/blog' },
            { label: m['landing.nav.faq'](), href: '/#faq' },
          ],
        },
        {
          title: m['landing.footer.col_account'](),
          links: [
            { label: m['landing.footer.sign_in'](), href: '/sign-in' },
            { label: m['landing.footer.sign_up'](), href: '/sign-up' },
          ],
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
