import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { profileUpdateSchema } from "@/lib/validators/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        childProfile: {
          include: {
            badges: {
              include: {
                badge: {
                  select: {
                    id: true,
                    name: true,
                    icon: true,
                    rarity: true,
                  },
                },
              },
              orderBy: { earnedAt: "desc" },
            },
          },
        },
        parentProfile: {
          include: {
            children: {
              include: {
                user: {
                  select: { name: true, avatarId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profile: Record<string, any> = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarId: user.avatarId,
      createdAt: user.createdAt,
    };

    if (user.childProfile) {
      profile.child = {
        id: user.childProfile.id,
        age: user.childProfile.age,
        stars: user.childProfile.stars,
        xp: user.childProfile.xp,
        streak: user.childProfile.streak,
        lastActiveAt: user.childProfile.lastActiveAt,
        badges: user.childProfile.badges.map((cb) => ({
          id: cb.badge.id,
          name: cb.badge.name,
          icon: cb.badge.icon,
          rarity: cb.badge.rarity,
          earnedAt: cb.earnedAt,
        })),
      };
    }

    if (user.parentProfile) {
      profile.parent = {
        id: user.parentProfile.id,
        children: user.parentProfile.children.map((c) => ({
          id: c.id,
          name: c.user.name,
          avatarId: c.user.avatarId,
          stars: c.stars,
          xp: c.xp,
          streak: c.streak,
        })),
      };
    }

    return NextResponse.json(profile);
  } catch (err) {
    console.error("Profile fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, avatarId } = parsed.data;

    // Build update data only for provided fields
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (avatarId !== undefined) updateData.avatarId = avatarId;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatarId: true,
        role: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
