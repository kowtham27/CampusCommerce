import { Store } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { badge: "h-6 w-6 rounded-md", icon: 13, text: "text-sm" },
  md: { badge: "h-7 w-7 rounded-lg", icon: 15, text: "text-lg" },
  lg: { badge: "h-8 w-8 rounded-lg", icon: 17, text: "text-xl" },
} as const;

export function Logo({
  size = "md",
  className,
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center bg-primary text-primary-foreground",
          s.badge
        )}
      >
        <Store size={s.icon} strokeWidth={2.25} />
      </span>
      <span className={cn("font-extrabold tracking-tight text-foreground", s.text)}>
        Campus<span className="text-primary">Commerce</span>
      </span>
    </span>
  );
}
