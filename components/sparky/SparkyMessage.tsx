"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparky } from "./Sparky";

type SparkMood = "excited" | "proud" | "thinking" | "celebrating" | "idle";

interface SparkyMessageProps {
  message: string;
  mood?: SparkMood;
  className?: string;
  sparkySize?: number;
}

export function SparkyMessage({
  message,
  mood = "idle",
  className,
  sparkySize = 64,
}: SparkyMessageProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Sparky mood={mood} size={sparkySize} className="shrink-0" />
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: -10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
          mass: 0.8,
        }}
        className="relative"
      >
        {/* Bubble tail pointing left toward Sparky */}
        <div className="absolute left-0 top-4 -translate-x-2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-surface" />

        {/* Speech bubble */}
        <div className="rounded-xl bg-surface border border-border px-4 py-3 ml-1">
          <p className="text-sm text-text font-body leading-relaxed">
            {message}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
