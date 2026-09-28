import Link from "next/link";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

export function CategoryCard({
  name,
  slug,
  icon,
  className,
}: {
  name: string;
  slug: string;
  icon: string;
  className?: string;
}) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[icon] ?? Icons.Package;

  return (
    <Link
      href={`/explore?category=${slug}`}
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border border-border bg-surface p-4 text-center transition-colors hover:border-primary/40 hover:bg-primary-tint",
        className
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-tint text-primary">
        <Icon size={18} />
      </span>
      <span className="text-sm font-medium text-foreground">{name}</span>
    </Link>
  );
}
