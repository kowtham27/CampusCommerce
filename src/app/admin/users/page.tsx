import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminUserActions } from "@/components/admin/AdminUserActions";
import { initials } from "@/lib/utils";

export const metadata = { title: "Admin · Users" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const users = await prisma.user.findMany({
    where: q
      ? { OR: [{ fullName: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Users</h1>
        <p className="text-sm text-muted-foreground">{users.length} students</p>
      </div>

      <form className="max-w-sm">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or email..."
          className="h-10 w-full rounded-md border border-border-strong bg-surface px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </form>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="p-3.5 font-medium">Student</th>
              <th className="p-3.5 font-medium">Department</th>
              <th className="p-3.5 font-medium">Status</th>
              <th className="p-3.5 font-medium">Trust</th>
              <th className="p-3.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="p-3.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.avatarUrl ?? undefined} />
                      <AvatarFallback>{initials(u.fullName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{u.fullName}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3.5 text-muted-foreground">{u.department ?? "—"}</td>
                <td className="p-3.5">
                  <Badge variant={u.status === "ACTIVE" ? "default" : "destructive"}>{u.status}</Badge>
                  {!u.emailVerified && <Badge variant="outline" className="ml-1.5">Unverified</Badge>}
                </td>
                <td className="p-3.5 text-muted-foreground">{u.trustScore}/100</td>
                <td className="p-3.5">
                  <AdminUserActions userId={u.id} status={u.status} emailVerified={u.emailVerified} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
