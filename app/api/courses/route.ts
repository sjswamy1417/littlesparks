import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    const courses = await prisma.course.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              select: { id: true },
            },
          },
        },
      },
    });

    // If the user is an authenticated child, calculate progress per course
    const childId = (session?.user as any)?.childId as string | null;

    const result = await Promise.all(
      courses.map(async (course) => {
        const allLessonIds = course.modules.flatMap((m) =>
          m.lessons.map((l) => l.id)
        );
        const totalLessons = allLessonIds.length;

        let progressPercentage: number | undefined;

        if (childId && totalLessons > 0) {
          const completedCount = await prisma.progress.count({
            where: {
              childId,
              lessonId: { in: allLessonIds },
              completed: true,
            },
          });
          progressPercentage = Math.round((completedCount / totalLessons) * 100);
        }

        return {
          id: course.id,
          title: course.title,
          slug: course.slug,
          description: course.description,
          thumbnail: course.thumbnail,
          color: course.color,
          icon: course.icon,
          order: course.order,
          totalLessons,
          ...(progressPercentage !== undefined && { progressPercentage }),
        };
      })
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error("Courses fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
