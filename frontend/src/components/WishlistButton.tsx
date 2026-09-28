"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  initialSaved,
  className,
}: {
  productId: string;
  initialSaved: boolean;
  className?: string;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !saved;
    setSaved(next);
    startTransition(async () => {
      try {
        const res = await fetch("/api/wishlist", {
          method: next ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        if (!res.ok) throw new Error();
        toast.success(next ? "Saved to wishlist" : "Removed from wishlist");
      } catch {
        setSaved(!next);
        toast.error("Couldn't update your wishlist. Try again.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 backdrop-blur-sm shadow-sm transition-transform active:scale-90 disabled:opacity-60",
        className
      )}
    >
      <Heart
        size={16}
        className={cn(
          "transition-colors",
          saved ? "fill-destructive text-destructive" : "text-foreground"
        )}
      />
    </button>
  );
}
