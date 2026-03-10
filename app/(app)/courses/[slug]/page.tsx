"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  Star,
  CheckCircle2,
  Circle,
  FileQuestion,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { SparkyMessage } from "@/components/sparky/SparkyMessage";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  duration: number;
  order: number;
  starsReward: number;
  completed?: boolean;
  starsEarned?: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  quizzes?: { id: string; title: string }[];
}

interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  modules: Module[];
  progress?: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );

  const { data: course, isLoading, error } = useQuery<CourseDetail>({
    queryKey: ["course", slug],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${slug}`);
      if (!res.ok) throw new Error("Failed to load course");
      return res.json();
    },
  });

  function toggleModule(moduleId: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-text-muted font-body">
            Loading course...
          </p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <SparkyMessage
          message="We couldn't find this course. It might not exist or there was an error loading it."
          mood="thinking"
        />
      </div>
    );
  }

  const sortedModules = [...course.modules].sort(
    (a, b) => a.order - b.order
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/courses")}
          className="gap-1.5 text-text-muted hover:text-text"
        >
          <ArrowLeft size={16} />
          Back to Courses
        </Button>
      </motion.div>

      {/* Course header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-surface p-6 md:p-8"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div
            className="flex items-center justify-center w-20 h-20 rounded-xl text-4xl shrink-0"
            style={{ backgroundColor: `${course.color}15` }}
          >
            {course.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-text">
              {course.title}
            </h1>
            <p className="mt-2 text-sm text-text-muted font-body leading-relaxed">
              {course.description}
            </p>
            <div className="mt-3 flex items-center gap-4 text-sm text-text-muted font-body">
              <span className="flex items-center gap-1.5">
                <BookOpen size={14} />
                {sortedModules.length}{" "}
                {sortedModules.length === 1 ? "module" : "modules"}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {sortedModules.reduce(
                  (acc, m) =>
                    acc + m.lessons.reduce((a, l) => a + l.duration, 0),
                  0
                )}{" "}
                min total
              </span>
            </div>
          </div>
          {course.progress !== undefined && course.progress > 0 && (
            <ProgressRing
              progress={course.progress}
              size={80}
              strokeWidth={6}
              showPercentage={true}
            />
          )}
        </div>
      </motion.div>

      {/* Modules */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-text">
          Course Modules
        </h2>

        {sortedModules.map((module, index) => {
          const isExpanded = expandedModules.has(module.id);
          const sortedLessons = [...module.lessons].sort(
            (a, b) => a.order - b.order
          );
          const completedLessons = sortedLessons.filter(
            (l) => l.completed
          ).length;
          const moduleProgress =
            sortedLessons.length > 0
              ? Math.round(
                  (completedLessons / sortedLessons.length) * 100
                )
              : 0;

          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              className="rounded-lg border border-border bg-surface overflow-hidden"
            >
              {/* Module header */}
              <button
                onClick={() => toggleModule(module.id)}
                className="flex w-full items-center gap-4 p-4 md:p-5 text-left hover:bg-background/50 transition-colors duration-150"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-display font-bold text-sm shrink-0">
                  {module.order}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-base font-bold text-text truncate">
                    {module.title}
                  </h3>
                  <p className="text-xs text-text-muted font-body mt-0.5">
                    {sortedLessons.length} lessons
                    {completedLessons > 0 &&
                      ` · ${completedLessons} completed`}
                  </p>
                </div>
                {moduleProgress > 0 && (
                  <ProgressRing
                    progress={moduleProgress}
                    size={36}
                    strokeWidth={3}
                    showPercentage={false}
                  />
                )}
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown size={18} className="text-text-muted" />
                </motion.div>
              </button>

              {/* Expandable lesson list */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border px-4 pb-4 pt-2 md:px-5 space-y-1">
                      {/* Description */}
                      {module.description && (
                        <p className="text-xs text-text-muted font-body py-2 leading-relaxed">
                          {module.description}
                        </p>
                      )}

                      {/* Lessons */}
                      {sortedLessons.map((lesson) => (
                        <Link
                          key={lesson.id}
                          href={`/courses/${slug}/lesson/${lesson.id}`}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors duration-150",
                            lesson.completed
                              ? "text-text-muted hover:bg-background"
                              : "text-text hover:bg-primary/5"
                          )}
                        >
                          {/* Status icon */}
                          <div className="shrink-0">
                            {lesson.completed ? (
                              <CheckCircle2
                                size={18}
                                className="text-accent"
                              />
                            ) : (
                              <Circle
                                size={18}
                                className="text-text-muted/40"
                              />
                            )}
                          </div>

                          {/* Lesson info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-body font-medium truncate">
                              {lesson.title}
                            </p>
                          </div>

                          {/* Duration */}
                          <span className="text-xs text-text-muted font-body shrink-0 flex items-center gap-1">
                            <Clock size={12} />
                            {lesson.duration}m
                          </span>

                          {/* Stars */}
                          {lesson.completed && lesson.starsEarned ? (
                            <span className="text-xs text-primary font-mono shrink-0 flex items-center gap-0.5">
                              <Star size={12} className="fill-primary" />
                              {lesson.starsEarned}
                            </span>
                          ) : (
                            <span className="text-xs text-text-muted/50 font-mono shrink-0 flex items-center gap-0.5">
                              <Star size={12} />
                              {lesson.starsReward}
                            </span>
                          )}

                          <ChevronRight
                            size={14}
                            className="text-text-muted/40 shrink-0"
                          />
                        </Link>
                      ))}

                      {/* Quiz link */}
                      {module.quizzes && module.quizzes.length > 0 && (
                        <Link
                          href={`/quiz/${module.id}`}
                          className="flex items-center gap-3 rounded-md px-3 py-2.5 mt-2 border border-dashed border-secondary/30 bg-secondary/5 text-secondary hover:bg-secondary/10 transition-colors duration-150"
                        >
                          <FileQuestion size={18} className="shrink-0" />
                          <span className="text-sm font-body font-medium flex-1">
                            Module Quiz
                          </span>
                          <ChevronRight size={14} className="shrink-0" />
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
