import { useState } from 'react';
import { ArrowUpRight, Heart, Menu, X } from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { SiteUserMenu } from '@/components/site-user-menu';
import { ThemeToggle } from '@/components/theme-toggle';

export function PosterHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="ps-nav-wrap">
      <div className="ps-nav">
        <Link href="/" className="ps-wordmark" aria-label={envConfigs.app_name}>
          <img
            src={envConfigs.app_logo}
            alt=""
            width={24}
            height={27}
            className="ps-wordmark-logo"
          />
          <span>{envConfigs.app_name}</span>
        </Link>

        <nav className="ps-nav-links" aria-label={m['poster.nav.primary']()}>
          <Link href="/size-guide">{m['poster.nav.browse']()}</Link>
          <Link href="/settings/favorites">{m['poster.nav.favorites']()}</Link>
        </nav>

        <div className="ps-nav-actions">
          <ThemeToggle className="ps-theme-toggle" />
          {user ? (
            <SiteUserMenu
              name={user.name || m['poster.nav.user']()}
              email={user.email}
              image={user.image}
            />
          ) : (
            <Link href="/sign-in" className="ps-nav-signin">
              {m['poster.nav.sign_in']()}
            </Link>
          )}
          <Link href="/poster-generator" className="ps-nav-cta">
            {m['poster.nav.generator']()}
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>

        <div className="ps-nav-mobile-actions">
          <Link
            href="/settings/favorites"
            className="ps-icon-link"
            aria-label={m['poster.nav.favorites']()}
          >
            <Heart size={17} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="ps-menu-button"
            aria-label={
              mobileOpen ? m['poster.nav.close']() : m['poster.nav.menu']()
            }
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="ps-mobile-panel">
          <Link href="/poster-generator" onClick={() => setMobileOpen(false)}>
            {m['poster.nav.generator']()}
          </Link>
          <Link href="/size-guide" onClick={() => setMobileOpen(false)}>
            {m['poster.nav.browse']()}
          </Link>
          <Link href="/settings/favorites" onClick={() => setMobileOpen(false)}>
            {m['poster.nav.favorites']()}
          </Link>
          <div className="ps-mobile-divider" />
          <ThemeToggle className="ps-mobile-theme" />
          {user ? (
            <SiteUserMenu
              name={user.name || m['poster.nav.user']()}
              email={user.email}
              image={user.image}
            />
          ) : (
            <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
              {m['poster.nav.sign_in']()}
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
