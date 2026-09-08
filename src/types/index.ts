import type {
  Product,
  ProductImage,
  Category,
  CampusLocation,
  User,
} from "@prisma/client";

export type ProductCardData = Product & {
  category: Category;
  images: ProductImage[];
  seller: User;
  location: CampusLocation | null;
  sellerRating?: number;
};

export type PublicUser = Omit<User, "passwordHash">;

export const CONDITION_ORDER = ["BRAND_NEW", "LIKE_NEW", "GOOD", "FAIR", "USED"] as const;

export type SortOption =
  | "recommended"
  | "newest"
  | "price_low"
  | "price_high"
  | "nearest"
  | "popular";

export type TransactionTypeFilter = "all" | "sell" | "rent" | "exchange";
