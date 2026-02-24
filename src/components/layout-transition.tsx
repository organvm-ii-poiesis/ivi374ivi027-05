"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { type ReactNode, useRef } from "react";

export function LayoutTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  // Skip initial animation to avoid blank flash on page load
  if (isFirstRender.current) {
    isFirstRender.current = false;
    return (
      <AnimatePresence mode="wait">
        <motion.div key={pathname}>{children}</motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
