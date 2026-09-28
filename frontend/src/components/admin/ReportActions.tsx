"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function act(action: "dismiss" | "warn_user" | "remove_listing" | "suspend_user") {
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error();
      toast.success("Report updated.");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="ghost" onClick={() => act("dismiss")} disabled={!!loading}>
        {loading === "dismiss" && <Loader2 size={12} className="animate-spin" />} Dismiss
      </Button>
      <Button size="sm" variant="outline" onClick={() => act("warn_user")} disabled={!!loading}>
        {loading === "warn_user" && <Loader2 size={12} className="animate-spin" />} Warn User
      </Button>
      <Button size="sm" variant="outline" onClick={() => act("remove_listing")} disabled={!!loading}>
        {loading === "remove_listing" && <Loader2 size={12} className="animate-spin" />} Remove Listing
      </Button>
      <Button size="sm" variant="destructive" onClick={() => act("suspend_user")} disabled={!!loading}>
        {loading === "suspend_user" && <Loader2 size={12} className="animate-spin" />} Suspend User
      </Button>
    </div>
  );
}
