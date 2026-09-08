"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/components/AuthCard";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, CAMPUS_LOCATIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const DEPARTMENTS = ["CSE", "ECE", "Mechanical", "Civil", "IT", "EEE"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export default function OnboardingPage() {
  const router = useRouter();
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [hostelBlock, setHostelBlock] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function toggleInterest(name: string) {
    setInterests((prev) => (prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!department || !year || !hostelBlock || interests.length === 0) {
      toast.error("Please fill in all fields and pick at least one interest.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department, year, hostelBlock, interests }),
      });
      if (!res.ok) throw new Error();
      toast.success("You're all set!");
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Tell us about you"
      description="This helps us personalize your marketplace."
    >
      <div className="mb-5 flex justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-tint text-primary">
          <GraduationCap size={20} />
        </span>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Year</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Hostel / Block</Label>
          <Select value={hostelBlock} onValueChange={setHostelBlock}>
            <SelectTrigger><SelectValue placeholder="Select your hostel or block" /></SelectTrigger>
            <SelectContent>
              {CAMPUS_LOCATIONS.map((l) => <SelectItem key={l.name} value={l.name}>{l.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Favorite categories</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.slug}
                onClick={() => toggleInterest(c.name)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  interests.includes(c.name)
                    ? "border-primary bg-primary-tint text-primary"
                    : "border-border-strong text-muted-foreground hover:bg-surface-muted"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 size={15} className="animate-spin" />}
          Personalize my marketplace
        </Button>
      </form>
    </AuthCard>
  );
}
