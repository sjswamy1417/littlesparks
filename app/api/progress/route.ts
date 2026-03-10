import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const childId = (session.user as any).childId as string | null;
    if (!childId) {
      return NextResponse.json(
        { error: "Only child accounts can view progress" },
        { status: 403 }
      );
    }

    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: {
        stars: true,
        xp: true,
        streak: true,
        lastActiveAt: true,
      },
    });

    if (!child) {
      return NextResponse.json(
        { error: "Child profile not found" },
        { status: 404 }
      );
    }

    // Get all completed lessons with course info
    const completedLessons = await prisma.progress.findMany({
      where: { childId, completed: true },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            slug: true,
            starsReward: true,
            module: {
              select: {
                id: true,
                title: true,
                course: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { completedAt: "desc" },
    });

    // Get quiz results
    const quizResults = await prisma.quizResult.findMany({
      where: { childId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            moduleId: true,
          },
        },
      },
      orderBy: { completedAt: "desc" },
    });

    // Get badges earned
    const badges = await prisma.childBadge.findMany({
      where: { childId },
      include: {
        badge: {
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
            rarity: true,
          },
        },
      },
      orderBy: { earnedAt: "desc" },
    });

    return NextResponse.json({
      stats: {
        totalStars: child.stars,
        totalXp: child.xp,
        streak: child.streak,
        lastActiveAt: child.lastActiveAt,
        lessonsCompleted: completedLessons.length,
        quizzesTaken: quizResults.length,
        badgesEarned: badges.length,
      },
      completedLessons: completedLessons.map((p) => ({
        lessonId: p.lesson.id,
        lessonTitle: p.lesson.title,
        lessonSlug: p.lesson.slug,
        starsEarned: p.starsEarned,
        completedAt: p.completedAt,
        moduleTitle: p.lesson.module.title,
        courseTitle: p.lesson.module.course.title,
        courseSlug: p.lesson.module.course.slug,
      })),
      quizResults: quizResults.map((qr) => ({
        id: qr.id,
        quizTitle: qr.quiz.title,
        score: qr.score,
        totalQuestions: qr.totalQuestions,
        starsEarned: qr.starsEarned,
        timeTaken: qr.timeTaken,
        completedAt: qr.completedAt,
      })),
      badges: badges.map((cb) => ({
        id: cb.badge.id,
        name: cb.badge.name,
        description: cb.badge.description,
        icon: cb.badge.icon,
        rarity: cb.badge.rarity,
        earnedAt: cb.earnedAt,
      })),
    });
  } catch (err) {
    console.error("Progress fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
