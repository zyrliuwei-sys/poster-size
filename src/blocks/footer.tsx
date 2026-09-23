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
          title: m['landing.footer.col_rooms'](),
          links: [
            {
              label: m['landing.rooms.living'](),
              href: '/ai-living-room-design',
            },
            { label: m['landing.rooms.bedroom'](), href: '/ai-bedroom-design' },
            { label: m['landing.rooms.kitchen'](), href: '/ai-kitchen-design' },
            {
              label: m['landing.rooms.bathroom'](),
              href: '/ai-bathroom-design',
            },
            {
              label: m['landing.rooms.dining'](),
              href: '/ai-dining-room-design',
            },
            {
              label: m['landing.rooms.office'](),
              href: '/ai-home-office-design',
            },
            {
              label: m['landing.rooms.kids'](),
              href: '/ai-kids-room-design',
            },
            {
              label: m['landing.rooms.basement'](),
              href: '/ai-basement-design',
            },
            { label: m['landing.rooms.attic'](), href: '/ai-attic-design' },
            {
              label: m['landing.rooms.study'](),
              href: '/ai-study-room-design',
            },
          ],
        },
        {
          title: m['landing.footer.col_tools'](),
          links: [
            {
              label: m['landing.footer.free_page'](),
              href: '/ai-room-design-free',
            },
            { label: m['landing.rooms.planner'](), href: '/ai-room-planner' },
            { label: m['landing.rooms.makeover'](), href: '/ai-room-makeover' },
            {
              label: m['landing.rooms.organizer'](),
              href: '/ai-room-organizer',
            },
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
