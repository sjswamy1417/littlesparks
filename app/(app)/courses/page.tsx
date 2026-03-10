"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { CourseCard } from "@/components/course/CourseCard";
import { SparkyMessage } from "@/components/sparky/SparkyMessage";

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

export default function CoursesPage() {
  const router = useRouter();

  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("Failed to load courses");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-text-muted font-body">
            Loading courses...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <SparkyMessage
          message="Oops! We couldn't load the courses. Please try refreshing."
          mood="thinking"
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Page header */}
      <motion.div variants={item}>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <BookOpen size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-text">
              Course Catalog
            </h1>
            <p className="text-sm text-text-muted font-body">
              Choose a course and start learning
            </p>
          </div>
        </div>
      </motion.div>

      {/* Course grid */}
      {courses && courses.length > 0 ? (
        <motion.div
          variants={item}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.05 * index,
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
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
        </motion.div>
      ) : (
        <motion.div variants={item} className="py-12">
          <SparkyMessage
            message="No courses available yet. We're working on some exciting content -- check back soon!"
            mood="thinking"
          />
        </motion.div>
      )}
    </motion.div>
  );
}
