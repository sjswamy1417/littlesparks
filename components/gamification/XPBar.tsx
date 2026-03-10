"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface XPBarProps {
  xp: number;
  level: number;
  className?: string;
}

export function XPBar({ xp, level, className }: XPBarProps) {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  const xpForNextLevel = level * 100;
  const xpInCurrentLevel = xp % xpForNextLevel;
  const progressPercent = (xpInCurrentLevel / xpForNextLevel) * 100;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedWidth(progressPercent);
    }, 100);
    return () => clearTimeout(timeout);
  }, [progressPercent]);

  return (
    <div className={cn("w-full", className)}>
      {/* Level and XP labels */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-display font-bold text-text">
          Level {level}
        </span>
        <span className="text-xs font-mono text-text-muted tabular-nums">
          {xpInCurrentLevel} / {xpForNextLevel} XP
        </span>
      </div>

      {/* Progress bar track */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-surface border border-border">
        {/* Animated fill */}
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${animatedWidth}%`,
            background:
              "linear-gradient(90deg, #FF6B35 0%, #7B2FBE 50%, #C8F135 100%)",
          }}
        />

        {/* Shimmer effect */}
        <div
          className="absolute inset-0 rounded-full opacity-20"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
            animation: "shimmer 2s infinite",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
