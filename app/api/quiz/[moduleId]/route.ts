import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { quizSubmitSchema } from "@/lib/validators/quiz";
import { badgeQueue } from "@/lib/queue";

export const dynamic = "force-dynamic";

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function GET(
  _request: Request,
  { params }: { params: { moduleId: string } }
) {
  try {
    const { moduleId } = params;

    const quiz = await prisma.quiz.findFirst({
      where: { moduleId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "No quiz found for this module" },
        { status: 404 }
      );
    }

    // Shuffle questions and strip correctAnswer
    const questions = shuffle(quiz.questions).map((q) => ({
      id: q.id,
      text: q.text,
      type: q.type,
      options: q.options,
      order: q.order,
    }));

    return NextResponse.json({
      id: quiz.id,
      title: quiz.title,
      moduleId: quiz.moduleId,
      questions,
    });
  } catch (err) {
    console.error("Quiz fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { moduleId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const childId = (session.user as any).childId as string | null;
    if (!childId) {
      return NextResponse.json(
        { error: "Only child accounts can submit quizzes" },
        { status: 403 }
      );
    }

    const { moduleId } = params;
    const body = await request.json();
    const parsed = quizSubmitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { answers, timeTaken } = parsed.data;

    // Load the quiz with correct answers
    const quiz = await prisma.quiz.findFirst({
      where: { moduleId },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "No quiz found for this module" },
        { status: 404 }
      );
    }

    // Build a map of questionId -> correctAnswer
    const correctMap = new Map(
      quiz.questions.map((q) => [q.id, q.correctAnswer])
    );

    // Score the quiz
    let correctCount = 0;
    const feedback: Array<{
      questionId: string;
      correct: boolean;
      correctAnswer: string;
    }> = [];

    for (const ans of answers) {
      const correctAnswer = correctMap.get(ans.questionId);
      if (correctAnswer === undefined) continue;

      const isCorrect = ans.answer === correctAnswer;
      if (isCorrect) correctCount++;

      feedback.push({
        questionId: ans.questionId,
        correct: isCorrect,
        correctAnswer,
      });
    }

    const totalQuestions = quiz.questions.length;
    const scorePercent = totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0;

    // Award stars based on score: 1 star per correct + bonus for perfect
    let starsEarned = correctCount;
    if (correctCount === totalQuestions && totalQuestions > 0) {
      starsEarned += 5; // bonus for perfect score
    }

    // Save result and update child stats in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const quizResult = await tx.quizResult.create({
        data: {
          childId,
          quizId: quiz.id,
          score: correctCount,
          totalQuestions,
          starsEarned,
          timeTaken,
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

      return { quizResult, updatedChild };
    });

    // Enqueue badge check
    await badgeQueue.add("check-badges", {
      childId,
      trigger: "quiz_complete",
      quizId: quiz.id,
      score: correctCount,
      totalQuestions,
    });

    return NextResponse.json({
      quizResultId: result.quizResult.id,
      score: correctCount,
      totalQuestions,
      scorePercent,
      starsEarned,
      totalStars: result.updatedChild.stars,
      totalXp: result.updatedChild.xp,
      feedback,
    });
  } catch (err) {
    console.error("Quiz submit error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
