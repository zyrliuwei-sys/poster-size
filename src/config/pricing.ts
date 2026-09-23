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
 * Room-design catalog. Credits follow EvoLink's current credit unit with the
 * customer-facing 7x multiplier defined in design-pricing.ts.
 * Keys MUST match what the pricing UI sends as product_id.
 */
export const pricingCatalog: Record<string, PricingProduct> = {
  hobby_one_time: {
    productId: 'hobby_one_time',
    productName: 'Hobby',
    planName: 'Hobby',
    description: 'One-time room design credits',
    type: PaymentType.ONE_TIME,
    priceInCents: 500,
    currency: 'usd',
    credits: creditsForPriceInCents(500),
  },
  designer_one_time: {
    productId: 'designer_one_time',
    productName: 'Designer',
    planName: 'Designer',
    description: 'One-time room design credits',
    type: PaymentType.ONE_TIME,
    priceInCents: 1500,
    currency: 'usd',
    credits: creditsForPriceInCents(1500),
  },
  studio_one_time: {
    productId: 'studio_one_time',
    productName: 'Studio',
    planName: 'Studio',
    description: 'One-time room design credits',
    type: PaymentType.ONE_TIME,
    priceInCents: 3900,
    currency: 'usd',
    credits: creditsForPriceInCents(3900),
  },
  starter_monthly: {
    productId: 'starter_monthly',
    productName: 'Starter',
    planName: 'Starter',
    description: 'Starter Monthly',
    type: PaymentType.SUBSCRIPTION,
    priceInCents: 900,
    currency: 'usd',
    credits: creditsForPriceInCents(900),
    creditsValidDays: 31,
    plan: {
      name: 'Starter',
      interval: PaymentInterval.MONTH,
      intervalCount: 1,
    },
  },
  pro_monthly: {
    productId: 'pro_monthly',
    productName: 'Pro',
    planName: 'Pro',
    description: 'Pro Monthly',
    type: PaymentType.SUBSCRIPTION,
    priceInCents: 1900,
    currency: 'usd',
    credits: creditsForPriceInCents(1900),
    creditsValidDays: 31,
    plan: { name: 'Pro', interval: PaymentInterval.MONTH, intervalCount: 1 },
  },
  enterprise_monthly: {
    productId: 'enterprise_monthly',
    productName: 'Enterprise',
    planName: 'Enterprise',
    description: 'Enterprise Monthly',
    type: PaymentType.SUBSCRIPTION,
    priceInCents: 3900,
    currency: 'usd',
    credits: creditsForPriceInCents(3900),
    creditsValidDays: 31,
    plan: {
      name: 'Enterprise',
      interval: PaymentInterval.MONTH,
      intervalCount: 1,
    },
  },
  starter_yearly: {
    productId: 'starter_yearly',
    productName: 'Starter',
    planName: 'Starter',
    description: 'Starter Yearly',
    type: PaymentType.SUBSCRIPTION,
    priceInCents: 7900,
    currency: 'usd',
    credits: creditsForPriceInCents(7900),
    creditsValidDays: 366,
    plan: { name: 'Starter', interval: PaymentInterval.YEAR, intervalCount: 1 },
  },
  pro_yearly: {
    productId: 'pro_yearly',
    productName: 'Pro',
    planName: 'Pro',
    description: 'Pro Yearly',
    type: PaymentType.SUBSCRIPTION,
    priceInCents: 16900,
    currency: 'usd',
    credits: creditsForPriceInCents(16900),
    creditsValidDays: 366,
    plan: { name: 'Pro', interval: PaymentInterval.YEAR, intervalCount: 1 },
  },
  enterprise_yearly: {
    productId: 'enterprise_yearly',
    productName: 'Enterprise',
    planName: 'Enterprise',
    description: 'Enterprise Yearly',
    type: PaymentType.SUBSCRIPTION,
    priceInCents: 34900,
    currency: 'usd',
    credits: creditsForPriceInCents(34900),
    creditsValidDays: 366,
    plan: {
      name: 'Enterprise',
      interval: PaymentInterval.YEAR,
      intervalCount: 1,
    },
  },
};

export function getPricingProduct(productId: string): PricingProduct | null {
  if (!productId) return null;
  return pricingCatalog[productId] ?? null;
}

export function listPricingProducts(): PricingProduct[] {
  return Object.values(pricingCatalog);
}
