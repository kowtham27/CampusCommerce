import { notFound } from "next/navigation";
import { ShieldCheck, Leaf } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserAvatar } from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/RatingStars";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProductGrid } from "@/components/ProductGrid";
import { EmptyState } from "@/components/EmptyState";
import { ReportModal } from "@/components/ReportModal";
import { ChatWithSellerButton } from "@/components/ProductActionButtons";
import { computeTrustScore } from "@/services/trustScoreService";
import { getUserImpact } from "@/services/sustainabilityService";
import { getSavedProductIds } from "@/services/wishlistService";
import { formatRelativeTime } from "@/lib/utils";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const id = rawId === "me" ? currentUser.id : rawId;
  const profile = await prisma.user.findUnique({ where: { id } });
  if (!profile) notFound();

  const isOwn = profile.id === currentUser.id;

  const [listings, reviews, boughtCount, soldCount, trust, impact, savedIds] = await Promise.all([
    prisma.product.findMany({
      where: { sellerId: profile.id, status: "ACTIVE" },
      include: { category: true, images: { orderBy: { position: "asc" } }, seller: true, location: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.findMany({
      where: { subjectId: profile.id },
      include: { author: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where: { buyerId: profile.id, status: "COMPLETED" } }),
    prisma.order.count({ where: { sellerId: profile.id, status: "COMPLETED" } }),
    computeTrustScore(profile.id),
    getUserImpact(profile.id),
    getSavedProductIds(currentUser.id),
  ]);

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.overallRating, 0) / reviews.length : 0;
  const totalTransactions = boughtCount + soldCount;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:py-8">
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
          <UserAvatar email={profile.email} className="h-20 w-20" fallbackClassName="text-xl" />
          <div className="flex-1 space-y-1.5">
            <h1 className="text-xl font-bold text-foreground">{profile.fullName}</h1>
            <p className="text-sm text-muted-foreground">
              {[profile.department, profile.year].filter(Boolean).join(" · ") || "Campus Commerce member"}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1 sm:justify-start">
              {profile.emailVerified && (
                <span className="flex items-center gap-1 text-xs font-medium text-primary">
                  <ShieldCheck size={13} /> Verified Student
                </span>
              )}
              <RatingStars rating={avgRating || 4.5} size={14} />
              <span className="text-xs text-muted-foreground">{totalTransactions} transactions</span>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5 pt-1 sm:justify-start">
              {trust.badges.map((b) => <Badge key={b} variant="secondary">{b}</Badge>)}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 sm:items-end">
            <div className="text-center sm:text-right">
              <p className="text-2xl font-extrabold text-foreground">{trust.score}<span className="text-sm text-muted-foreground">/100</span></p>
              <p className="text-xs text-muted-foreground">Trust Score</p>
            </div>
            {!isOwn && (
              <div className="flex gap-2">
                <ChatWithSellerButton sellerId={profile.id} label="Message" variant="default" />
                <ReportModal reportedUserId={profile.id} />
              </div>
            )}
          </div>
        </div>

        {impact.itemsGivenSecondLife > 0 && (
          <p className="mt-4 flex items-center gap-1.5 rounded-md bg-primary-tint px-3 py-2 text-xs font-medium text-primary">
            <Leaf size={13} /> {profile.fullName.split(" ")[0]} helped give {impact.itemsGivenSecondLife} item{impact.itemsGivenSecondLife > 1 ? "s" : ""} a second life.
          </p>
        )}
      </div>

      <Tabs defaultValue="listings" className="mt-6">
        <TabsList>
          <TabsTrigger value="listings">Listings ({listings.length})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          {listings.length === 0 ? (
            <EmptyState title="No active listings" />
          ) : (
            <ProductGrid products={listings} savedIds={savedIds} />
          )}
        </TabsContent>

        <TabsContent value="reviews">
          {reviews.length === 0 ? (
            <EmptyState title="No reviews yet" />
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-lg border border-border bg-surface p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{r.author.fullName}</p>
                    <RatingStars rating={r.overallRating} size={13} />
                  </div>
                  {r.comment && <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>}
                  <p className="mt-1 text-[11px] text-muted-foreground">{formatRelativeTime(r.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="transactions">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xl font-bold text-foreground">{totalTransactions}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xl font-bold text-foreground">{soldCount}</p>
              <p className="text-xs text-muted-foreground">Items Sold</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xl font-bold text-foreground">{boughtCount}</p>
              <p className="text-xs text-muted-foreground">Items Bought</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="about">
          <div className="space-y-3 rounded-lg border border-border bg-surface p-4 text-sm">
            <p><span className="font-medium text-foreground">Department:</span> <span className="text-muted-foreground">{profile.department ?? "—"}</span></p>
            <p><span className="font-medium text-foreground">Year:</span> <span className="text-muted-foreground">{profile.year ?? "—"}</span></p>
            <p><span className="font-medium text-foreground">Hostel/Block:</span> <span className="text-muted-foreground">{profile.hostelBlock ?? "—"}</span></p>
            <p><span className="font-medium text-foreground">Member since:</span> <span className="text-muted-foreground">{profile.createdAt.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span></p>
            {profile.bio && <p className="text-muted-foreground">{profile.bio}</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
