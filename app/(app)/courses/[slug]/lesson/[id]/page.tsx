"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LessonSidebar } from "@/components/course/LessonSidebar";
import { LessonContent } from "@/components/course/LessonContent";
import { ConfettiBlast } from "@/components/gamification/ConfettiBlast";
import { SparkyMessage } from "@/components/sparky/SparkyMessage";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface LessonData {
  id: string;
  title: string;
  slug: string;
  content: { blocks: Array<Record<string, unknown>> };
  duration: number;
  order: number;
  starsReward: number;
  moduleId: string;
  completed?: boolean;
}

interface ModuleData {
  id: string;
  title: string;
  lessons: {
    id: string;
    title: string;
    order: number;
    duration: number;
  }[];
}

interface CourseData {
  id: string;
  title: string;
  slug: string;
  modules: ModuleData[];
}

interface ProgressEntry {
  lessonId: string;
  completed: boolean;
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const slug = params.slug as string;
  const lessonId = params.id as string;

  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Fetch lesson data
  const {
    data: lesson,
    isLoading: lessonLoading,
    error: lessonError,
  } = useQuery<LessonData>({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const res = await fetch(`/api/lessons/${lessonId}`);
      if (!res.ok) throw new Error("Failed to load lesson");
      return res.json();
    },
  });

  // Fetch course for sidebar navigation
  const { data: course } = useQuery<CourseData>({
    queryKey: ["course", slug],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${slug}`);
      if (!res.ok) throw new Error("Failed to load course");
      return res.json();
    },
  });

  // Find current module and next lesson
  const currentModule = course?.modules?.find(
    (m) => m.id === lesson?.moduleId
  );
  const sortedLessons = currentModule
    ? [...currentModule.lessons].sort((a, b) => a.order - b.order)
    : [];
  const currentIndex = sortedLessons.findIndex((l) => l.id === lessonId);
  const nextLesson =
    currentIndex >= 0 && currentIndex < sortedLessons.length - 1
      ? sortedLessons[currentIndex + 1]
      : null;

  // Build progress for sidebar (derive from lesson.completed states or an empty array)
  const sidebarProgress: ProgressEntry[] = sortedLessons.map((l) => ({
    lessonId: l.id,
    completed: l.id === lessonId ? completed || (lesson?.completed ?? false) : false,
  }));

  async function handleComplete() {
    setCompleting(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setCompleted(true);
        setStarsEarned(data.starsEarned ?? lesson?.starsReward ?? 5);
        setShowConfetti(true);

        // Invalidate cached queries
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        queryClient.invalidateQueries({ queryKey: ["courses"] });
        queryClient.invalidateQueries({ queryKey: ["course", slug] });
      }
    } catch {
      // Silently handle error - user can retry
    } finally {
      setCompleting(false);
    }
  }

  function handleSelectLesson(id: string) {
    router.push(`/courses/${slug}/lesson/${id}`);
  }

  if (lessonLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-text-muted font-body">
            Loading lesson...
          </p>
        </div>
      </div>
    );
  }

  if (lessonError || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <SparkyMessage
          message="We couldn't load this lesson. Please try going back and trying again."
          mood="thinking"
        />
      </div>
    );
  }

  const isAlreadyComplete = lesson.completed || completed;

  return (
    <div className="max-w-7xl mx-auto">
      <ConfettiBlast trigger={showConfetti} />

      {/* Back link */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Link
          href={`/courses/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors font-body"
        >
          <ArrowLeft size={16} />
          Back to {course?.title ?? "Course"}
        </Link>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        {currentModule && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden lg:block"
          >
            <LessonSidebar
              module={{
                id: currentModule.id,
                title: currentModule.title,
              }}
              lessons={sortedLessons}
              currentLessonId={lessonId}
              progress={sidebarProgress}
              onSelectLesson={handleSelectLesson}
              className="sticky top-24"
            />
          </motion.div>
        )}

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 min-w-0"
        >
          {/* Lesson title */}
          <div className="mb-6">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-text">
              {lesson.title}
            </h1>
            <p className="mt-1 text-sm text-text-muted font-body">
              {lesson.duration} min read
            </p>
          </div>

          {/* Lesson content blocks */}
          <LessonContent
            content={lesson.content as { blocks: Array<{ type: "intro"; text: string; sparkyMood?: "excited" | "proud" | "thinking" | "celebrating" | "idle" } | { type: "concept"; title: string; text: string } | { type: "worked_example"; problem: string; steps: { label: string; value: string }[]; answer: string; animation?: string } | { type: "try_it"; problem: string; answer: string; hint?: string } | { type: "tip"; text: string; example?: string }> }}
          />

          {/* Complete / Next section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 rounded-xl border border-border bg-surface p-6"
          >
            {isAlreadyComplete ? (
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className="flex justify-center"
                >
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent/10">
                    <CheckCircle2 size={32} className="text-accent" />
                  </div>
                </motion.div>
                <div>
                  <h3 className="font-display text-lg font-bold text-text">
                    Lesson Complete!
                  </h3>
                  {starsEarned > 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-1 text-sm text-primary font-body flex items-center justify-center gap-1.5"
                    >
                      <Star size={16} className="fill-primary" />
                      +{starsEarned} stars earned!
                    </motion.p>
                  )}
                </div>
                {nextLesson && (
                  <Button
                    onClick={() =>
                      router.push(
                        `/courses/${slug}/lesson/${nextLesson.id}`
                      )
                    }
                    size="lg"
                    className="gap-2"
                  >
                    Next Lesson
                    <ArrowRight size={16} />
                  </Button>
                )}
                {!nextLesson && (
                  <Button
                    variant="secondary"
                    onClick={() => router.push(`/courses/${slug}`)}
                    size="lg"
                  >
                    Back to Course
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-base font-bold text-text">
                    Finished reading?
                  </h3>
                  <p className="text-sm text-text-muted font-body">
                    Mark this lesson as complete to earn{" "}
                    <span className="text-primary font-semibold">
                      {lesson.starsReward} stars
                    </span>
                  </p>
                </div>
                <Button
                  onClick={handleComplete}
                  disabled={completing}
                  size="lg"
                  className={cn("gap-2 shrink-0")}
                >
                  {completing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Complete Lesson
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
