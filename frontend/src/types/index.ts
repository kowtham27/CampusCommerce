/**
 * Shapes returned by the Express API (see /backend). Dates arrive as ISO
 * strings over JSON, so every timestamp here is typed as `string`.
 */

type ISODate = string;

export type Role = "STUDENT" | "ADMIN";
export type AccountStatus = "ACTIVE" | "SUSPENDED";
export type Condition = "BRAND_NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "USED";
export type ListingStatus = "ACTIVE" | "PAUSED" | "SOLD" | "REMOVED";
export type OrderStatus = "PENDING" | "ACCEPTED" | "READY_FOR_PICKUP" | "COMPLETED" | "CANCELLED";
export type OfferStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "COUNTERED" | "WITHDRAWN";
export type RentalStatus = "REQUESTED" | "APPROVED" | "ACTIVE" | "RETURNED" | "REJECTED" | "CANCELLED";
export type ExchangeStatus = "REQUESTED" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";
export type ReportStatus = "PENDING" | "REVIEWED" | "DISMISSED";

/** What any signed-in student can see about another user. */
export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  department: string | null;
  year: string | null;
  hostelBlock: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: Role;
  emailVerified: boolean;
  trustScore: number;
  responseRate: number;
  createdAt: ISODate;
}

/** The signed-in user's own account. */
export interface SelfUser extends PublicUser {
  phone: string | null;
  status: AccountStatus;
  onboarded: boolean;
  interests: string[];
  savedSearches: string[];
  profileVisible: boolean;
  contactVisible: boolean;
  notifyMessages: boolean;
  notifyOffers: boolean;
  notifyOrders: boolean;
  notifyRecs: boolean;
  updatedAt: ISODate;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface CampusLocation {
  id: string;
  name: string;
  type: string;
  latOffset: number;
  lngOffset: number;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  position: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  sellerId: string;
  condition: Condition;
  originalPrice: number | null;
  price: number;
  isSellable: boolean;
  isRentable: boolean;
  rentDaily: number | null;
  rentWeekly: number | null;
  rentMonthly: number | null;
  rentDeposit: number | null;
  isExchangeable: boolean;
  exchangeWants: string[];
  tags: string[];
  brand: string | null;
  ageMonths: number | null;
  locationId: string | null;
  status: ListingStatus;
  viewCount: number;
  distanceMeters: number;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export type ProductWithImages = Product & { images: ProductImage[] };

export type ProductCardData = ProductWithImages & {
  category: Category;
  seller: PublicUser;
  location: CampusLocation | null;
  sellerRating?: number;
};

export interface Order {
  id: string;
  code: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  price: number;
  status: OrderStatus;
  pickupNote: string | null;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Offer {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  message: string | null;
  status: OfferStatus;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Rental {
  id: string;
  productId: string;
  renterId: string;
  ownerId: string;
  startDate: ISODate;
  endDate: ISODate;
  totalPrice: number;
  deposit: number;
  status: RentalStatus;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Exchange {
  id: string;
  productId: string;
  requesterId: string;
  ownerId: string;
  offeredItem: string;
  status: ExchangeStatus;
  message: string | null;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  read: boolean;
  createdAt: ISODate;
}

export interface Conversation {
  id: string;
  productId: string | null;
  participantAId: string;
  participantBId: string;
  lastMessageAt: ISODate;
  createdAt: ISODate;
  product: ProductWithImages | null;
  other: PublicUser;
}

export type ConversationSummary = Conversation & { lastMessage: Message | null; unreadCount: number };
export type ConversationDetail = Conversation & { messages: Message[] };

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: ISODate;
}

export interface Review {
  id: string;
  authorId: string;
  subjectId: string;
  transactionId: string | null;
  overallRating: number;
  conditionRating: number;
  communicationRating: number;
  transactionRating: number;
  comment: string | null;
  createdAt: ISODate;
}

export interface Report {
  id: string;
  productId: string | null;
  reportedUserId: string | null;
  reportedById: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  action: string | null;
  createdAt: ISODate;
  resolvedAt: ISODate | null;
}

export interface SellerStats {
  avgRating: number | null;
  reviewCount: number;
  completedSales: number;
  completedRentals: number;
  completedExchanges: number;
}

export interface UserProfile {
  user: PublicUser & { phone: string | null };
  isOwn: boolean;
  listings: ProductCardData[];
  reviews: (Review & { author: PublicUser })[];
  boughtCount: number;
  soldCount: number;
  trust: { score: number; badges: string[] };
  impact: { itemsGivenSecondLife: number };
}

export const CONDITION_ORDER = ["BRAND_NEW", "LIKE_NEW", "GOOD", "FAIR", "USED"] as const;

export type SortOption =
  | "recommended"
  | "newest"
  | "price_low"
  | "price_high"
  | "nearest"
  | "popular";

export type TransactionTypeFilter = "all" | "sell" | "rent" | "exchange";
