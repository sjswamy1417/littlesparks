import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, role, age, parentEmail } = parsed.data;

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    // If role is CHILD and parentEmail is provided, look up the parent
    let parentId: string | undefined;
    if (role === "CHILD" && parentEmail) {
      const parentUser = await prisma.user.findUnique({
        where: { email: parentEmail },
        include: { parentProfile: true },
      });

      if (!parentUser || !parentUser.parentProfile) {
        return NextResponse.json(
          { error: "No parent account found with that email" },
          { status: 404 }
        );
      }

      parentId = parentUser.parentProfile.id;
    }

    // Create the user and the corresponding profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role,
        },
      });

      if (role === "CHILD") {
        await tx.child.create({
          data: {
            userId: newUser.id,
            age: age ?? 8,
            parentId,
          },
        });
      } else if (role === "PARENT") {
        await tx.parent.create({
          data: {
            userId: newUser.id,
          },
        });
      }

      return newUser;
    });

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
