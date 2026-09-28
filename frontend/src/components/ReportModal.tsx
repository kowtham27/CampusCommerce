"use client";

import { useState } from "react";
import { Loader2, Flag } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REPORT_REASON_LABELS } from "@/lib/constants";

export function ReportModal({
  productId,
  reportedUserId,
  trigger,
}: {
  productId?: string;
  reportedUserId?: string;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submit() {
    if (!reason) {
      toast.error("Select a reason.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, reportedUserId, reason, details }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      toast.error("Couldn't submit your report. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setTimeout(() => setSubmitted(false), 200);
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <button type="button" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive">
            <Flag size={14} /> Report
          </button>
        )}
      </DialogTrigger>
      <DialogContent>
        {submitted ? (
          <div className="py-4 text-center">
            <p className="mb-1 font-semibold text-foreground">Report submitted</p>
            <p className="text-sm text-muted-foreground">Our team will review this shortly. Thanks for keeping the community safe.</p>
            <Button className="mt-4" onClick={() => setOpen(false)}>Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Report</DialogTitle>
              <DialogDescription>Help us keep Campus Commerce safe and trustworthy.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Reason</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(REPORT_REASON_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="report-details">Details (optional)</Label>
                <Textarea id="report-details" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Tell us what happened..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={submit} disabled={loading}>
                {loading && <Loader2 size={15} className="animate-spin" />}
                Submit report
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
