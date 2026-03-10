import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  const details: Record<string, string> = {};
  let healthy = true;

  // Check database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    details.database = "ok";
  } catch (err) {
    healthy = false;
    details.database = err instanceof Error ? err.message : "unreachable";
  }

  // Check Redis connectivity
  try {
    await redis.ping();
    details.redis = "ok";
  } catch (err) {
    healthy = false;
    details.redis = err instanceof Error ? err.message : "unreachable";
  }

  if (healthy) {
    return NextResponse.json({ status: "ok", details });
  }

  return NextResponse.json({ status: "error", details }, { status: 503 });
}
