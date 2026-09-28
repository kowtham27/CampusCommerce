"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function AdminUserActions({ userId, status, emailVerified }: { userId: string; status: string; emailVerified: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function act(action: "verify" | "suspend" | "restore") {
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error();
      toast.success("User updated.");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {!emailVerified && (
        <Button size="sm" variant="outline" onClick={() => act("verify")} disabled={!!loading}>
          {loading === "verify" && <Loader2 size={12} className="animate-spin" />} Verify
        </Button>
      )}
      {status === "ACTIVE" ? (
        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => act("suspend")} disabled={!!loading}>
          {loading === "suspend" && <Loader2 size={12} className="animate-spin" />} Suspend
        </Button>
      ) : (
        <Button size="sm" variant="outline" onClick={() => act("restore")} disabled={!!loading}>
          {loading === "restore" && <Loader2 size={12} className="animate-spin" />} Restore
        </Button>
      )}
    </div>
  );
}
