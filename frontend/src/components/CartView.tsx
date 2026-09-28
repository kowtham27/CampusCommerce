"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { EmptyState } from "@/components/EmptyState";
import { CONDITION_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export type CartItemView = {
  cartItemId: string;
  productId: string;
  title: string;
  price: number;
  originalPrice: number | null;
  condition: string;
  image: string | null;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
};

export function CartView({ initialItems }: { initialItems: CartItemView[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState<string | "all" | null>(null);

  const groups = useMemo(() => {
    const bySeller = new Map<string, { sellerId: string; sellerName: string; sellerEmail: string; items: CartItemView[] }>();
    for (const item of items) {
      const g = bySeller.get(item.sellerId);
      if (g) g.items.push(item);
      else bySeller.set(item.sellerId, { sellerId: item.sellerId, sellerName: item.sellerName, sellerEmail: item.sellerEmail, items: [item] });
    }
    return Array.from(bySeller.values());
  }, [items]);

  const total = items.reduce((sum, i) => sum + i.price, 0);

  async function removeItem(item: CartItemView) {
    setRemovingId(item.cartItemId);
    const prev = items;
    setItems((cur) => cur.filter((i) => i.cartItemId !== item.cartItemId));
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.productId }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setItems(prev);
      toast.error("Couldn't remove this item. Try again.");
    } finally {
      setRemovingId(null);
    }
  }

  async function checkout(sellerId?: string) {
    const key = sellerId ?? "all";
    setCheckingOut(key);
    try {
      const res = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sellerId ? { sellerId } : {}),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error ?? "Couldn't complete checkout.");
        return;
      }
      const { created, skipped } = data as {
        created: { orderId: string; code: string; productId: string }[];
        skipped: { productId: string; productTitle: string; reason: string }[];
      };

      const createdIds = new Set(created.map((c) => c.productId));
      setItems((cur) => cur.filter((i) => !createdIds.has(i.productId)));

      if (created.length > 0) {
        toast.success(
          created.length === 1
            ? `Order #${created[0].code} placed!`
            : `${created.length} orders placed!`
        );
      }
      if (skipped.length > 0) {
        toast.error(
          skipped.map((s) => `${s.productTitle}: ${s.reason}`).join(" · ")
        );
      }
      if (created.length > 0) router.refresh();
    } catch {
      toast.error("Couldn't complete checkout. Try again.");
    } finally {
      setCheckingOut(null);
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Your cart is empty"
        description="Add items you want to buy and check out with each seller in one go."
        actionLabel="Explore Marketplace"
        actionHref="/explore"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted p-4">
        <div>
          <p className="text-sm text-muted-foreground">{items.length} item{items.length === 1 ? "" : "s"} · {groups.length} seller{groups.length === 1 ? "" : "s"}</p>
          <p className="text-lg font-bold text-foreground">{formatPrice(total)}</p>
        </div>
        <Button onClick={() => checkout()} disabled={checkingOut !== null}>
          {checkingOut === "all" && <Loader2 size={15} className="animate-spin" />}
          Checkout All
        </Button>
      </div>

      {groups.map((group) => (
        <div key={group.sellerId} className="rounded-lg border border-border bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <Link href={`/profile/${group.sellerId}`} className="flex items-center gap-2 hover:underline">
              <UserAvatar email={group.sellerEmail} className="h-7 w-7" />
              <span className="text-sm font-semibold text-foreground">{group.sellerName}</span>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={() => checkout(group.sellerId)}
              disabled={checkingOut !== null}
            >
              {checkingOut === group.sellerId && <Loader2 size={14} className="animate-spin" />}
              Checkout with {group.sellerName.split(" ")[0]}
            </Button>
          </div>

          <div className="divide-y divide-border">
            {group.items.map((item) => (
              <div key={item.cartItemId} className="flex items-center gap-3 py-3">
                <Link href={`/product/${item.productId}`} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-surface-muted">
                  {item.image && <Image src={item.image} alt="" fill className="object-cover" />}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${item.productId}`} className="line-clamp-1 text-sm font-medium text-foreground hover:underline">
                    {item.title}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{CONDITION_LABELS[item.condition] ?? item.condition}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{formatPrice(item.price)}</p>
                  {item.originalPrice && (
                    <p className="text-xs text-muted-foreground line-through">{formatPrice(item.originalPrice)}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item)}
                  disabled={removingId === item.cartItemId}
                  aria-label="Remove from cart"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted hover:text-destructive disabled:opacity-50"
                >
                  {removingId === item.cartItemId ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
