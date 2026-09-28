import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistance } from "@/lib/utils";

export function LocationBadge({
  meters,
  label,
  className,
}: {
  meters?: number;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs text-muted-foreground",
        className
      )}
    >
      <MapPin size={12} />
      {label ? `${label}${meters != null ? ` · ${formatDistance(meters)}` : ""}` : meters != null ? formatDistance(meters) : ""}
    </span>
  );
}
