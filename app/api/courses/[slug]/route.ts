import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                slug: true,
                duration: true,
                order: true,
                starsReward: true,
              },
            },
            quizzes: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const session = await auth();
    const childId = (session?.user as any)?.childId as string | null;

    // If child is authenticated, attach progress to each lesson
    let completedLessonIds: Set<string> | undefined;
    if (childId) {
      const allLessonIds = course.modules.flatMap((m) =>
        m.lessons.map((l) => l.id)
      );

      const progressRecords = await prisma.progress.findMany({
        where: {
          childId,
          lessonId: { in: allLessonIds },
          completed: true,
        },
        select: { lessonId: true },
      });

      completedLessonIds = new Set(progressRecords.map((p) => p.lessonId));
    }

    const totalLessons = course.modules.reduce(
      (sum, m) => sum + m.lessons.length,
      0
    );
    const completedCount = completedLessonIds ? completedLessonIds.size : 0;

    const result = {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      thumbnail: course.thumbnail,
      color: course.color,
      icon: course.icon,
      totalLessons,
      ...(childId !== null && {
        progressPercentage:
          totalLessons > 0
            ? Math.round((completedCount / totalLessons) * 100)
            : 0,
      }),
      modules: course.modules.map((mod) => ({
        id: mod.id,
        title: mod.title,
        description: mod.description,
        order: mod.order,
        quizzes: mod.quizzes,
        lessons: mod.lessons.map((lesson) => ({
          ...lesson,
          ...(completedLessonIds !== undefined && {
            completed: completedLessonIds.has(lesson.id),
          }),
        })),
      })),
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("Course fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
