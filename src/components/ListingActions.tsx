"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pause, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ListingActions({ productId, status }: { productId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function update(newStatus: "ACTIVE" | "PAUSED" | "REMOVED") {
    setLoading(newStatus);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(newStatus === "REMOVED" ? "Listing removed." : "Listing updated.");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  if (status === "SOLD") return null;

  return (
    <div className="flex items-center gap-2">
      {status === "ACTIVE" ? (
        <Button size="sm" variant="outline" onClick={() => update("PAUSED")} disabled={!!loading}>
          {loading === "PAUSED" ? <Loader2 size={13} className="animate-spin" /> : <Pause size={13} />}
          Pause
        </Button>
      ) : status === "PAUSED" ? (
        <Button size="sm" variant="outline" onClick={() => update("ACTIVE")} disabled={!!loading}>
          {loading === "ACTIVE" ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
          Resume
        </Button>
      ) : null}
      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => update("REMOVED")} disabled={!!loading}>
        {loading === "REMOVED" ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
        Remove
      </Button>
    </div>
  );
}
