"use client";

import { Check, Circle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonInfo {
  id: string;
  title: string;
  order: number;
  duration: number;
}

interface ModuleInfo {
  id: string;
  title: string;
}

interface LessonProgress {
  lessonId: string;
  completed: boolean;
}

interface LessonSidebarProps {
  module: ModuleInfo;
  lessons: LessonInfo[];
  currentLessonId: string;
  progress: LessonProgress[];
  onSelectLesson?: (lessonId: string) => void;
  className?: string;
}

export function LessonSidebar({
  module,
  lessons,
  currentLessonId,
  progress,
  onSelectLesson,
  className,
}: LessonSidebarProps) {
  const progressMap = new Map(
    progress.map((p) => [p.lessonId, p.completed])
  );

  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);

  return (
    <aside
      className={cn(
        "w-72 shrink-0 rounded-lg border border-border bg-surface p-4",
        className
      )}
    >
      {/* Module title */}
      <h3 className="font-display text-sm font-bold text-text-muted uppercase tracking-wider mb-4">
        {module.title}
      </h3>

      {/* Lesson list */}
      <nav className="space-y-1">
        {sortedLessons.map((lesson) => {
          const isCurrent = lesson.id === currentLessonId;
          const isCompleted = progressMap.get(lesson.id) === true;

          return (
            <button
              key={lesson.id}
              onClick={() => onSelectLesson?.(lesson.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors duration-150",
                isCurrent
                  ? "bg-primary/10 text-primary"
                  : "text-text-muted hover:bg-background hover:text-text"
              )}
            >
              {/* Status icon */}
              <div className="shrink-0">
                {isCompleted ? (
                  <Check
                    size={18}
                    className="text-accent"
                  />
                ) : isCurrent ? (
                  <PlayCircle
                    size={18}
                    className="text-primary"
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
                <p
                  className={cn(
                    "text-sm font-body font-medium truncate",
                    isCurrent && "font-semibold"
                  )}
                >
                  {lesson.title}
                </p>
                <p className="text-xs text-text-muted/60 font-body">
                  {lesson.duration} min
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Progress summary */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-text-muted font-body">
          {progress.filter((p) => p.completed).length} of {lessons.length}{" "}
          completed
        </p>
      </div>
    </aside>
  );
}
