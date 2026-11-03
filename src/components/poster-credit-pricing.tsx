import { useMutation } from '@tanstack/react-query';
import { ArrowUpRight, Check, Coins, LoaderCircle, X } from 'lucide-react';
import { toast } from 'sonner';

import { creditsForPriceInCents } from '@/config/design-pricing';
import { POSTER_CREDITS } from '@/config/poster-generation';
import { apiPost } from '@/lib/api-client';
import { cn } from '@/lib/utils';

export interface PosterCreditPricingCopy {
  kicker: string;
  title: string;
  description: string;
  oneTime: string;
  credits: (value: number) => string;
  posters: (value: number) => string;
  buy: string;
  best: string;
  note: string;
  processing: string;
  checkoutError: string;
  inlineTitle: string;
  inlineDescription: string;
  close: string;
  afterPayment: string;
  usageLabel: string;
  perPoster: (value: number) => string;
}

type PackageId = 'hobby_one_time' | 'designer_one_time' | 'studio_one_time';

const PACKAGES: {
  id: PackageId;
  price: string;
  priceInCents: number;
  featured?: boolean;
}[] = [
  { id: 'hobby_one_time', price: '$5', priceInCents: 500 },
  {
    id: 'designer_one_time',
    price: '$15',
    priceInCents: 1500,
    featured: true,
  },
  { id: 'studio_one_time', price: '$39', priceInCents: 3900 },
];

function redirectWithPaymentFlag(redirect?: string): string {
  if (redirect) return redirect;
  if (typeof window === 'undefined') return '/?poster_paid=1';
  const target = new URL(window.location.href);
  target.searchParams.set('poster_paid', '1');
  return `${target.pathname}${target.search}${target.hash}`;
}

export function PosterCreditPricing({
  copy,
  mode = 'section',
  open = true,
  onClose,
  onBeforeCheckout,
  redirect,
}: {
  copy: PosterCreditPricingCopy;
  mode?: 'section' | 'inline';
  open?: boolean;
  onClose?: () => void;
  onBeforeCheckout?: () => void;
  redirect?: string;
}) {
  const checkout = useMutation({
    mutationFn: async (productId: PackageId) => {
      onBeforeCheckout?.();
      return apiPost<{ checkout_url?: string }>('/api/payment/checkout', {
        product_id: productId,
        redirect: redirectWithPaymentFlag(redirect),
      });
    },
    onSuccess: (data) => {
      if (!data?.checkout_url) {
        toast.error(copy.checkoutError);
        return;
      }
      window.location.href = data.checkout_url;
    },
    onError: (error: Error) => {
      toast.error(error.message || copy.checkoutError);
    },
  });

  if (!open) return null;

  const heading = mode === 'inline' ? copy.inlineTitle : copy.title;
  const description =
    mode === 'inline' ? copy.inlineDescription : copy.description;

  return (
    <section
      className={cn(
        'ps-credit-pricing',
        mode === 'inline' && 'ps-credit-pricing-inline'
      )}
      id={mode === 'section' ? 'pricing' : undefined}
      aria-labelledby={mode === 'section' ? 'poster-credit-title' : undefined}
    >
      <div className="ps-credit-pricing-head">
        <div>
          {mode === 'section' && <p className="ps-eyebrow">{copy.kicker}</p>}
          <h2 id={mode === 'section' ? 'poster-credit-title' : undefined}>
            {heading}
          </h2>
          <p>{description}</p>
        </div>
        {mode === 'inline' && onClose && (
          <button
            type="button"
            className="ps-credit-pricing-close"
            onClick={onClose}
            aria-label={copy.close}
          >
            <X size={17} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="ps-credit-pack-grid">
        {PACKAGES.map((item) => {
          const credits = creditsForPriceInCents(item.priceInCents);
          const standardPosters = Math.floor(credits / POSTER_CREDITS['1K']);
          const isLoading =
            checkout.isPending && checkout.variables === item.id;

          return (
            <article
              key={item.id}
              className={cn(
                'ps-credit-pack',
                item.featured && 'ps-credit-pack-featured'
              )}
            >
              {item.featured && (
                <span className="ps-credit-pack-badge">{copy.best}</span>
              )}
              <div className="ps-credit-pack-topline">
                <Coins size={16} aria-hidden="true" />
                <span>{copy.oneTime}</span>
              </div>
              <div className="ps-credit-pack-price">{item.price}</div>
              <strong>{copy.credits(credits)}</strong>
              <p>{copy.posters(standardPosters)}</p>
              <button
                type="button"
                className="ps-credit-pack-button"
                onClick={() => checkout.mutate(item.id)}
                disabled={checkout.isPending}
              >
                {isLoading ? (
                  <LoaderCircle
                    className="ps-ai-spin"
                    size={16}
                    aria-hidden="true"
                  />
                ) : (
                  <Check size={16} aria-hidden="true" />
                )}
                <span>{isLoading ? copy.processing : copy.buy}</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </button>
            </article>
          );
        })}
      </div>
      {mode === 'section' && (
        <div className="ps-credit-usage" aria-label={copy.usageLabel}>
          <span>{copy.usageLabel}</span>
          {Object.entries(POSTER_CREDITS).map(([quality, credits]) => (
            <span key={quality}>
              <strong>{quality}</strong>
              {copy.perPoster(credits)}
            </span>
          ))}
        </div>
      )}
      <p className="ps-credit-pricing-note">{copy.note}</p>
      {mode === 'inline' && (
        <p className="ps-credit-pricing-after">{copy.afterPayment}</p>
      )}
    </section>
  );
}
