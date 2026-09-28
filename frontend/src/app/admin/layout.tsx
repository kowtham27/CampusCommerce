import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Users, Package, Flag, ArrowLeft } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { Logo } from "@/components/Logo";
import { AdminMobileMenu } from "@/components/admin/AdminMobileMenu";
import { getCurrentUser } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: Package },
  { href: "/admin/reports", label: "Reports", icon: Flag },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="hidden w-56 shrink-0 border-r border-border bg-surface md:block">
        <div className="p-5">
          <Link href="/admin">
            <Logo size="sm" />
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">Admin</p>
        </div>
        <nav className="space-y-0.5 px-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            >
              <item.icon size={16} /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 px-3">
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft size={13} /> Back to marketplace
          </Link>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-border bg-surface px-5 py-3 md:hidden">
          <Link href="/admin">
            <Logo size="sm" />
          </Link>
          <AdminMobileMenu />
        </header>
        <main className="p-5 sm:p-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
