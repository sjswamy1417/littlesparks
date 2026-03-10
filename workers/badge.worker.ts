import { Worker, Job } from "bullmq";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

interface BadgeJobData {
  childId: string;
  trigger: "lesson_complete" | "quiz_complete" | "streak_update";
}

interface BadgeCondition {
  type: string;
  threshold?: number;
  course?: string;
}

async function checkBadgeConditions(childId: string) {
  const child = await prisma.child.findUnique({
    where: { id: childId },
    include: {
      progress: { where: { completed: true } },
      quizResults: true,
      badges: { include: { badge: true } },
    },
  });

  if (!child) {
    throw new Error(`Child not found: ${childId}`);
  }

  const allBadges = await prisma.badge.findMany();
  const earnedBadgeIds = new Set(child.badges.map((cb) => cb.badgeId));
  const newBadges: string[] = [];

  for (const badge of allBadges) {
    // Skip already earned badges
    if (earnedBadgeIds.has(badge.id)) continue;

    const condition = badge.condition as unknown as BadgeCondition;
    let earned = false;

    switch (condition.type) {
      case "lessons_completed": {
        // "First Spark": lessons completed >= threshold
        earned = child.progress.length >= (condition.threshold ?? 1);
        break;
      }

      case "perfect_quiz": {
        // "Quiz Whiz": any quiz with 100% score
        earned = child.quizResults.some(
          (r) => r.score === r.totalQuestions
        );
        break;
      }

      case "streak": {
        // "7-Day Flame" / "Perfect Week": streak >= threshold
        earned = child.streak >= (condition.threshold ?? 7);
        break;
      }

      case "speed_quiz": {
        // "Speed Solver": any quiz completed in under threshold seconds
        earned = child.quizResults.some(
          (r) => r.timeTaken < (condition.threshold ?? 60)
        );
        break;
      }

      case "course_complete": {
        // "Vedic Master": all lessons in a course completed
        if (condition.course) {
          const course = await prisma.course.findUnique({
            where: { slug: condition.course },
            include: {
              modules: {
                include: {
                  lessons: { select: { id: true } },
                },
              },
            },
          });

          if (course) {
            const allLessonIds = course.modules.flatMap((m) =>
              m.lessons.map((l) => l.id)
            );
            const completedLessonIds = new Set(
              child.progress.map((p) => p.lessonId)
            );
            earned =
              allLessonIds.length > 0 &&
              allLessonIds.every((id) => completedLessonIds.has(id));
          }
        }
        break;
      }

      case "total_stars": {
        // "Star Collector": total stars >= threshold
        earned = child.stars >= (condition.threshold ?? 100);
        break;
      }
    }

    if (earned) {
      await prisma.childBadge.create({
        data: {
          childId,
          badgeId: badge.id,
        },
      });
      newBadges.push(badge.name);
    }
  }

  return newBadges;
}

const badgeWorker = new Worker<BadgeJobData>(
  "badge",
  async (job: Job<BadgeJobData>) => {
    const { childId, trigger } = job.data;

    console.log(`Checking badges for child ${childId}, trigger: ${trigger}`);

    const newBadges = await checkBadgeConditions(childId);

    if (newBadges.length > 0) {
      console.log(
        `Child ${childId} earned new badges: ${newBadges.join(", ")}`
      );
    } else {
      console.log(`No new badges earned for child ${childId}`);
    }

    return { newBadges };
  },
  { connection: redis as any }
);

badgeWorker.on("completed", (job) => {
  console.log(`Badge job ${job.id} completed`);
});

badgeWorker.on("failed", (job, err) => {
  console.error(`Badge job ${job?.id} failed:`, err.message);
});

export default badgeWorker;
