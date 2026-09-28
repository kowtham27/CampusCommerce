import Link from "next/link";

export function SectionHeader({
  title,
  viewAllHref,
}: {
  title: string;
  viewAllHref?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-bold text-foreground sm:text-lg">{title}</h2>
      {viewAllHref && (
        <Link href={viewAllHref} className="text-sm font-medium text-primary hover:underline">
          View all
        </Link>
      )}
    </div>
  );
}
