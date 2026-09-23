import { createFileRoute, redirect } from '@tanstack/react-router';

/**
 * Keep the legacy/product entry point usable until it gets its own page.
 * The router rewrite will localize the destination when the active locale is
 * not the default one.
 */
export const Route = createFileRoute('/ai-livestream')({
  loader: () => {
    throw redirect({ to: '/' });
  },
});
