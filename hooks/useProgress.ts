"use client";

import { useQuery } from "@tanstack/react-query";

interface LessonProgress {
  id: string;
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
  starsEarned: number;
}

interface ChildProgress {
  stars: number;
  xp: number;
  streak: number;
  lastActiveAt: string;
  lessonsCompleted: number;
  totalLessons: number;
  progress: LessonProgress[];
}

async function fetchProgress(): Promise<ChildProgress> {
  const response = await fetch("/api/progress");

  if (!response.ok) {
    throw new Error("Failed to fetch progress");
  }

  return response.json();
}

export function useProgress() {
  const { data, isLoading, error } = useQuery<ChildProgress>({
    queryKey: ["progress"],
    queryFn: fetchProgress,
  });

  return {
    progress: data,
    isLoading,
    error,
  };
}
