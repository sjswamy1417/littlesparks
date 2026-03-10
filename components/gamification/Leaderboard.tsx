"use client";

import { motion } from "framer-motion";
import { Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/shared/Avatar";

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatarId: number;
  stars: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  className?: string;
}

const podiumStyles: Record<number, { color: string; bg: string; icon: string }> = {
  1: {
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/30",
    icon: "\uD83E\uDD47",
  },
  2: {
    color: "text-gray-300",
    bg: "bg-gray-300/10 border-gray-300/30",
    icon: "\uD83E\uDD48",
  },
  3: {
    color: "text-amber-600",
    bg: "bg-amber-600/10 border-amber-600/30",
    icon: "\uD83E\uDD49",
  },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

export function Leaderboard({ entries, className }: LeaderboardProps) {
  return (
    <motion.div
      className={cn("w-full", className)}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={20} className="text-primary" />
        <h3 className="font-display text-lg font-bold text-text">
          Leaderboard
        </h3>
      </div>

      {/* List */}
      <div className="space-y-2">
        {entries.map((entry) => {
          const isTop3 = entry.rank <= 3;
          const podium = podiumStyles[entry.rank];

          return (
            <motion.div
              key={entry.rank}
              variants={item}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors duration-200",
                isTop3 && podium
                  ? podium.bg
                  : "border-border bg-surface hover:bg-surface/80"
              )}
            >
              {/* Rank */}
              <div className="w-8 shrink-0 text-center">
                {isTop3 && podium ? (
                  <span className="text-lg">{podium.icon}</span>
                ) : (
                  <span className="text-sm font-mono font-bold text-text-muted">
                    {entry.rank}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <Avatar avatarId={entry.avatarId} size="sm" />

              {/* Name */}
              <span
                className={cn(
                  "flex-1 text-sm font-body font-medium truncate",
                  isTop3 && podium ? podium.color : "text-text"
                )}
              >
                {entry.name}
              </span>

              {/* Stars */}
              <div className="flex items-center gap-1 shrink-0">
                <Star
                  size={14}
                  className="text-primary fill-primary"
                />
                <span className="text-sm font-mono font-bold text-text tabular-nums">
                  {entry.stars.toLocaleString()}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
