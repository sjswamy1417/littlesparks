"use client";

import { useQuery } from "@tanstack/react-query";

interface LeaderboardEntry {
  id: string;
  name: string;
  avatarId: number;
  stars: number;
  streak: number;
  xp: number;
  rank: number;
}

type LeaderboardPeriod = "weekly" | "alltime";

async function fetchLeaderboard(
  period: LeaderboardPeriod
): Promise<LeaderboardEntry[]> {
  const response = await fetch(`/api/leaderboard?period=${period}`);

  if (!response.ok) {
    throw new Error("Failed to fetch leaderboard");
  }

  return response.json();
}

export function useLeaderboard(period: LeaderboardPeriod = "weekly") {
  const { data, isLoading, error } = useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard", period],
    queryFn: () => fetchLeaderboard(period),
  });

  return {
    leaderboard: data,
    isLoading,
    error,
  };
}
