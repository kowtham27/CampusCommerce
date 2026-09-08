import { getCurrentUser } from "@/lib/auth";
import { SettingsForm } from "@/components/SettingsForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 md:py-8">
      <h1 className="mb-5 text-xl font-bold text-foreground sm:text-2xl">Settings</h1>
      <SettingsForm
        user={{
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          department: user.department,
          year: user.year,
          bio: user.bio,
          notifyMessages: user.notifyMessages,
          notifyOffers: user.notifyOffers,
          notifyOrders: user.notifyOrders,
          notifyRecs: user.notifyRecs,
          profileVisible: user.profileVisible,
          contactVisible: user.contactVisible,
        }}
      />
    </div>
  );
}
