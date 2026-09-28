import { Users, Package, CheckCircle2, Repeat, Flag, Wallet } from "lucide-react";
import { api } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import type { Product } from "@/types";
import { SimpleBarChart, Sparkline } from "@/components/admin/SimpleBarChart";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Admin Dashboard" };

interface AdminStats {
  totalStudents: number;
  activeListings: number;
  completedTransactions: number;
  activeRentals: number;
  pendingReports: number;
  marketplaceValue: number;
  categories: { id: string; name: string; productCount: number }[];
  topProducts: (Product & { orderCount: number; offerCount: number })[];
  days: string[];
  listingsPerDay: number[];
  ordersPerDay: number[];
}

export default async function AdminDashboardPage() {
  await requireAdmin();
  const {
    totalStudents,
    activeListings,
    completedTransactions,
    activeRentals,
    pendingReports,
    marketplaceValue,
    categories,
    topProducts: products,
    listingsPerDay,
    ordersPerDay,
  } = await api<AdminStats>("/admin/stats");

  const METRICS = [
    { label: "Total Students", value: totalStudents, icon: Users },
    { label: "Active Listings", value: activeListings, icon: Package },
    { label: "Completed Transactions", value: completedTransactions, icon: CheckCircle2 },
    { label: "Active Rentals", value: activeRentals, icon: Repeat },
    { label: "Pending Reports", value: pendingReports, icon: Flag },
    { label: "Marketplace Value", value: formatPrice(marketplaceValue), icon: Wallet },
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
              .map((c) => ({ label: c.name, value: c.productCount }))
              .sort((a, b) => b.value - a.value)}
          />
        </div>

        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="mb-4 text-sm font-semibold text-foreground">Most traded products</p>
          <SimpleBarChart
            data={products.map((p) => ({ label: p.title, value: p.orderCount + p.offerCount }))}
          />
        </div>
      </div>
    </div>
  );
}
