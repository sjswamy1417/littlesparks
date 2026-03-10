"use client";

import { motion } from "framer-motion";
import { Lock, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressRing } from "@/components/shared/ProgressRing";

interface CourseData {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  modules?: { id: string }[];
}

interface CourseCardProps {
  course: CourseData;
  progress?: number;
  moduleCount?: number;
  className?: string;
  onClick?: () => void;
}

export function CourseCard({
  course,
  progress = 0,
  moduleCount,
  className,
  onClick,
}: CourseCardProps) {
  const isLocked = !course.isActive;
  const totalModules = moduleCount ?? course.modules?.length ?? 0;

  return (
    <motion.div
      whileHover={isLocked ? {} : { y: -6, scale: 1.02 }}
      whileTap={isLocked ? {} : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={isLocked ? undefined : onClick}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-shadow duration-300",
        !isLocked && "cursor-pointer hover:shadow-lg hover:shadow-primary/10",
        isLocked && "cursor-default",
        className
      )}
    >
      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/70 backdrop-blur-sm rounded-lg">
          <Lock size={28} className="text-text-muted" />
          <span className="text-sm font-display font-bold text-text-muted">
            Coming Soon
          </span>
        </div>
      )}

      {/* Color accent strip */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: course.color }}
      />

      <div className="flex flex-col gap-4 p-5">
        {/* Icon and progress */}
        <div className="flex items-start justify-between">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-lg text-2xl"
            style={{ backgroundColor: `${course.color}15` }}
          >
            {course.icon}
          </div>
          {!isLocked && progress > 0 && (
            <ProgressRing
              progress={progress}
              size={48}
              strokeWidth={4}
              showPercentage={true}
            />
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-lg font-bold text-text leading-tight">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-text-muted font-body line-clamp-2 leading-relaxed">
          {course.description}
        </p>

        {/* Module count */}
        <div className="flex items-center gap-1.5 text-xs text-text-muted font-body">
          <BookOpen size={14} />
          <span>
            {totalModules} {totalModules === 1 ? "module" : "modules"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
