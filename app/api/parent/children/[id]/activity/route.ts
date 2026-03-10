import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parentId = (session.user as any).parentId as string | null;
    if (!parentId) {
      return NextResponse.json(
        { error: "Only parent accounts can access this endpoint" },
        { status: 403 }
      );
    }

    const { id: childId } = params;

    // Verify this child belongs to the authenticated parent
    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: {
        user: {
          select: { name: true, avatarId: true },
        },
      },
    });

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    if (child.parentId !== parentId) {
      return NextResponse.json(
        { error: "This child is not linked to your account" },
        { status: 403 }
      );
    }

    // Fetch recent lesson completions
    const recentLessons = await prisma.progress.findMany({
      where: { childId, completed: true },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            slug: true,
            module: {
              select: {
                title: true,
                course: {
                  select: { title: true, slug: true },
                },
              },
            },
          },
        },
      },
      orderBy: { completedAt: "desc" },
      take: 20,
    });

    // Fetch recent quiz results
    const recentQuizzes = await prisma.quizResult.findMany({
      where: { childId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                title: true,
                course: {
                  select: { title: true, slug: true },
                },
              },
            },
          },
        },
      },
      orderBy: { completedAt: "desc" },
      take: 20,
    });

    // Merge and sort by date into a single activity feed
    const activity = [
      ...recentLessons.map((p) => ({
        type: "lesson_completed" as const,
        date: p.completedAt,
        lessonTitle: p.lesson.title,
        moduleTitle: p.lesson.module.title,
        courseTitle: p.lesson.module.course.title,
        starsEarned: p.starsEarned,
      })),
      ...recentQuizzes.map((qr) => ({
        type: "quiz_completed" as const,
        date: qr.completedAt,
        quizTitle: qr.quiz.title,
        moduleTitle: qr.quiz.module.title,
        courseTitle: qr.quiz.module.course.title,
        score: qr.score,
        totalQuestions: qr.totalQuestions,
        starsEarned: qr.starsEarned,
      })),
    ].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({
      child: {
        id: child.id,
        name: child.user.name,
        avatarId: child.user.avatarId,
        stars: child.stars,
        xp: child.xp,
        streak: child.streak,
      },
      activity,
    });
  } catch (err) {
    console.error("Child activity fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
