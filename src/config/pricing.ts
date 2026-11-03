/**
 * Authoritative pricing catalog.
 *
 * The checkout API uses this as the SOURCE OF TRUTH for price/credits/duration.
 * Any price, credits, or plan info sent by the client is IGNORED — only the
 * product_id is honored, and everything else is looked up here.
 *
 * To change pricing, edit this file and redeploy. Admin UI cannot alter prices.
 */

import { PaymentInterval, PaymentType } from '@/core/payment/types';
import { creditsForPriceInCents } from '@/config/design-pricing';

export type PricingPlanInfo = {
  name: string;
  interval: PaymentInterval;
  intervalCount: number;
};

export type PricingProduct = {
  productId: string;
  productName: string;
  planName: string;
  description: string;
  type: PaymentType;
  priceInCents: number;
  currency: string;
  credits: number;
  creditsValidDays?: number;
  plan?: PricingPlanInfo;
};

/**
 * Poster-credit catalog. Credits follow EvoLink's current credit unit with the
 * customer-facing 8x multiplier defined in design-pricing.ts. All products are
 * one-time packs. There are no subscriptions in this product.
 * Keys MUST match what the pricing UI sends as product_id.
 */
export const pricingCatalog: Record<string, PricingProduct> = {
  hobby_one_time: {
    productId: 'hobby_one_time',
    productName: 'Starter poster credits',
    planName: 'Starter poster credits',
    description: 'One-time poster credits',
    type: PaymentType.ONE_TIME,
    priceInCents: 500,
    currency: 'usd',
    credits: creditsForPriceInCents(500),
  },
  designer_one_time: {
    productId: 'designer_one_time',
    productName: 'Maker poster credits',
    planName: 'Maker poster credits',
    description: 'One-time poster credits',
    type: PaymentType.ONE_TIME,
    priceInCents: 1500,
    currency: 'usd',
    credits: creditsForPriceInCents(1500),
  },
  studio_one_time: {
    productId: 'studio_one_time',
    productName: 'Studio poster credits',
    planName: 'Studio poster credits',
    description: 'One-time poster credits',
    type: PaymentType.ONE_TIME,
    priceInCents: 3900,
    currency: 'usd',
    credits: creditsForPriceInCents(3900),
  },
};

export function getPricingProduct(productId: string): PricingProduct | null {
  if (!productId) return null;
  return pricingCatalog[productId] ?? null;
}

export function listPricingProducts(): PricingProduct[] {
  return Object.values(pricingCatalog);
}
