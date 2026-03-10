"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Trophy, Loader2 } from "lucide-react";
import { Leaderboard } from "@/components/gamification/Leaderboard";
import { SparkyMessage } from "@/components/sparky/SparkyMessage";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatarId: number;
  stars: number;
  isCurrentUser?: boolean;
}

type Period = "weekly" | "alltime";

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("weekly");

  const {
    data: entries,
    isLoading,
    error,
  } = useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard", period],
    queryFn: async () => {
      const res = await fetch(`/api/leaderboard?period=${period}`);
      if (!res.ok) throw new Error("Failed to load leaderboard");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-text-muted font-body">
            Loading leaderboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <SparkyMessage
          message="We couldn't load the leaderboard. Try refreshing the page."
          mood="thinking"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="flex items-center justify-center"
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Trophy size={32} className="text-primary" />
          </div>
        </motion.div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-text">
          Leaderboard
        </h1>
        <p className="text-sm text-text-muted font-body">
          See how you stack up against other learners!
        </p>
      </div>

      {/* Period tabs */}
      <div className="flex items-center justify-center">
        <div className="inline-flex rounded-lg border border-border bg-surface p-1">
          <button
            onClick={() => setPeriod("weekly")}
            className={cn(
              "rounded-md px-5 py-2 text-sm font-body font-medium transition-all duration-200",
              period === "weekly"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-text-muted hover:text-text"
            )}
          >
            This Week
          </button>
          <button
            onClick={() => setPeriod("alltime")}
            className={cn(
              "rounded-md px-5 py-2 text-sm font-body font-medium transition-all duration-200",
              period === "alltime"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-text-muted hover:text-text"
            )}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Leaderboard list */}
      {entries && entries.length > 0 ? (
        <Leaderboard entries={entries} />
      ) : (
        <div className="py-12">
          <SparkyMessage
            message="No leaderboard entries yet! Be the first to earn stars and claim the top spot!"
            mood="excited"
          />
        </div>
      )}

      {/* Current user highlight (if they appear in the list) */}
      {entries && entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {entries.find((e) => e.isCurrentUser) ? (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center">
              <p className="text-sm font-body text-text">
                You&apos;re ranked{" "}
                <span className="font-display font-bold text-primary">
                  #{entries.find((e) => e.isCurrentUser)?.rank}
                </span>{" "}
                with{" "}
                <span className="font-display font-bold text-primary">
                  {entries
                    .find((e) => e.isCurrentUser)
                    ?.stars.toLocaleString()}{" "}
                  stars
                </span>
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-surface p-4 text-center">
              <p className="text-sm font-body text-text-muted">
                Complete lessons and quizzes to earn stars and join the leaderboard!
              </p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
