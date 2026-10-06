import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ type: "spring", stiffness: 85, damping: 20, delay }}
    >
      {children}
    </motion.div>
  );
}
