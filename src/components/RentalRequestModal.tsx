"use client";

import { useMemo, useState } from "react";
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
import { formatPrice } from "@/lib/utils";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function RentalRequestModal({
  productId,
  rentDaily,
  rentWeekly,
  deposit,
  trigger,
}: {
  productId: string;
  rentDaily: number;
  rentWeekly?: number | null;
  deposit?: number | null;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const { days, total } = useMemo(() => {
    if (!startDate || !endDate) return { days: 0, total: 0 };
    const d = Math.max(0, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000));
    if (d <= 0) return { days: 0, total: 0 };
    const weeks = Math.floor(d / 7);
    const rem = d % 7;
    const weekly = rentWeekly ?? rentDaily * 7;
    return { days: d, total: weeks * weekly + rem * rentDaily };
  }, [startDate, endDate, rentDaily, rentWeekly]);

  async function submit() {
    if (!endDate || days <= 0) {
      toast.error("Choose a valid date range.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, startDate, endDate }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't send your rental request.");
        return;
      }
      toast.success("Rental request sent to the owner.");
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
          <DialogTitle>Request rental</DialogTitle>
          <DialogDescription>
            {formatPrice(rentDaily)}/day{rentWeekly ? ` · ${formatPrice(rentWeekly)}/week` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="start">Start date</Label>
            <Input id="start" type="date" min={today()} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="end">End date</Label>
            <Input id="end" type="date" min={startDate} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        {days > 0 && (
          <div className="rounded-md bg-surface-muted p-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{days} day{days > 1 ? "s" : ""}</span><span className="font-semibold text-foreground">{formatPrice(total)}</span></div>
            {!!deposit && <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>Security deposit</span><span>{formatPrice(deposit)}</span></div>}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={loading || days <= 0}>
            {loading && <Loader2 size={15} className="animate-spin" />}
            Request rental
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
