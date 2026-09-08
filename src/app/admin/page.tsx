import { Users, Package, CheckCircle2, Repeat, Flag, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SimpleBarChart, Sparkline } from "@/components/admin/SimpleBarChart";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Admin Dashboard" };

function lastNDays(n: number) {
  return Array.from({ length: n }).map((_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (n - 1 - i));
    return d;
  });
}

export default async function AdminDashboardPage() {
  const days = lastNDays(7);

  const [
    totalStudents,
    activeListings,
    completedTransactions,
    activeRentals,
    pendingReports,
    marketplaceValueAgg,
    categories,
    products,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.rental.count({ where: { status: { in: ["APPROVED", "ACTIVE"] } } }),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.product.aggregate({ _sum: { price: true }, where: { status: "ACTIVE" } }),
    prisma.category.findMany({ include: { _count: { select: { products: true } } } }),
    prisma.product.findMany({
      include: { _count: { select: { orders: true, offers: true } } },
      orderBy: { viewCount: "desc" },
      take: 5,
    }),
  ]);

  const [listingsPerDay, ordersPerDay] = await Promise.all([
    Promise.all(days.map((d) => {
      const next = new Date(d); next.setDate(next.getDate() + 1);
      return prisma.product.count({ where: { createdAt: { gte: d, lt: next } } });
    })),
    Promise.all(days.map((d) => {
      const next = new Date(d); next.setDate(next.getDate() + 1);
      return prisma.order.count({ where: { createdAt: { gte: d, lt: next } } });
    })),
  ]);

  const METRICS = [
    { label: "Total Students", value: totalStudents, icon: Users },
    { label: "Active Listings", value: activeListings, icon: Package },
    { label: "Completed Transactions", value: completedTransactions, icon: CheckCircle2 },
    { label: "Active Rentals", value: activeRentals, icon: Repeat },
    { label: "Pending Reports", value: pendingReports, icon: Flag },
    { label: "Marketplace Value", value: formatPrice(marketplaceValueAgg._sum.price ?? 0), icon: Wallet },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Campus Commerce marketplace overview</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {METRICS.map((m) => (
          <div key={m.label} className="rounded-lg border border-border bg-surface p-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-tint text-primary">
              <m.icon size={15} />
            </span>
            <p className="mt-2 text-lg font-bold text-foreground">{m.value}</p>
            <p className="text-xs text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="mb-4 text-sm font-semibold text-foreground">Listings over time (7 days)</p>
          <Sparkline points={listingsPerDay} />
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="mb-4 text-sm font-semibold text-foreground">Transactions over time (7 days)</p>
          <Sparkline points={ordersPerDay} />
        </div>

        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="mb-4 text-sm font-semibold text-foreground">Popular categories</p>
          <SimpleBarChart
            data={categories
              .map((c) => ({ label: c.name, value: c._count.products }))
              .sort((a, b) => b.value - a.value)}
          />
        </div>

        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="mb-4 text-sm font-semibold text-foreground">Most traded products</p>
          <SimpleBarChart
            data={products.map((p) => ({ label: p.title, value: p._count.orders + p._count.offers }))}
          />
        </div>
      </div>
    </div>
  );
}
