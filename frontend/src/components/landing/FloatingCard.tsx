"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  Laptop,
  Home,
  Shirt,
  Gamepad2,
  Dumbbell,
  GraduationCap,
  Watch,
  Package,
  Calculator,
  Headphones,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  BookOpen,
  Laptop,
  Home,
  Shirt,
  Gamepad2,
  Dumbbell,
  GraduationCap,
  Watch,
  Package,
  Calculator,
  Headphones,
  Camera,
} as const;

type IconName = keyof typeof ICONS;

export function FloatingCard({
  icon,
  title,
  price,
  distance,
  className,
  delay = 0,
}: {
  icon: IconName;
  title: string;
  price: string;
  distance: string;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  const Icon = ICONS[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{
        opacity: 1,
        y: reduceMotion ? 0 : [0, -8, 0],
      }}
      transition={
        reduceMotion
          ? { duration: 0.4, delay }
          : {
              opacity: { duration: 0.4, delay },
              y: {
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
              },
            }
      }
      className={cn(
        "absolute w-44 rounded-lg border border-border bg-surface p-3 shadow-lg",
        className
      )}
    >
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary-tint text-primary">
        <Icon size={15} />
      </div>

      <p className="line-clamp-1 text-xs font-semibold text-foreground">
        {title}
      </p>

      <p className="text-sm font-bold text-foreground">{price}</p>

      <p className="mt-1 text-[11px] text-muted-foreground">
        📍 {distance}
      </p>
    </motion.div>
  );
}