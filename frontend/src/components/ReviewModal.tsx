"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { StarRatingInput } from "@/components/StarRatingInput";

export function ReviewModal({
  subjectId,
  subjectName,
  transactionId,
  trigger,
}: {
  subjectId: string;
  subjectName: string;
  transactionId?: string;
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [overall, setOverall] = useState(0);
  const [condition, setCondition] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [transaction, setTransaction] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!overall || !condition || !communication || !transaction) {
      toast.error("Please rate all categories.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          transactionId,
          overallRating: overall,
          conditionRating: condition,
          communicationRating: communication,
          transactionRating: transaction,
          comment: comment || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Review submitted. Thanks for the feedback!");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Couldn't submit your review.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button size="sm" variant="outline"><Star size={13} /> Leave a review</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How was your experience?</DialogTitle>
          <DialogDescription>Rate your transaction with {subjectName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col items-center gap-2 rounded-md bg-surface-muted py-4">
            <StarRatingInput value={overall} onChange={setOverall} size={30} />
            <span className="text-xs text-muted-foreground">Overall rating</span>
          </div>
          <div className="flex items-center justify-between">
            <Label>Product condition</Label>
            <StarRatingInput value={condition} onChange={setCondition} size={18} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Communication</Label>
            <StarRatingInput value={communication} onChange={setCommunication} size={18} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Transaction</Label>
            <StarRatingInput value={transaction} onChange={setTransaction} size={18} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share more about your experience..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Skip</Button>
          <Button onClick={submit} disabled={loading}>
            {loading && <Loader2 size={15} className="animate-spin" />}
            Submit review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
