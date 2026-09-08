import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { ReportActions } from "@/components/admin/ReportActions";
import { REPORT_REASON_LABELS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";
import { Flag } from "lucide-react";

export const metadata = { title: "Admin · Reports" };

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    include: { product: true, reportedUser: true, reportedBy: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Reports</h1>
        <p className="text-sm text-muted-foreground">{reports.filter((r) => r.status === "PENDING").length} pending review</p>
      </div>

      {reports.length === 0 ? (
        <EmptyState icon={Flag} title="No reports" description="Reported listings and users will show up here." />
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Report #{r.id.slice(-6).toUpperCase()}</p>
                <Badge variant={r.status === "PENDING" ? "outline" : r.status === "DISMISSED" ? "secondary" : "default"}>
                  {r.status}
                </Badge>
              </div>
              <div className="grid gap-1 text-sm sm:grid-cols-2">
                {r.product && <p><span className="text-muted-foreground">Product:</span> <span className="font-medium text-foreground">{r.product.title}</span></p>}
                {r.reportedUser && <p><span className="text-muted-foreground">Reported user:</span> <span className="font-medium text-foreground">{r.reportedUser.fullName}</span></p>}
                <p><span className="text-muted-foreground">Reported by:</span> <span className="font-medium text-foreground">{r.reportedBy.fullName}</span></p>
                <p><span className="text-muted-foreground">Reason:</span> <span className="font-medium text-foreground">{REPORT_REASON_LABELS[r.reason]}</span></p>
              </div>
              {r.details && <p className="mt-2 text-sm text-muted-foreground">&ldquo;{r.details}&rdquo;</p>}
              <p className="mt-1 text-[11px] text-muted-foreground">{formatRelativeTime(r.createdAt)}</p>

              {r.status === "PENDING" ? (
                <div className="mt-3 border-t border-border pt-3">
                  <ReportActions reportId={r.id} />
                </div>
              ) : r.action ? (
                <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                  Action taken: <span className="font-medium text-foreground">{r.action.replace(/_/g, " ").toLowerCase()}</span>
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
