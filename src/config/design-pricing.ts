/**
 * Shared credit conversion and generation markup.
 *
 * EvoLink's current top-up tiers show 65 API credits per dollar at $10 and
 * 68 API credits per dollar from $50 upward. Top-ups keep those units;
 * the 8x markup applies only to generation charges. Multiplying both top-ups
 * and charges would cancel the requested markup.
 */
export const USER_CREDIT_MULTIPLIER = 8;
export const EVOLINK_STARTER_CREDITS_PER_DOLLAR = 65;
export const EVOLINK_STANDARD_CREDITS_PER_DOLLAR = 68;

/** A medium 1K room edit with one reference normally settles below this. */
export const DESIGN_CREDIT_RESERVE = 14;

export function creditsForPriceInCents(priceInCents: number): number {
  const dollars = Math.max(0, priceInCents) / 100;
  const apiCreditsPerDollar =
    dollars <= 10
      ? EVOLINK_STARTER_CREDITS_PER_DOLLAR
      : EVOLINK_STANDARD_CREDITS_PER_DOLLAR;
  return Math.round(dollars * apiCreditsPerDollar);
}

export function creditsForUpstreamUsage(upstreamCredits?: number): number {
  if (!upstreamCredits || !Number.isFinite(upstreamCredits)) {
    return DESIGN_CREDIT_RESERVE;
  }
  return Math.max(1, Math.ceil(upstreamCredits * USER_CREDIT_MULTIPLIER));
}
