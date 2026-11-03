import { PosterCreditPricingBlock } from '@/blocks/poster-credit-pricing';

/** Compatibility entry point for routes that still import the pricing block. */
export function Pricing() {
  return <PosterCreditPricingBlock />;
}
