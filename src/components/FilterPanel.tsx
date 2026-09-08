"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORIES, CAMPUS_LOCATIONS, CONDITION_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const DEPARTMENTS = ["CSE", "ECE", "Mechanical", "Civil", "IT", "EEE"];

export function FilterPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  function set(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  const type = searchParams.get("type") ?? "all";
  const category = searchParams.get("category") ?? "all";
  const condition = searchParams.get("condition") ?? "all";
  const department = searchParams.get("department") ?? "all";
  const hostel = searchParams.get("hostel") ?? "all";
  const sort = searchParams.get("sort") ?? "recommended";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  const activeCount = [type !== "all", category !== "all", condition !== "all", department !== "all", hostel !== "all", !!minPrice, !!maxPrice].filter(Boolean).length;

  const body = (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>Transaction type</Label>
        <Tabs value={type} onValueChange={(v) => set("type", v)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="sell">Buy</TabsTrigger>
            <TabsTrigger value="rent">Rent</TabsTrigger>
            <TabsTrigger value="exchange">Swap</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select value={category} onValueChange={(v) => set("category", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Price range (₹)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => set("minPrice", e.target.value || null)}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => set("maxPrice", e.target.value || null)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Condition</Label>
        <Select value={condition} onValueChange={(v) => set("condition", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any condition</SelectItem>
            {Object.entries(CONDITION_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Department</Label>
        <Select value={department} onValueChange={(v) => set("department", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any department</SelectItem>
            {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Hostel / Location</Label>
        <Select value={hostel} onValueChange={(v) => set("hostel", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any location</SelectItem>
            {CAMPUS_LOCATIONS.map((l) => <SelectItem key={l.name} value={l.name}>{l.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Sort by</Label>
        <Select value={sort} onValueChange={(v) => set("sort", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="recommended">Recommended</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
            <SelectItem value="nearest">Nearest</SelectItem>
            <SelectItem value="popular">Most popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" className="w-full" onClick={() => router.push(pathname)}>
          <X size={14} /> Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      <div className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-20 rounded-lg border border-border bg-surface p-4">
          <p className="mb-4 text-sm font-semibold text-foreground">Filters</p>
          {body}
        </div>
      </div>

      <div className="mb-4 lg:hidden">
        <Button variant="outline" size="sm" onClick={() => setMobileOpen((v) => !v)}>
          <SlidersHorizontal size={14} />
          Filters {activeCount > 0 && `(${activeCount})`}
        </Button>
        {mobileOpen && (
          <div className={cn("mt-3 rounded-lg border border-border bg-surface p-4")}>
            {body}
          </div>
        )}
      </div>
    </>
  );
}
