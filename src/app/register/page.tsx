"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/components/AuthCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ALLOWED_EMAIL_DOMAIN } from "@/lib/constants";

const DEPARTMENTS = ["CSE", "ECE", "Mechanical", "Civil", "IT", "EEE"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    emailLocal: "",
    password: "",
    department: "",
    year: "",
    phone: "",
  });
  const [error, setError] = useState<string | null>(null);

  function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.department || !form.year) {
      setError("Select your department and year.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: `${form.emailLocal}@${ALLOWED_EMAIL_DOMAIN}`,
          password: form.password,
          department: form.department,
          year: form.year,
          phone: form.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      toast.success("Account created — verify your email to continue.");
      router.push(`/verify?email=${encodeURIComponent(data.email)}&devOtp=${data.devOtp ?? ""}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create your account"
      description="Only verified students with a college email can join."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14">
            <AvatarImage src={avatarPreview ?? undefined} />
            <AvatarFallback><ImagePlus size={18} /></AvatarFallback>
          </Avatar>
          <div>
            <Label htmlFor="avatar" className="cursor-pointer text-xs font-medium text-primary">
              Add a profile photo (optional)
            </Label>
            <input id="avatar" type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
            <p className="text-[11px] text-muted-foreground">
              Preview only — enable Supabase Storage to save photos (see instruction.md).
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="Alex Kumar"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">College email</Label>
          <div className="flex overflow-hidden rounded-md border border-border-strong focus-within:ring-2 focus-within:ring-ring">
            <Input
              id="email"
              required
              value={form.emailLocal}
              onChange={(e) => setForm({ ...form, emailLocal: e.target.value.replace(/[^a-zA-Z0-9._-]/g, "") })}
              placeholder="alex.kumar"
              className="rounded-none border-0 focus-visible:ring-0"
            />
            <span className="flex items-center bg-surface-muted px-3 text-sm text-muted-foreground">
              @{ALLOWED_EMAIL_DOMAIN}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 8 characters"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Year</Label>
            <Select value={form.year} onValueChange={(v) => setForm({ ...form, year: v })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone number (optional)</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
            placeholder="9876543210"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 size={15} className="animate-spin" />}
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}
