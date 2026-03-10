"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Star,
  Flame,
  Zap,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import { Avatar } from "@/components/shared/Avatar";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { SparkyMessage } from "@/components/sparky/SparkyMessage";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { cn } from "@/lib/utils";

interface RecentActivity {
  id: string;
  type: "lesson_complete" | "quiz_complete" | "badge_earned";
  title: string;
  starsEarned?: number;
  score?: number;
  date: string;
}

interface ChildData {
  id: string;
  userId: string;
  user: {
    name: string;
    avatarId: number;
  };
  age: number;
  stars: number;
  streak: number;
  xp: number;
  lessonsCompleted?: number;
  quizzesCompleted?: number;
  overallProgress?: number;
  recentActivity?: RecentActivity[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function ParentDashboardPage() {
  const [expandedChild, setExpandedChild] = useState<string | null>(null);

  const {
    data: children,
    isLoading,
    error,
  } = useQuery<ChildData[]>({
    queryKey: ["parent-children"],
    queryFn: async () => {
      const res = await fetch("/api/parent/children");
      if (!res.ok) throw new Error("Failed to load children data");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
          <p className="text-sm text-text-muted font-body">
            Loading your children&apos;s progress...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <SparkyMessage
          message="We couldn't load your children's data. Please try refreshing."
          mood="thinking"
        />
      </div>
    );
  }

  // Summary stats
  const totalStars = children?.reduce((sum, c) => sum + c.stars, 0) ?? 0;
  const totalLessons =
    children?.reduce((sum, c) => sum + (c.lessonsCompleted ?? 0), 0) ?? 0;
  const avgStreak =
    children && children.length > 0
      ? Math.round(
          children.reduce((sum, c) => sum + c.streak, 0) / children.length
        )
      : 0;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Sparky welcome */}
      <motion.div variants={item}>
        <SparkyMessage
          message="Here's how your little sparks are doing!"
          mood="proud"
          sparkySize={72}
        />
      </motion.div>

      {/* Overall summary */}
      <motion.div variants={item}>
        <h2 className="font-display text-lg font-bold text-text mb-4">
          Overall Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-surface p-5 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Star size={24} className="text-primary fill-primary" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-body uppercase tracking-wider">
                Total Stars
              </p>
              <p className="font-display text-2xl font-bold text-text">
                <AnimatedNumber value={totalStars} />
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10">
              <BookOpen size={24} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-body uppercase tracking-wider">
                Lessons Done
              </p>
              <p className="font-display text-2xl font-bold text-text">
                <AnimatedNumber value={totalLessons} />
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10">
              <Flame size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-body uppercase tracking-wider">
                Avg. Streak
              </p>
              <p className="font-display text-2xl font-bold text-text">
                <AnimatedNumber value={avgStreak} />{" "}
                <span className="text-sm font-body font-normal text-text-muted">
                  days
                </span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Children cards */}
      <motion.div variants={item}>
        <h2 className="font-display text-lg font-bold text-text mb-4">
          Your Children
        </h2>

        {children && children.length > 0 ? (
          <div className="space-y-4">
            {children.map((child, index) => {
              const isExpanded = expandedChild === child.id;
              const level = Math.max(
                1,
                Math.floor(child.xp / 100) + 1
              );

              return (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="rounded-xl border border-border bg-surface overflow-hidden"
                >
                  {/* Child header */}
                  <button
                    onClick={() =>
                      setExpandedChild(
                        isExpanded ? null : child.id
                      )
                    }
                    className="flex w-full items-center gap-4 p-5 text-left hover:bg-background/50 transition-colors duration-150"
                  >
                    <Avatar
                      avatarId={child.user.avatarId}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-bold text-text">
                        {child.user.name}
                      </h3>
                      <p className="text-xs text-text-muted font-body">
                        Age {child.age} &middot; Level {level}
                      </p>
                    </div>

                    {/* Quick stats */}
                    <div className="hidden sm:flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm font-mono text-primary">
                        <Star
                          size={14}
                          className="fill-primary"
                        />
                        {child.stars.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-sm font-mono text-text-muted">
                        <Flame size={14} />
                        {child.streak}d
                      </div>
                      <div className="flex items-center gap-1 text-sm font-mono text-secondary">
                        <Zap size={14} />
                        {child.xp} XP
                      </div>
                    </div>

                    {child.overallProgress !== undefined && (
                      <ProgressRing
                        progress={child.overallProgress}
                        size={44}
                        strokeWidth={4}
                        showPercentage={true}
                      />
                    )}

                    <motion.div
                      animate={{
                        rotate: isExpanded ? 180 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0"
                    >
                      <ChevronDown
                        size={18}
                        className="text-text-muted"
                      />
                    </motion.div>
                  </button>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                        }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: "easeInOut",
                        }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border px-5 pb-5 pt-4 space-y-4">
                          {/* Stats grid - visible on mobile too */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="rounded-md bg-background p-3 text-center">
                              <p className="text-xs text-text-muted font-body">
                                Stars
                              </p>
                              <p className="font-mono text-lg font-bold text-primary">
                                {child.stars.toLocaleString()}
                              </p>
                            </div>
                            <div className="rounded-md bg-background p-3 text-center">
                              <p className="text-xs text-text-muted font-body">
                                Streak
                              </p>
                              <p className="font-mono text-lg font-bold text-text">
                                {child.streak} days
                              </p>
                            </div>
                            <div className="rounded-md bg-background p-3 text-center">
                              <p className="text-xs text-text-muted font-body">
                                XP
                              </p>
                              <p className="font-mono text-lg font-bold text-secondary">
                                {child.xp}
                              </p>
                            </div>
                            <div className="rounded-md bg-background p-3 text-center">
                              <p className="text-xs text-text-muted font-body">
                                Lessons
                              </p>
                              <p className="font-mono text-lg font-bold text-accent">
                                {child.lessonsCompleted ?? 0}
                              </p>
                            </div>
                          </div>

                          {/* Recent activity */}
                          {child.recentActivity &&
                            child.recentActivity.length > 0 && (
                              <div>
                                <h4 className="text-sm font-display font-bold text-text mb-3">
                                  Recent Activity
                                </h4>
                                <div className="space-y-2">
                                  {child.recentActivity.map(
                                    (activity) => (
                                      <div
                                        key={activity.id}
                                        className="flex items-center gap-3 rounded-md bg-background px-3 py-2.5"
                                      >
                                        <div className="shrink-0">
                                          {activity.type ===
                                          "lesson_complete" ? (
                                            <BookOpen
                                              size={16}
                                              className="text-accent"
                                            />
                                          ) : activity.type ===
                                            "quiz_complete" ? (
                                            <Star
                                              size={16}
                                              className="text-primary"
                                            />
                                          ) : (
                                            <Zap
                                              size={16}
                                              className="text-secondary"
                                            />
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-body text-text truncate">
                                            {activity.title}
                                          </p>
                                        </div>
                                        {activity.starsEarned && (
                                          <span className="text-xs font-mono text-primary shrink-0">
                                            +
                                            {
                                              activity.starsEarned
                                            }{" "}
                                            stars
                                          </span>
                                        )}
                                        <span className="text-xs text-text-muted font-body shrink-0 flex items-center gap-1">
                                          <Clock
                                            size={10}
                                          />
                                          {new Date(
                                            activity.date
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {(!child.recentActivity ||
                            child.recentActivity.length === 0) && (
                            <p className="text-sm text-text-muted font-body text-center py-2">
                              No recent activity yet.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="py-8">
            <SparkyMessage
              message="No children linked to your account yet. Once a child signs up with your email as their parent email, they'll appear here!"
              mood="thinking"
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
