import { ShoppingCart } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api";
import type { ProductCardData } from "@/types";
import { CartView, type CartItemView } from "@/components/CartView";

export const metadata = { title: "Cart" };

export default async function CartPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const cartItems = await api<{ id: string; product: ProductCardData }[]>("/cart");

  const items: CartItemView[] = cartItems.map((c) => ({
    cartItemId: c.id,
    productId: c.product.id,
    title: c.product.title,
    price: c.product.price,
    originalPrice: c.product.originalPrice,
    condition: c.product.condition,
    image: c.product.images[0]?.url ?? null,
    sellerId: c.product.sellerId,
    sellerName: c.product.seller.fullName,
    sellerEmail: c.product.seller.email,
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 md:py-8">
      <div className="mb-5 flex items-center gap-2">
        <ShoppingCart size={20} className="text-primary" />
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">My Cart</h1>
      </div>

      <CartView initialItems={items} />
    </div>
  );
}
