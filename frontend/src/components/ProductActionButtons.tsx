"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle, ShoppingBag, ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ChatWithSellerButton({
  sellerId,
  productId,
  label = "Chat with Seller",
  variant = "outline",
}: {
  sellerId: string;
  productId?: string;
  label?: string;
  variant?: "outline" | "default";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: sellerId, productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/messages/${data.id}`);
    } catch {
      toast.error("Couldn't start a conversation. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant={variant} onClick={start} disabled={loading} className="w-full">
      {loading ? <Loader2 size={15} className="animate-spin" /> : <MessageCircle size={15} />}
      {label}
    </Button>
  );
}

export function BuyNowButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function buy() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't place this order.");
        return;
      }
      toast.success(`Order #${data.code} placed!`);
      router.push("/orders");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={buy} disabled={loading} className="w-full">
      {loading ? <Loader2 size={15} className="animate-spin" /> : <ShoppingBag size={15} />}
      Buy Now
    </Button>
  );
}

export function AddToCartButton({ productId, initialInCart }: { productId: string; initialInCart: boolean }) {
  const [inCart, setInCart] = useState(initialInCart);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = !inCart;
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error ?? "Couldn't update your cart.");
        return;
      }
      setInCart(next);
      toast.success(next ? "Added to cart" : "Removed from cart");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={toggle} disabled={loading} className="w-full">
      {loading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : inCart ? (
        <Check size={15} />
      ) : (
        <ShoppingCart size={15} />
      )}
      {inCart ? "In Cart" : "Add to Cart"}
    </Button>
  );
}
