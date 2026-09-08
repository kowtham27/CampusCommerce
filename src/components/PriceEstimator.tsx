"use client";

import { Sparkles, Check } from "lucide-react";
import { estimatePrice, type ConditionInput } from "@/services/pricingService";
import { formatPrice } from "@/lib/utils";

export function PriceEstimator({
  categorySlug,
  originalPrice,
  ageMonths,
  condition,
  brand,
  onApply,
}: {
  categorySlug: string;
  originalPrice: number;
  ageMonths: number;
  condition: ConditionInput;
  brand?: string;
  onApply: (price: number) => void;
}) {
  if (!originalPrice || originalPrice <= 0) {
    return (
      <div className="rounded-lg border border-dashed border-border-strong p-4 text-sm text-muted-foreground">
        Enter the original price to see a Smart Price Suggestion.
      </div>
    );
  }

  const result = estimatePrice({
    categorySlug,
    originalPrice,
    ageMonths: ageMonths || 6,
    condition,
    hasAccessories: false,
    brandTier: brand ? "standard" : undefined,
  });

  return (
    <div className="rounded-lg border border-primary/25 bg-primary-tint p-4">
      <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-primary">
        <Sparkles size={15} /> AI Price Suggestion
      </p>
      <p className="text-xs text-muted-foreground">Recommended price</p>
      <p className="text-lg font-bold text-foreground">
        {formatPrice(result.low)} – {formatPrice(result.high)}
      </p>
      <div className="mt-2 flex items-center justify-between rounded-md bg-surface px-3 py-2">
        <div>
          <p className="text-[11px] text-muted-foreground">Suggested listing price</p>
          <p className="text-base font-bold text-foreground">{formatPrice(result.suggested)}</p>
        </div>
        <button
          type="button"
          onClick={() => onApply(result.suggested)}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          Use this price
        </button>
      </div>
      <ul className="mt-3 space-y-1">
        {result.reasons.map((r) => (
          <li key={r} className="flex items-center gap-1.5 text-xs text-foreground">
            <Check size={12} className="text-primary" /> {r}
          </li>
        ))}
      </ul>
    </div>
  );
}
