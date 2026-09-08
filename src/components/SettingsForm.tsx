"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

type UserSettings = {
  fullName: string;
  email: string;
  phone: string | null;
  department: string | null;
  year: string | null;
  bio: string | null;
  notifyMessages: boolean;
  notifyOffers: boolean;
  notifyOrders: boolean;
  notifyRecs: boolean;
  profileVisible: boolean;
  contactVisible: boolean;
};

function PreferenceRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function SettingsForm({ user }: { user: UserSettings }) {
  const router = useRouter();
  const [account, setAccount] = useState({
    fullName: user.fullName,
    phone: user.phone ?? "",
    department: user.department ?? "",
    year: user.year ?? "",
    bio: user.bio ?? "",
  });
  const [prefs, setPrefs] = useState({
    notifyMessages: user.notifyMessages,
    notifyOffers: user.notifyOffers,
    notifyOrders: user.notifyOrders,
    notifyRecs: user.notifyRecs,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: user.profileVisible,
    contactVisible: user.contactVisible,
  });
  const [passwords, setPasswords] = useState({ current: "", next: "" });
  const [loading, setLoading] = useState<string | null>(null);

  async function saveAccount() {
    setLoading("account");
    try {
      const res = await fetch("/api/settings/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(account),
      });
      if (!res.ok) throw new Error();
      toast.success("Account updated.");
      router.refresh();
    } catch {
      toast.error("Couldn't save changes.");
    } finally {
      setLoading(null);
    }
  }

  async function savePrefs(next: typeof prefs) {
    setPrefs(next);
    fetch("/api/settings/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    }).catch(() => toast.error("Couldn't save preference."));
  }

  async function savePrivacy(next: typeof privacy) {
    setPrivacy(next);
    fetch("/api/settings/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    }).catch(() => toast.error("Couldn't save preference."));
  }

  async function changePassword() {
    if (passwords.next.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    setLoading("password");
    try {
      const res = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.next }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't change password.");
        return;
      }
      toast.success("Password updated.");
      setPasswords({ current: "", next: "" });
    } finally {
      setLoading(null);
    }
  }

  async function logoutAll() {
    setLoading("logout");
    try {
      await fetch("/api/settings/logout-all", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      <TabsContent value="account">
        <div className="max-w-md space-y-4 rounded-lg border border-border bg-surface p-5">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={account.fullName} onChange={(e) => setAccount({ ...account, fullName: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={user.email} disabled />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={account.phone} onChange={(e) => setAccount({ ...account, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Input value={account.department} onChange={(e) => setAccount({ ...account, department: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Year</Label>
              <Input value={account.year} onChange={(e) => setAccount({ ...account, year: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Bio</Label>
            <Textarea value={account.bio} onChange={(e) => setAccount({ ...account, bio: e.target.value })} placeholder="Tell others a bit about yourself" />
          </div>
          <Button onClick={saveAccount} disabled={loading === "account"}>
            {loading === "account" && <Loader2 size={15} className="animate-spin" />}
            Save changes
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="notifications">
        <div className="max-w-md divide-y divide-border rounded-lg border border-border bg-surface px-5">
          <PreferenceRow label="Messages" description="Get notified about new chat messages" checked={prefs.notifyMessages} onCheckedChange={(v) => savePrefs({ ...prefs, notifyMessages: v })} />
          <PreferenceRow label="Offers" description="Get notified about offers on your listings" checked={prefs.notifyOffers} onCheckedChange={(v) => savePrefs({ ...prefs, notifyOffers: v })} />
          <PreferenceRow label="Orders" description="Get notified about order status changes" checked={prefs.notifyOrders} onCheckedChange={(v) => savePrefs({ ...prefs, notifyOrders: v })} />
          <PreferenceRow label="Recommendations" description="Get personalized listing suggestions" checked={prefs.notifyRecs} onCheckedChange={(v) => savePrefs({ ...prefs, notifyRecs: v })} />
        </div>
      </TabsContent>

      <TabsContent value="privacy">
        <div className="max-w-md divide-y divide-border rounded-lg border border-border bg-surface px-5">
          <PreferenceRow label="Profile visibility" description="Let other students view your profile" checked={privacy.profileVisible} onCheckedChange={(v) => savePrivacy({ ...privacy, profileVisible: v })} />
          <PreferenceRow label="Contact visibility" description="Show your phone number to buyers/sellers" checked={privacy.contactVisible} onCheckedChange={(v) => savePrivacy({ ...privacy, contactVisible: v })} />
        </div>
      </TabsContent>

      <TabsContent value="security">
        <div className="max-w-md space-y-5">
          <div className="space-y-4 rounded-lg border border-border bg-surface p-5">
            <p className="text-sm font-semibold text-foreground">Change password</p>
            <div className="space-y-1.5">
              <Label>Current password</Label>
              <Input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>New password</Label>
              <Input type="password" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} />
            </div>
            <Button onClick={changePassword} disabled={loading === "password"}>
              {loading === "password" && <Loader2 size={15} className="animate-spin" />}
              Update password
            </Button>
          </div>

          <Separator />

          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="mb-1 text-sm font-semibold text-foreground">Log out everywhere</p>
            <p className="mb-3 text-xs text-muted-foreground">Sign out of Campus Commerce on all devices, including this one.</p>
            <Button variant="destructive" onClick={logoutAll} disabled={loading === "logout"}>
              {loading === "logout" && <Loader2 size={15} className="animate-spin" />}
              Logout all sessions
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
