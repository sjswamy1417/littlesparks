"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  streak: number;
  className?: string;
}

export function StreakBadge({ streak, className }: StreakBadgeProps) {
  const isActive = streak > 0;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-mono font-bold",
        isActive
          ? "bg-primary/10 text-primary"
          : "bg-surface text-text-muted",
        className
      )}
    >
      <motion.div
        animate={
          isActive
            ? {
                scale: [1, 1.2, 1],
                rotate: [0, -5, 5, 0],
              }
            : {}
        }
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Flame
          size={18}
          className={cn(
            isActive ? "text-primary fill-primary/50" : "text-text-muted"
          )}
        />
      </motion.div>
      <span className="tabular-nums">{streak}</span>
      <span className="text-xs font-body font-normal">
        {streak === 1 ? "day" : "days"}
      </span>
    </div>
  );
}
