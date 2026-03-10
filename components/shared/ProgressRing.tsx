"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 6,
  className,
  showPercentage = true,
}: ProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedProgress / 100) * circumference;

  // Animate the fill on mount and when progress changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedProgress(Math.min(Math.max(progress, 0), 100));
    }, 100);
    return () => clearTimeout(timeout);
  }, [progress]);

  // Calculate color based on progress (orange to green)
  function getColor(p: number): string {
    if (p < 30) return "#FF6B35"; // orange
    if (p < 60) return "#FFB935"; // golden
    if (p < 90) return "#7BCC35"; // light green
    return "#C8F135"; // neon green
  }

  const color = getColor(animatedProgress);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2A2A3E"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {showPercentage && (
        <span
          className="absolute font-mono text-text font-bold"
          style={{ fontSize: size * 0.22 }}
        >
          {Math.round(animatedProgress)}%
        </span>
      )}
    </div>
  );
}
