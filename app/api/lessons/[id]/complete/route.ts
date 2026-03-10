import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { badgeQueue } from "@/lib/queue";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const childId = (session.user as any).childId as string | null;
    if (!childId) {
      return NextResponse.json(
        { error: "Only child accounts can complete lessons" },
        { status: 403 }
      );
    }

    const { id: lessonId } = params;

    // Verify the lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Check if already completed
    const existing = await prisma.progress.findUnique({
      where: {
        childId_lessonId: {
          childId,
          lessonId,
        },
      },
    });

    if (existing?.completed) {
      return NextResponse.json({
        message: "Lesson already completed",
        starsEarned: 0,
        totalStars: (await prisma.child.findUnique({ where: { id: childId } }))
          ?.stars ?? 0,
      });
    }

    const starsEarned = lesson.starsReward;

    // Upsert progress and update child's stars + XP in a transaction
    const result = await prisma.$transaction(async (tx) => {
      await tx.progress.upsert({
        where: {
          childId_lessonId: {
            childId,
            lessonId,
          },
        },
        update: {
          completed: true,
          completedAt: new Date(),
          starsEarned,
        },
        create: {
          childId,
          lessonId,
          completed: true,
          completedAt: new Date(),
          starsEarned,
        },
      });

      const updatedChild = await tx.child.update({
        where: { id: childId },
        data: {
          stars: { increment: starsEarned },
          xp: { increment: starsEarned * 10 },
          lastActiveAt: new Date(),
        },
      });

      return updatedChild;
    });

    // Enqueue badge check asynchronously
    await badgeQueue.add("check-badges", {
      childId,
      trigger: "lesson_complete",
      lessonId,
    });

    return NextResponse.json({
      message: "Lesson completed!",
      starsEarned,
      totalStars: result.stars,
      totalXp: result.xp,
    });
  } catch (err) {
    console.error("Lesson complete error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
