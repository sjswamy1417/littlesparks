"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { Star } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface StarCounterProps {
  count: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeConfig = {
  sm: { icon: 14, text: "text-xs", gap: "gap-1" },
  md: { icon: 18, text: "text-sm", gap: "gap-1.5" },
  lg: { icon: 24, text: "text-lg", gap: "gap-2" },
};

export function StarCounter({ count, size = "md", className }: StarCounterProps) {
  const config = sizeConfig[size];

  const springValue = useSpring(0, {
    stiffness: 100,
    damping: 20,
    mass: 0.5,
  });

  const displayCount = useTransform(springValue, (v) => Math.round(v));

  useEffect(() => {
    springValue.set(count);
  }, [count, springValue]);

  return (
    <motion.div
      className={cn(
        "inline-flex items-center font-mono font-bold text-text",
        config.gap,
        className
      )}
      key={count}
    >
      <motion.div
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Star
          size={config.icon}
          className="text-primary fill-primary"
        />
      </motion.div>
      <motion.span
        className={cn(config.text, "tabular-nums")}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {count.toLocaleString()}
      </motion.span>
    </motion.div>
  );
}
