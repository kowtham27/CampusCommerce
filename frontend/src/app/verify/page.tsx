"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/components/AuthCard";
import { Button } from "@/components/ui/button";

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const devOtp = params.get("devOtp") ?? "";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (devOtp) {
      toast.info(`Demo mode: your verification code is ${devOtp}`, { duration: 8000 });
    }
  }, [devOtp]);

  function updateDigit(i: number, value: string) {
    const v = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 5) inputsRef.current[i + 1]?.focus();
  }

  async function submit(code: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid code.");
        return;
      }
      toast.success("Email verified! Welcome to Campus Commerce.");
      router.push(data.onboarded ? "/dashboard" : "/onboarding");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.devOtp) toast.info(`Demo mode: your new code is ${data.devOtp}`, { duration: 8000 });
      else toast.success("A new code has been sent.");
    } finally {
      setResending(false);
    }
  }

  const code = digits.join("");

  return (
    <AuthCard
      title="Verify your email"
      description={email ? `Enter the 6-digit code sent to ${email}` : "Enter the 6-digit code sent to your email"}
    >
      <div className="mb-5 flex justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-tint text-primary">
          <MailCheck size={20} />
        </span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code.length === 6) submit(code);
        }}
        className="space-y-5"
      >
        <div className="flex justify-center gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputsRef.current[i] = el; }}
              value={d}
              onChange={(e) => updateDigit(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !d && i > 0) inputsRef.current[i - 1]?.focus();
              }}
              inputMode="numeric"
              maxLength={1}
              className="h-12 w-10 rounded-md border border-border-strong bg-surface text-center text-lg font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          ))}
        </div>

        {error && <p className="text-center text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
          {loading && <Loader2 size={15} className="animate-spin" />}
          Verify email
        </Button>

        <button
          type="button"
          onClick={resend}
          disabled={resending}
          className="w-full text-center text-sm font-medium text-primary hover:underline disabled:opacity-60"
        >
          {resending ? "Sending..." : "Resend code"}
        </button>
      </form>
    </AuthCard>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
