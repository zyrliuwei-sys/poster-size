import { m } from '@/paraglide/messages.js';
import {
  PosterCreditPricing,
  type PosterCreditPricingCopy,
} from '@/components/poster-credit-pricing';

export function getPosterCreditPricingCopy(): PosterCreditPricingCopy {
  return {
    kicker: m['poster.pricing.kicker'](),
    title: m['poster.pricing.title'](),
    description: m['poster.pricing.description'](),
    oneTime: m['poster.pricing.one_time'](),
    credits: (value) => m['poster.pricing.credits']({ credits: value }),
    posters: (value) => m['poster.pricing.posters']({ count: value }),
    buy: m['poster.pricing.buy'](),
    best: m['poster.pricing.best'](),
    note: m['poster.pricing.note'](),
    processing: m['poster.pricing.processing'](),
    checkoutError: m['poster.pricing.checkout_error'](),
    inlineTitle: m['poster.pricing.inline_title'](),
    inlineDescription: m['poster.pricing.inline_description'](),
    close: m['poster.pricing.close'](),
    afterPayment: m['poster.pricing.after_payment'](),
    usageLabel: m['poster.pricing.usage_label'](),
    perPoster: (value) => m['poster.pricing.per_poster']({ credits: value }),
  };
}

export function PosterCreditPricingBlock() {
  return <PosterCreditPricing copy={getPosterCreditPricingCopy()} />;
}
