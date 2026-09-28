/**
 * Smart Price Suggestion — rule-based fair price estimator.
 *
 * This is intentionally structured as a pure function with a typed input/output
 * contract so a real ML model can be swapped in later without touching callers:
 * replace `estimatePrice`'s body with a model inference call, keep the signature.
 */

export type ConditionInput = "BRAND_NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "USED";

export interface PriceEstimateInput {
  categorySlug: string;
  originalPrice: number;
  ageMonths: number;
  condition: ConditionInput;
  hasAccessories?: boolean;
  brandTier?: "premium" | "standard" | "budget";
}

export interface PriceEstimateResult {
  low: number;
  high: number;
  suggested: number;
  reasons: string[];
}

const CONDITION_MULTIPLIER: Record<ConditionInput, number> = {
  BRAND_NEW: 0.9,
  LIKE_NEW: 0.75,
  GOOD: 0.6,
  FAIR: 0.45,
  USED: 0.32,
};

// Categories with steady campus demand hold their value better.
const HIGH_DEMAND_CATEGORIES = new Set(["books", "academic", "electronics", "gaming"]);

function ageDepreciation(ageMonths: number) {
  // Roughly 2.2% value lost per month, floored so old items still carry residual value.
  const factor = Math.max(0.35, 1 - ageMonths * 0.022);
  return factor;
}

export function estimatePrice(input: PriceEstimateInput): PriceEstimateResult {
  const reasons: string[] = [];

  const conditionFactor = CONDITION_MULTIPLIER[input.condition];
  const ageFactor = ageDepreciation(input.ageMonths);
  const demandFactor = HIGH_DEMAND_CATEGORIES.has(input.categorySlug) ? 1.08 : 1;
  const accessoriesFactor = input.hasAccessories ? 1.06 : 1;
  const brandFactor =
    input.brandTier === "premium" ? 1.1 : input.brandTier === "budget" ? 0.92 : 1;

  const base =
    input.originalPrice *
    conditionFactor *
    ageFactor *
    demandFactor *
    accessoriesFactor *
    brandFactor;

  const low = Math.round((base * 0.9) / 10) * 10;
  const high = Math.round((base * 1.12) / 10) * 10;
  const suggested = Math.round((base) / 10) * 10;

  if (input.condition === "BRAND_NEW" || input.condition === "LIKE_NEW") {
    reasons.push("Good condition");
  }
  if (HIGH_DEMAND_CATEGORIES.has(input.categorySlug)) {
    reasons.push("Popular category");
    reasons.push("High campus demand");
  }
  if (input.ageMonths < 12) {
    reasons.push("Product is less than 1 year old");
  }
  if (input.hasAccessories) {
    reasons.push("Comes with original accessories");
  }
  if (input.brandTier === "premium") {
    reasons.push("Premium brand retains resale value");
  }
  if (reasons.length === 0) {
    reasons.push("Priced from category and condition averages");
  }

  return { low, high, suggested, reasons };
}
