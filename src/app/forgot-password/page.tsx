"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/components/AuthCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.devOtp) toast.info(`Demo mode: your reset code is ${data.devOtp}`, { duration: 8000 });
      else toast.success("If that account exists, a reset code has been sent.");
      setStep("reset");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      toast.success("Password updated. You can log in now.");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  if (step === "request") {
    return (
      <AuthCard
        title="Reset your password"
        description="Enter your college email and we'll send a reset code."
        footer={<Link href="/login" className="font-medium text-primary hover:underline">Back to login</Link>}
      >
        <form onSubmit={requestCode} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">College email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 size={15} className="animate-spin" />}
            Send reset code
          </Button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Enter reset code"
      description={`Enter the code sent to ${email} and choose a new password.`}
      footer={<Link href="/login" className="font-medium text-primary hover:underline">Back to login</Link>}
    >
      <form onSubmit={resetPassword} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="code">6-digit code</Label>
          <Input id="code" required maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="123456" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="newPassword">New password</Label>
          <Input id="newPassword" type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 size={15} className="animate-spin" />}
          Update password
        </Button>
      </form>
    </AuthCard>
  );
}
