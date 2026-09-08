"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTIONS: Record<string, string[]> = {
  math: ["Engineering Mathematics", "Mathematics Books", "Calculators", "Engineering Drawing"],
  book: ["Engineering Mathematics", "DSA Book", "Database Management Systems", "Organic Chemistry"],
  laptop: ["MacBook Air M2", "Laptop Stand", "USB-C Hub", "Portable SSD"],
  calc: ["Casio FX-991ES Plus", "Scientific Calculator", "Engineering Mathematics"],
  camera: ["Canon EOS 1500D DSLR", "DSLR rental", "Photography accessories"],
  game: ["PS4 Controller", "Nintendo Switch Lite", "Gaming Headset", "Catan Board Game"],
};

export function SearchBar({ className, placeholder = "Search products..." }: { className?: string; placeholder?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const lowerValue = value.trim().toLowerCase();
  const suggestions = lowerValue.length >= 2
    ? Object.entries(SUGGESTIONS).find(([k]) => k.startsWith(lowerValue) || lowerValue.startsWith(k))?.[1]
    : undefined;

  function submit(q: string) {
    setFocused(false);
    router.push(`/explore?q=${encodeURIComponent(q)}`);
  }

  return (
    <form
      ref={containerRef}
      className={cn("relative w-full", className)}
      onSubmit={(e) => {
        e.preventDefault();
        submit(value);
      }}
    >
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-border-strong bg-surface pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setValue("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X size={15} />
        </button>
      )}

      {focused && suggestions && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1.5 overflow-hidden rounded-md border border-border bg-surface shadow-md">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => submit(s)}
              className="block w-full px-3.5 py-2 text-left text-sm text-foreground hover:bg-surface-muted"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
