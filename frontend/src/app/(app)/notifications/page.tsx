import { getCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api";
import type { Notification } from "@/types";
import { NotificationsList } from "@/components/NotificationsList";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const notifications = await api<Notification[]>("/notifications");

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 md:py-8">
      <h1 className="mb-5 text-xl font-bold text-foreground sm:text-2xl">Notifications</h1>
      <NotificationsList
        initial={notifications.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          body: n.body,
          read: n.read,
          createdAt: n.createdAt,
          link: n.link,
        }))}
      />
    </div>
  );
}
