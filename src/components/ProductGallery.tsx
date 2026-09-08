"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const shown = images.length > 0 ? images : ["/placeholder-product.svg"];

  return (
    <div className="space-y-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-surface-muted">
        <Image src={shown[active]} alt={title} fill sizes="(max-width: 768px) 100vw, 480px" className="object-cover" priority />
      </div>
      {shown.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {shown.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2",
                active === i ? "border-primary" : "border-transparent"
              )}
            >
              <Image src={img} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
