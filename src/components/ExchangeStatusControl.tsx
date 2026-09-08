"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ExchangeStatusControl({
  exchangeId,
  status,
  isOwner,
}: {
  exchangeId: string;
  status: string;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function update(newStatus: string) {
    setLoading(newStatus);
    try {
      const res = await fetch(`/api/exchanges/${exchangeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't update exchange.");
        return;
      }
      toast.success("Exchange updated.");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  if (isOwner && status === "REQUESTED") {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => update("ACCEPTED")} disabled={!!loading}>
          {loading === "ACCEPTED" && <Loader2 size={13} className="animate-spin" />} Accept
        </Button>
        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => update("REJECTED")} disabled={!!loading}>
          Reject
        </Button>
      </div>
    );
  }
  if (isOwner && status === "ACCEPTED") {
    return (
      <Button size="sm" onClick={() => update("COMPLETED")} disabled={!!loading}>
        {loading === "COMPLETED" && <Loader2 size={13} className="animate-spin" />} Mark completed
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
