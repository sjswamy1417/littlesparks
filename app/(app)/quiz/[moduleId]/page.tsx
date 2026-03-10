"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Loader2,
  Star,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizQuestion } from "@/components/course/QuizQuestion";
import { ConfettiBlast } from "@/components/gamification/ConfettiBlast";
import { SparkyMessage } from "@/components/sparky/SparkyMessage";
import { Sparky } from "@/components/sparky/Sparky";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  order: number;
}

interface QuizData {
  id: string;
  title: string;
  moduleId: string;
  courseSlug?: string;
  questions: Question[];
}

interface QuizResultData {
  score: number;
  totalQuestions: number;
  starsEarned: number;
  passed: boolean;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const moduleId = params.moduleId as string;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [timer, setTimer] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResultData | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch quiz
  const {
    data: quiz,
    isLoading,
    error,
  } = useQuery<QuizData>({
    queryKey: ["quiz", moduleId],
    queryFn: async () => {
      const res = await fetch(`/api/quiz/${moduleId}`);
      if (!res.ok) throw new Error("Failed to load quiz");
      return res.json();
    },
  });

  // Timer
  useEffect(() => {
    if (!isComplete && quiz) {
      timerRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isComplete, quiz]);

  // Submit results
  const submitQuiz = useCallback(async (finalAnswers: boolean[], timeTaken: number) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/quiz/${moduleId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: finalAnswers,
          timeTaken,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        if (data.score / data.totalQuestions >= 0.8) {
          setShowConfetti(true);
        }
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        queryClient.invalidateQueries({ queryKey: ["courses"] });
      }
    } catch {
      // Allow retry
      const score = finalAnswers.filter(Boolean).length;
      setResult({
        score,
        totalQuestions: finalAnswers.length,
        starsEarned: Math.floor((score / finalAnswers.length) * 10),
        passed: score / finalAnswers.length >= 0.8,
      });
    } finally {
      setSubmitting(false);
    }
  }, [moduleId, queryClient]);

  function handleAnswer(isCorrect: boolean) {
    setShowResult(true);
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);

    // Auto-advance after 1.5s
    advanceTimeoutRef.current = setTimeout(() => {
      if (currentQuestionIndex < (quiz?.questions.length ?? 0) - 1) {
        setCurrentQuestionIndex((i) => i + 1);
        setShowResult(false);
      } else {
        // Quiz finished
        setIsComplete(true);
        if (timerRef.current) clearInterval(timerRef.current);
        submitQuiz(newAnswers, timer);
      }
    }, 1500);
  }

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    };
  }, []);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-text-muted font-body">
            Loading quiz...
          </p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <SparkyMessage
          message="We couldn't load this quiz. Please try going back and trying again."
          mood="thinking"
        />
      </div>
    );
  }

  const sortedQuestions = [...quiz.questions].sort(
    (a, b) => a.order - b.order
  );
  const totalQuestions = sortedQuestions.length;
  const currentQuestion = sortedQuestions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + (isComplete ? 1 : 0)) / totalQuestions) * 100;

  // Results screen
  if (isComplete) {
    const scorePercent = result
      ? Math.round((result.score / result.totalQuestions) * 100)
      : 0;
    const isPassing = scorePercent >= 80;

    return (
      <div className="max-w-2xl mx-auto">
        <ConfettiBlast trigger={showConfetti} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-border bg-surface p-8 text-center space-y-6"
        >
          {/* Sparky */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
          >
            <Sparky
              mood={isPassing ? "celebrating" : "proud"}
              size={96}
            />
          </motion.div>

          {/* Title */}
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-text">
              {isPassing ? "Amazing Job!" : "Good Effort!"}
            </h1>
            <p className="mt-2 text-text-muted font-body">
              {isPassing
                ? "You crushed it! Keep up the fantastic work!"
                : "Don't worry, you can always try again to improve your score!"}
            </p>
          </div>

          {/* Score ring */}
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center gap-4"
            >
              <ProgressRing
                progress={scorePercent}
                size={120}
                strokeWidth={8}
                showPercentage={true}
              />
              <div className="space-y-1">
                <p className="text-lg font-display font-bold text-text">
                  {result.score} / {result.totalQuestions} correct
                </p>
                <p className="text-sm text-text-muted font-body flex items-center justify-center gap-1">
                  <Clock size={14} />
                  Time: {formatTime(timer)}
                </p>
              </div>
            </motion.div>
          ) : submitting ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : null}

          {/* Stars earned */}
          {result && result.starsEarned > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-6 py-3"
            >
              <Star size={20} className="text-primary fill-primary" />
              <span className="font-display text-lg font-bold text-primary">
                +{result.starsEarned} Stars Earned!
              </span>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Back to Course
            </Button>
            {!isPassing && (
              <Button
                onClick={() => {
                  setCurrentQuestionIndex(0);
                  setAnswers([]);
                  setTimer(0);
                  setIsComplete(false);
                  setResult(null);
                  setShowConfetti(false);
                  setShowResult(false);
                }}
                className="gap-2"
              >
                <Trophy size={16} />
                Try Again
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Quiz in progress
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-1.5 text-text-muted hover:text-text"
          >
            <ArrowLeft size={16} />
            Exit Quiz
          </Button>
          <div className="flex items-center gap-2 text-sm text-text-muted font-mono">
            <Clock size={16} />
            <span className="tabular-nums">{formatTime(timer)}</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-xl font-bold text-text">
          {quiz.title}
        </h1>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-text-muted font-body">
            <span>
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface border border-border">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <QuizQuestion
            question={currentQuestion}
            onAnswer={handleAnswer}
            showResult={showResult}
          />
        </motion.div>
      </AnimatePresence>

      {/* Answer count */}
      <div className="flex items-center justify-center gap-2">
        {sortedQuestions.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-2 rounded-full transition-all duration-300",
              i < answers.length
                ? answers[i]
                  ? "bg-accent"
                  : "bg-destructive"
                : i === currentQuestionIndex
                ? "bg-primary w-4"
                : "bg-border"
            )}
          />
        ))}
      </div>
    </div>
  );
}
