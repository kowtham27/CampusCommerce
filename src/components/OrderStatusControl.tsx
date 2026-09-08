"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const NEXT_STATUS: Record<string, string> = {
  PENDING: "ACCEPTED",
  ACCEPTED: "READY_FOR_PICKUP",
  READY_FOR_PICKUP: "COMPLETED",
};
const NEXT_LABEL: Record<string, string> = {
  PENDING: "Accept order",
  ACCEPTED: "Mark ready for pickup",
  READY_FOR_PICKUP: "Mark completed",
};

export function OrderStatusControl({
  orderId,
  status,
  isSeller,
}: {
  orderId: string;
  status: string;
  isSeller: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function update(newStatus: string) {
    setLoading(newStatus);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't update order.");
        return;
      }
      toast.success("Order updated.");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  const next = NEXT_STATUS[status];
  const canCancel = status === "PENDING";

  if (!next && !canCancel) return null;

  return (
    <div className="flex items-center gap-2">
      {isSeller && next && (
        <Button size="sm" onClick={() => update(next)} disabled={!!loading}>
          {loading === next && <Loader2 size={13} className="animate-spin" />}
          {NEXT_LABEL[status]}
        </Button>
      )}
      {canCancel && (
        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => update("CANCELLED")} disabled={!!loading}>
          {loading === "CANCELLED" && <Loader2 size={13} className="animate-spin" />}
          Cancel
        </Button>
      )}
    </div>
  );
}
