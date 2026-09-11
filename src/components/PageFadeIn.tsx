"use client";

import { motion, useReducedMotion } from "framer-motion";

export function PageFadeIn({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.25,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}