import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "alltime";

    const redisKey =
      period === "weekly" ? "leaderboard:weekly" : "leaderboard:alltime";

    // Try to get leaderboard from Redis sorted set (top 10, highest scores first)
    const cached = await redis.zrevrange(redisKey, 0, 9, "WITHSCORES");

    if (cached && cached.length > 0) {
      // Parse Redis result: [member, score, member, score, ...]
      const entries: Array<{ childId: string; stars: number }> = [];
      for (let i = 0; i < cached.length; i += 2) {
        entries.push({
          childId: cached[i],
          stars: parseInt(cached[i + 1], 10),
        });
      }

      // Enrich with child/user data
      const childIds = entries.map((e) => e.childId);
      const children = await prisma.child.findMany({
        where: { id: { in: childIds } },
        include: {
          user: {
            select: { name: true, avatarId: true },
          },
        },
      });

      const childMap = new Map(children.map((c) => [c.id, c]));

      const leaderboard = entries
        .map((entry, index) => {
          const child = childMap.get(entry.childId);
          if (!child) return null;
          return {
            rank: index + 1,
            childId: child.id,
            name: child.user.name,
            avatarId: child.user.avatarId,
            stars: entry.stars,
            xp: child.xp,
            streak: child.streak,
          };
        })
        .filter(Boolean);

      return NextResponse.json({ period, leaderboard });
    }

    // Fallback: query DB directly and populate Redis cache
    const topChildren = await prisma.child.findMany({
      orderBy: { stars: "desc" },
      take: 10,
      include: {
        user: {
          select: { name: true, avatarId: true },
        },
      },
    });

    // Populate the Redis sorted set for future reads
    const pipeline = redis.pipeline();
    for (const child of topChildren) {
      pipeline.zadd(redisKey, child.stars, child.id);
    }
    // Expire weekly leaderboard after 7 days, alltime after 1 hour (auto-refresh)
    pipeline.expire(redisKey, period === "weekly" ? 604800 : 3600);
    await pipeline.exec();

    const leaderboard = topChildren.map((child, index) => ({
      rank: index + 1,
      childId: child.id,
      name: child.user.name,
      avatarId: child.user.avatarId,
      stars: child.stars,
      xp: child.xp,
      streak: child.streak,
    }));

    return NextResponse.json({ period, leaderboard });
  } catch (err) {
    console.error("Leaderboard fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
