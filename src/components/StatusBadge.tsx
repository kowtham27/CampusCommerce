import { Badge } from "@/components/ui/badge";

const VARIANT_MAP: Record<string, "default" | "secondary" | "accent" | "outline" | "destructive"> = {
  PENDING: "outline",
  ACCEPTED: "default",
  APPROVED: "default",
  ACTIVE: "default",
  READY_FOR_PICKUP: "accent",
  REQUESTED: "outline",
  COUNTERED: "accent",
  COMPLETED: "default",
  RETURNED: "default",
  REJECTED: "destructive",
  CANCELLED: "destructive",
  WITHDRAWN: "destructive",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={VARIANT_MAP[status] ?? "secondary"}>
      {status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
    </Badge>
  );
}
