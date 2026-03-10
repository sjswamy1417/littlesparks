"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, Star, Flame, Zap, Check } from "lucide-react";
import { Avatar, ANIMAL_AVATARS } from "@/components/shared/Avatar";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { BadgeCard } from "@/components/gamification/BadgeCard";
import { XPBar } from "@/components/gamification/XPBar";
import { SparkyMessage } from "@/components/sparky/SparkyMessage";
import { cn } from "@/lib/utils";

interface ChildBadge {
  id: string;
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  };
  earnedAt: string;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  avatarId: number;
  role: string;
  childProfile?: {
    stars: number;
    streak: number;
    xp: number;
    level?: number;
    badges?: ChildBadge[];
  };
}

interface AllBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// All available badges
const ALL_BADGES: AllBadge[] = [
  {
    id: "first-spark",
    name: "First Spark",
    description: "Complete your first lesson",
    icon: "✨",
    rarity: "COMMON",
  },
  {
    id: "quiz-whiz",
    name: "Quiz Whiz",
    description: "Score 100% on any quiz",
    icon: "🧠",
    rarity: "RARE",
  },
  {
    id: "7-day-flame",
    name: "7-Day Flame",
    description: "Maintain a 7-day learning streak",
    icon: "🔥",
    rarity: "RARE",
  },
  {
    id: "speed-solver",
    name: "Speed Solver",
    description: "Complete a quiz in under 60 seconds",
    icon: "⚡",
    rarity: "EPIC",
  },
  {
    id: "vedic-master",
    name: "Vedic Master",
    description: "Complete all Vedic Maths modules",
    icon: "🏆",
    rarity: "LEGENDARY",
  },
  {
    id: "perfect-week",
    name: "Perfect Week",
    description: "Learn every day for 7 days",
    icon: "📅",
    rarity: "EPIC",
  },
  {
    id: "star-collector",
    name: "Star Collector",
    description: "Earn 100 total stars",
    icon: "⭐",
    rarity: "RARE",
  },
];

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(null);

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to load profile");
      return res.json();
    },
  });

  async function handleAvatarSelect(avatarId: number) {
    setSelectedAvatarId(avatarId);
    setSavingAvatar(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarId }),
      });

      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      }
    } catch {
      // Revert selection on error
      setSelectedAvatarId(null);
    } finally {
      setSavingAvatar(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-text-muted font-body">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <SparkyMessage
          message="We couldn't load your profile. Please try refreshing."
          mood="thinking"
        />
      </div>
    );
  }

  const childStats = profile.childProfile;
  const stars = childStats?.stars ?? 0;
  const streak = childStats?.streak ?? 0;
  const xp = childStats?.xp ?? 0;
  const level = childStats?.level ?? Math.max(1, Math.floor(xp / 100) + 1);
  const currentAvatarId = selectedAvatarId ?? profile.avatarId;

  // Build earned badge IDs set
  const earnedBadges = new Map<string, string>();
  childStats?.badges?.forEach((cb) => {
    earnedBadges.set(cb.badge.id, cb.earnedAt);
  });

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* User info header */}
      <motion.div
        variants={item}
        className="rounded-xl border border-border bg-surface p-6 md:p-8"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar avatarId={currentAvatarId} size="lg" className="w-20 h-20 text-4xl" />
          <div className="text-center sm:text-left">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-text">
              {profile.name}
            </h1>
            <p className="text-sm text-text-muted font-body mt-1">
              {profile.email}
            </p>
            <p className="text-xs text-text-muted font-body mt-0.5">
              Level {level} Learner
            </p>
          </div>
        </div>
      </motion.div>

      {/* Avatar Picker */}
      <motion.div variants={item}>
        <h2 className="font-display text-lg font-bold text-text mb-4">
          Choose Your Avatar
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {Object.entries(ANIMAL_AVATARS).map(([id, avatar]) => {
            const avatarId = parseInt(id);
            const isSelected = currentAvatarId === avatarId;

            return (
              <motion.button
                key={id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAvatarSelect(avatarId)}
                disabled={savingAvatar}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                    : "border-border bg-surface hover:border-primary/30 hover:bg-primary/5"
                )}
              >
                <span className="text-3xl">{avatar.emoji}</span>
                <span className="text-[10px] text-text-muted font-body">
                  {avatar.label}
                </span>
                {isSelected && (
                  <motion.div
                    layoutId="avatar-check"
                    className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 rounded-full bg-primary"
                  >
                    <Check size={12} className="text-white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Stats section */}
      <motion.div variants={item}>
        <h2 className="font-display text-lg font-bold text-text mb-4">
          Your Stats
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Stars */}
          <div className="rounded-lg border border-border bg-surface p-5 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Star size={24} className="text-primary fill-primary" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-body uppercase tracking-wider">
                Stars
              </p>
              <p className="font-display text-2xl font-bold text-text">
                <AnimatedNumber value={stars} />
              </p>
            </div>
          </div>

          {/* Streak */}
          <div className="rounded-lg border border-border bg-surface p-5 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Flame size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-body uppercase tracking-wider">
                Streak
              </p>
              <p className="font-display text-2xl font-bold text-text">
                <AnimatedNumber value={streak} />{" "}
                <span className="text-sm font-body font-normal text-text-muted">
                  days
                </span>
              </p>
            </div>
          </div>

          {/* XP */}
          <div className="rounded-lg border border-border bg-surface p-5 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10">
              <Zap size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-body uppercase tracking-wider">
                Total XP
              </p>
              <p className="font-display text-2xl font-bold text-text">
                <AnimatedNumber value={xp} />
              </p>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mt-4">
          <XPBar xp={xp} level={level} />
        </div>
      </motion.div>

      {/* Badge Collection */}
      <motion.div variants={item}>
        <h2 className="font-display text-lg font-bold text-text mb-4">
          Badge Collection
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {ALL_BADGES.map((badge) => {
            const earnedAt = earnedBadges.get(badge.id);
            const isEarned = !!earnedAt;

            return (
              <BadgeCard
                key={badge.id}
                badge={badge}
                earned={isEarned}
                earnedAt={earnedAt}
              />
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
