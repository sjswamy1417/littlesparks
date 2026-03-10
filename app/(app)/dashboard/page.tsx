"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Loader2 } from "lucide-react";
import { Sparky } from "@/components/sparky/Sparky";
import { SparkyMessage } from "@/components/sparky/SparkyMessage";
import { StarCounter } from "@/components/gamification/StarCounter";
import { StreakBadge } from "@/components/gamification/StreakBadge";
import { XPBar } from "@/components/gamification/XPBar";
import { CourseCard } from "@/components/course/CourseCard";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  name: string;
  avatarId: number;
  role: string;
  childProfile?: {
    stars: number;
    streak: number;
    xp: number;
    level?: number;
  };
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  modules?: { id: string }[];
  progress?: number;
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

export default function DashboardPage() {
  const router = useRouter();

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to load profile");
      return res.json();
    },
  });

  const {
    data: courses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("Failed to load courses");
      return res.json();
    },
  });

  const isLoading = profileLoading || coursesLoading;
  const hasError = profileError || coursesError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-text-muted font-body">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <SparkyMessage
          message="Oops! Something went wrong loading your dashboard. Try refreshing the page."
          mood="thinking"
        />
      </div>
    );
  }

  const childStats = profile?.childProfile;
  const stars = childStats?.stars ?? 0;
  const streak = childStats?.streak ?? 0;
  const xp = childStats?.xp ?? 0;
  const level = childStats?.level ?? Math.max(1, Math.floor(xp / 100) + 1);
  const hasProgress = stars > 0 || streak > 0 || xp > 0;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Welcome banner */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-r from-surface via-surface to-primary/5 p-6 md:p-8"
      >
        <div className="flex items-center gap-4 md:gap-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
          >
            <Sparky mood="excited" size={80} />
          </motion.div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-text">
              Welcome back, {profile?.name ?? "Learner"}!
            </h1>
            <p className="mt-1 text-sm md:text-base text-text-muted font-body">
              {hasProgress
                ? "Ready for another day of learning magic?"
                : "Let's begin your learning adventure today!"}
            </p>
          </div>
        </div>
        {/* Decorative gradient orb */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-5 -bottom-10 h-32 w-32 rounded-full bg-secondary/10 blur-3xl" />
      </motion.div>

      {/* Stats row */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {/* Stars */}
        <div className="rounded-lg border border-border bg-surface p-4 flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <StarCounter count={stars} size="lg" />
          </div>
          <div>
            <p className="text-xs text-text-muted font-body uppercase tracking-wider">
              Total Stars
            </p>
            <p className="font-display text-xl font-bold text-text">
              {stars.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Streak */}
        <div className="rounded-lg border border-border bg-surface p-4 flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <StreakBadge streak={streak} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-body uppercase tracking-wider">
              Current Streak
            </p>
            <p className="font-display text-xl font-bold text-text">
              {streak} {streak === 1 ? "day" : "days"}
            </p>
          </div>
        </div>

        {/* XP */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <XPBar xp={xp} level={level} />
        </div>
      </motion.div>

      {/* Your Courses */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={20} className="text-primary" />
          <h2 className="font-display text-xl font-bold text-text">
            Your Courses
          </h2>
        </div>

        {courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <CourseCard
                  course={course}
                  progress={course.progress ?? 0}
                  onClick={
                    course.isActive
                      ? () => router.push(`/courses/${course.slug}`)
                      : undefined
                  }
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-8">
            <SparkyMessage
              message="No courses found yet. Check back soon for exciting new content!"
              mood="thinking"
            />
          </div>
        )}
      </motion.div>

      {/* Encouragement for new users */}
      {!hasProgress && courses && courses.length > 0 && (
        <motion.div variants={item}>
          <SparkyMessage
            message="Pick a course above to start learning! Each lesson earns you stars and XP. Can you make it to the leaderboard?"
            mood="excited"
          />
        </motion.div>
      )}
    </motion.div>
  );
}
