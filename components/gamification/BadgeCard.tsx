"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
}

interface BadgeCardProps {
  badge: BadgeData;
  earned?: boolean;
  earnedAt?: string;
  className?: string;
}

const rarityConfig: Record<
  BadgeRarity,
  { glow: string; border: string; label: string; textColor: string }
> = {
  COMMON: {
    glow: "shadow-[0_0_15px_rgba(255,255,255,0.15)]",
    border: "border-white/20",
    label: "Common",
    textColor: "text-white/70",
  },
  RARE: {
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
    border: "border-blue-400/40",
    label: "Rare",
    textColor: "text-blue-400",
  },
  EPIC: {
    glow: "shadow-[0_0_20px_rgba(123,47,190,0.4)]",
    border: "border-secondary/40",
    label: "Epic",
    textColor: "text-secondary",
  },
  LEGENDARY: {
    glow: "shadow-[0_0_25px_rgba(255,107,53,0.4)]",
    border: "border-primary/50",
    label: "Legendary",
    textColor: "text-primary",
  },
};

export function BadgeCard({
  badge,
  earned = false,
  earnedAt,
  className,
}: BadgeCardProps) {
  const rarity = rarityConfig[badge.rarity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={earned ? { y: -4, scale: 1.02 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "relative flex flex-col items-center gap-3 rounded-lg border bg-surface p-5 text-center transition-shadow duration-300",
        earned ? [rarity.border, rarity.glow] : "border-border opacity-60",
        className
      )}
    >
      {/* Badge icon */}
      <div
        className={cn(
          "relative flex items-center justify-center w-16 h-16 rounded-full text-3xl",
          earned ? "bg-background" : "bg-background grayscale"
        )}
      >
        {earned ? (
          <span>{badge.icon}</span>
        ) : (
          <>
            <span className="grayscale opacity-30">{badge.icon}</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock size={20} className="text-text-muted" />
            </div>
          </>
        )}
      </div>

      {/* Badge name */}
      <h4
        className={cn(
          "font-display text-sm font-bold",
          earned ? "text-text" : "text-text-muted"
        )}
      >
        {badge.name}
      </h4>

      {/* Description */}
      <p className="text-xs text-text-muted font-body leading-relaxed">
        {badge.description}
      </p>

      {/* Rarity label */}
      <span
        className={cn(
          "text-[10px] font-mono font-bold uppercase tracking-wider",
          earned ? rarity.textColor : "text-text-muted"
        )}
      >
        {rarity.label}
      </span>

      {/* Earned date */}
      {earned && earnedAt && (
        <span className="text-[10px] text-text-muted font-body">
          Earned {new Date(earnedAt).toLocaleDateString()}
        </span>
      )}
    </motion.div>
  );
}
