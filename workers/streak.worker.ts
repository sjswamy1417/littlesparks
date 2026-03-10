import { Worker, Job } from "bullmq";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

interface StreakJobData {
  childId: string;
}

const streakWorker = new Worker<StreakJobData>(
  "streak",
  async (job: Job<StreakJobData>) => {
    const { childId } = job.data;

    const child = await prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child) {
      throw new Error(`Child not found: ${childId}`);
    }

    const now = new Date();
    const lastActive = new Date(child.lastActiveAt);

    // Normalize dates to compare just the calendar day
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastDay = new Date(
      lastActive.getFullYear(),
      lastActive.getMonth(),
      lastActive.getDate()
    );

    const diffTime = today.getTime() - lastDay.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let newStreak = child.streak;

    if (diffDays === 1) {
      // Last active was yesterday — increment streak
      newStreak = child.streak + 1;
    } else if (diffDays === 0) {
      // Already active today — no-op
      console.log(`Child ${childId} already active today, streak unchanged`);
      return { streak: child.streak, action: "no-op" };
    } else {
      // More than 1 day gap — reset streak to 1
      newStreak = 1;
    }

    await prisma.child.update({
      where: { id: childId },
      data: {
        streak: newStreak,
        lastActiveAt: now,
      },
    });

    console.log(
      `Streak updated for child ${childId}: ${child.streak} -> ${newStreak}`
    );

    return { streak: newStreak, action: diffDays === 1 ? "incremented" : "reset" };
  },
  { connection: redis as any }
);

streakWorker.on("completed", (job) => {
  console.log(`Streak job ${job.id} completed`);
});

streakWorker.on("failed", (job, err) => {
  console.error(`Streak job ${job?.id} failed:`, err.message);
});

export default streakWorker;
