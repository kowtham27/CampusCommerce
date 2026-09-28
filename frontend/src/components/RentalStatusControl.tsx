"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function RentalStatusControl({
  rentalId,
  status,
  isOwner,
}: {
  rentalId: string;
  status: string;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function update(newStatus: string) {
    setLoading(newStatus);
    try {
      const res = await fetch(`/api/rentals/${rentalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't update rental.");
        return;
      }
      toast.success("Rental updated.");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  if (isOwner && status === "REQUESTED") {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => update("APPROVED")} disabled={!!loading}>
          {loading === "APPROVED" && <Loader2 size={13} className="animate-spin" />} Approve
        </Button>
        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => update("REJECTED")} disabled={!!loading}>
          Reject
        </Button>
      </div>
    );
  }
  if (isOwner && status === "APPROVED") {
    return (
      <Button size="sm" onClick={() => update("ACTIVE")} disabled={!!loading}>
        {loading === "ACTIVE" && <Loader2 size={13} className="animate-spin" />} Mark active
      </Button>
    );
  }
  if (isOwner && status === "ACTIVE") {
    return (
      <Button size="sm" onClick={() => update("RETURNED")} disabled={!!loading}>
        {loading === "RETURNED" && <Loader2 size={13} className="animate-spin" />} Mark returned
      </Button>
    );
  }
  if (!isOwner && status === "REQUESTED") {
    return (
      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => update("CANCELLED")} disabled={!!loading}>
        Cancel request
      </Button>
    );
  }
  return null;
}
