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

    const parentId = (session.user as any).parentId as string | null;
    if (!parentId) {
      return NextResponse.json(
        { error: "Only parent accounts can access this endpoint" },
        { status: 403 }
      );
    }

    const children = await prisma.child.findMany({
      where: { parentId },
      include: {
        user: {
          select: { name: true, email: true, avatarId: true },
        },
        progress: {
          where: { completed: true },
          select: { id: true },
        },
      },
    });

    const result = children.map((child) => ({
      id: child.id,
      name: child.user.name,
      email: child.user.email,
      avatarId: child.user.avatarId,
      age: child.age,
      stars: child.stars,
      xp: child.xp,
      streak: child.streak,
      lastActiveAt: child.lastActiveAt,
      lessonsCompleted: child.progress.length,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("Parent children fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
