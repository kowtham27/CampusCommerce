"use client";

import { useEffect, useRef, useState } from "react";
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
  const urlMinPrice = searchParams.get("minPrice") ?? "";
  const urlMaxPrice = searchParams.get("maxPrice") ?? "";

  // The price inputs are uncontrolled (defaultValue, not value) so typing
  // never round-trips through React/URL state — that was the original bug:
  // a router.push on every keystroke raced with itself and could drop or
  // scramble digits. Typing now only updates a ref; the URL (and the actual
  // filtering) syncs after a short pause, or immediately on blur/Enter.
  // Keying each input on its URL value makes React remount it with a fresh
  // defaultValue whenever that value changes from outside typing (Clear
  // filters, browser back/forward) without needing a state-syncing effect.
  //
  // Min and max debounce independently, and with a slow connection a
  // navigation can take a few seconds to actually commit. If both fields are
  // edited within that window, whichever push resolves last would otherwise
  // overwrite the other's value because it read a URL that hadn't caught up
  // yet. `latestPrices` sidesteps that: every push always includes BOTH the
  // latest min and max from this ref, regardless of which field triggered it
  // or which push wins the race.
  const latestPrices = useRef({ minPrice: urlMinPrice, maxPrice: urlMaxPrice });
  const minDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Keep the ref in sync with the URL, but don't clobber a value the user
    // just typed while its own debounced push is still pending.
    if (!minDebounceRef.current) latestPrices.current.minPrice = urlMinPrice;
    if (!maxDebounceRef.current) latestPrices.current.maxPrice = urlMaxPrice;
  }, [urlMinPrice, urlMaxPrice]);

  useEffect(() => {
    return () => {
      if (minDebounceRef.current) clearTimeout(minDebounceRef.current);
      if (maxDebounceRef.current) clearTimeout(maxDebounceRef.current);
    };
  }, []);

  function pushPriceParams() {
    const params = new URLSearchParams(window.location.search);
    const { minPrice: m, maxPrice: x } = latestPrices.current;
    if (m) params.set("minPrice", m);
    else params.delete("minPrice");
    if (x) params.set("maxPrice", x);
    else params.delete("maxPrice");
    router.push(`${pathname}?${params.toString()}`);
  }

  function onPriceInputChange(key: "minPrice" | "maxPrice", value: string) {
    latestPrices.current = { ...latestPrices.current, [key]: value };
    if (key === "minPrice") {
      if (minDebounceRef.current) clearTimeout(minDebounceRef.current);
      minDebounceRef.current = setTimeout(pushPriceParams, 500);
    } else {
      if (maxDebounceRef.current) clearTimeout(maxDebounceRef.current);
      maxDebounceRef.current = setTimeout(pushPriceParams, 500);
    }
  }

  function flushPriceParam(key: "minPrice" | "maxPrice") {
    if (key === "minPrice" && minDebounceRef.current) clearTimeout(minDebounceRef.current);
    if (key === "maxPrice" && maxDebounceRef.current) clearTimeout(maxDebounceRef.current);
    pushPriceParams();
  }

  const activeCount = [type !== "all", category !== "all", condition !== "all", department !== "all", hostel !== "all", !!urlMinPrice, !!urlMaxPrice].filter(Boolean).length;

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
            key={`min-${urlMinPrice}`}
            type="number"
            placeholder="Min"
            defaultValue={urlMinPrice}
            onChange={(e) => onPriceInputChange("minPrice", e.target.value)}
            onBlur={() => flushPriceParam("minPrice")}
            onKeyDown={(e) => e.key === "Enter" && flushPriceParam("minPrice")}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            key={`max-${urlMaxPrice}`}
            type="number"
            placeholder="Max"
            defaultValue={urlMaxPrice}
            onChange={(e) => onPriceInputChange("maxPrice", e.target.value)}
            onBlur={() => flushPriceParam("maxPrice")}
            onKeyDown={(e) => e.key === "Enter" && flushPriceParam("maxPrice")}
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
