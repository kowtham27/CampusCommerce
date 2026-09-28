import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { RatingStars } from "@/components/RatingStars";

export function SellerCard({
  id,
  fullName,
  email,
  department,
  year,
  rating,
  transactionCount,
  verified,
}: {
  id: string;
  fullName: string;
  email: string;
  department?: string | null;
  year?: string | null;
  rating: number;
  transactionCount: number;
  verified: boolean;
}) {
  return (
    <Link
      href={`/profile/${id}`}
      className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3.5 transition-colors hover:bg-surface-muted"
    >
      <UserAvatar email={email} className="h-11 w-11" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-foreground">{fullName}</p>
          {verified && <ShieldCheck size={13} className="shrink-0 text-primary" />}
        </div>
        <p className="text-xs text-muted-foreground">
          {[department, year].filter(Boolean).join(" · ") || "Campus Commerce member"}
        </p>
      </div>
      <div className="text-right">
        <RatingStars rating={rating} size={13} />
        <p className="text-[11px] text-muted-foreground">{transactionCount} transactions</p>
      </div>
    </Link>
  );
}
