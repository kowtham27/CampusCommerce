"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex min-h-dvh flex-col bg-surface-muted/40">
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <motion.div
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <Link href="/" className="mb-8 block text-center text-lg font-extrabold tracking-tight text-foreground">
            Campus<span className="text-primary">Commerce</span>
          </Link>
          <div className="rounded-xl border border-border bg-surface p-7 shadow-sm">
            <div className="mb-6 space-y-1 text-center">
              <h1 className="text-xl font-bold text-foreground">{title}</h1>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            {children}
          </div>
          {footer && <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>}
        </motion.div>
      </div>
    </div>
  );
}
