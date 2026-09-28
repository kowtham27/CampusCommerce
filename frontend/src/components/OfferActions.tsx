"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function OfferActions({ offerId }: { offerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [countering, setCountering] = useState(false);
  const [counterAmount, setCounterAmount] = useState("");

  async function act(action: "accept" | "reject" | "counter") {
    if (action === "counter" && !countering) {
      setCountering(true);
      return;
    }
    setLoading(action);
    try {
      const res = await fetch(`/api/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, counterAmount: counterAmount ? Number(counterAmount) : undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong.");
        return;
      }
      toast.success(
        action === "accept" ? "Offer accepted — order created." : action === "reject" ? "Offer declined." : "Counter offer sent."
      );
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  if (countering) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="New amount"
          value={counterAmount}
          onChange={(e) => setCounterAmount(e.target.value)}
          className="h-8 w-28"
        />
        <Button size="sm" onClick={() => act("counter")} disabled={!counterAmount || loading === "counter"}>
          {loading === "counter" && <Loader2 size={13} className="animate-spin" />}
          Send
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setCountering(false)}>Cancel</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={() => act("accept")} disabled={!!loading}>
        {loading === "accept" && <Loader2 size={13} className="animate-spin" />}
        Accept
      </Button>
      <Button size="sm" variant="outline" onClick={() => act("counter")} disabled={!!loading}>
        Counter
      </Button>
      <Button size="sm" variant="ghost" onClick={() => act("reject")} disabled={!!loading} className="text-destructive hover:text-destructive">
        {loading === "reject" && <Loader2 size={13} className="animate-spin" />}
        Reject
      </Button>
    </div>
  );
}
