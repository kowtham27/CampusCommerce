"use client";

import { useState, useTransition } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CartButton({
  productId,
  initialInCart,
  className,
}: {
  productId: string;
  initialInCart: boolean;
  className?: string;
}) {
  const [inCart, setInCart] = useState(initialInCart);
  const [pending, startTransition] = useTransition();

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !inCart;
    setInCart(next);
    startTransition(async () => {
      try {
        const res = await fetch("/api/cart", {
          method: next ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error);
        toast.success(next ? "Added to cart" : "Removed from cart");
      } catch (err) {
        setInCart(!next);
        toast.error(err instanceof Error && err.message ? err.message : "Couldn't update your cart. Try again.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={inCart ? "Remove from cart" : "Add to cart"}
      aria-pressed={inCart}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 backdrop-blur-sm shadow-sm transition-transform active:scale-90 disabled:opacity-60",
        className
      )}
    >
      {inCart ? (
        <Check size={16} className="text-primary" />
      ) : (
        <ShoppingCart size={16} className="text-foreground" />
      )}
    </button>
  );
}
