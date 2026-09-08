"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ExchangeRequestModal({
  productId,
  productTitle,
  wants,
  trigger,
}: {
  productId: string;
  productTitle: string;
  wants: string[];
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [offeredItem, setOfferedItem] = useState(wants[0] ?? "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!offeredItem.trim()) {
      toast.error("Tell them what you're offering.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/exchanges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, offeredItem, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't send your exchange request.");
        return;
      }
      toast.success("Exchange request sent.");
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exchange request</DialogTitle>
          <DialogDescription>
            Offer something in exchange for &ldquo;{productTitle}&rdquo;
            {wants.length > 0 && ` — they're looking for: ${wants.join(", ")}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="offered">Your item</Label>
            <Input id="offered" value={offeredItem} onChange={(e) => setOfferedItem(e.target.value)} placeholder="Scientific calculator" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="exchange-message">Message (optional)</Label>
            <Textarea id="exchange-message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Happy to meet at the library." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={loading}>
            {loading && <Loader2 size={15} className="animate-spin" />}
            Send exchange request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
