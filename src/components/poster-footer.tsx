import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';

export function PosterFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="ps-footer">
      <div className="ps-footer-statement">
        {m['poster.footer.statement']()}
      </div>
      <div className="ps-footer-rule" />
      <div className="ps-footer-meta">
        <span>{m['poster.footer.copyright']({ year })}</span>
        <nav
          aria-label={m['poster.footer.navigation']()}
          className="ps-footer-links"
        >
          <Link href="/size-guide">{m['poster.footer.browse']()}</Link>
          <Link href="/settings/favorites">
            {m['poster.footer.favorites']()}
          </Link>
          <Link href="/settings/profile">{m['poster.footer.account']()}</Link>
          <Link href="/privacy-policy">{m['poster.footer.privacy']()}</Link>
          <Link href="/terms-of-service">{m['poster.footer.terms']()}</Link>
        </nav>
      </div>
      <span className="sr-only">{envConfigs.app_name}</span>
    </footer>
  );
}
