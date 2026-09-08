import Image from "next/image";
import Link from "next/link";
import { Repeat, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/RatingStars";
import { LocationBadge } from "@/components/LocationBadge";
import { WishlistButton } from "@/components/WishlistButton";
import { CONDITION_LABELS } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";
import type { ProductCardData } from "@/types";

export function ProductCard({
  product,
  saved = false,
  className,
}: {
  product: ProductCardData;
  saved?: boolean;
  className?: string;
}) {
  const image = product.images[0]?.url;
  const rating = product.sellerRating ?? 4.6;

  return (
    <Link
      href={`/product/${product.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-muted">
        {image ? (
          <Image
            src={image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 280px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : null}
        <WishlistButton
          productId={product.id}
          initialSaved={saved}
          className="absolute right-2 top-2"
        />
        {product.isRentable && (
          <Badge variant="accent" className="absolute left-2 top-2">
            <Repeat size={11} /> Rent
          </Badge>
        )}
        {!product.isRentable && product.isExchangeable && (
          <Badge variant="accent" className="absolute left-2 top-2">
            <Tag size={11} /> Exchange
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="line-clamp-1 text-sm font-semibold text-foreground">
          {product.title}
        </p>

        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-foreground">
            {product.isRentable && product.rentDaily
              ? `${formatPrice(product.rentDaily)}/day`
              : formatPrice(product.price)}
          </span>
          {product.originalPrice && !product.isRentable && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <RatingStars rating={rating} size={12} />
          <LocationBadge meters={product.distanceMeters} />
        </div>

        <span className="text-xs text-muted-foreground">
          {CONDITION_LABELS[product.condition]}
        </span>
      </div>
    </Link>
  );
}
