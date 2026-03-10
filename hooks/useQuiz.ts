"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

interface QuizAnswer {
  questionId: string;
  answer: string;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  starsEarned: number;
  timeTaken: number;
  results: {
    questionId: string;
    correct: boolean;
    correctAnswer: string;
    explanation: string;
  }[];
}

interface UseQuizProps {
  moduleId: string;
  totalQuestions: number;
}

export function useQuiz({ moduleId, totalQuestions }: UseQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [timer, setTimer] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Start timer on mount
  useEffect(() => {
    if (isComplete) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isComplete]);

  const submitMutation = useMutation<QuizResult, Error, QuizAnswer[]>({
    mutationFn: async (quizAnswers: QuizAnswer[]) => {
      const response = await fetch(`/api/quiz/${moduleId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: quizAnswers,
          timeTaken: timer,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit quiz");
      }

      return response.json();
    },
    onSuccess: () => {
      setIsComplete(true);
    },
  });

  const submitAnswer = useCallback(
    (questionId: string, answer: string) => {
      setAnswers((prev) => {
        const existing = prev.findIndex((a) => a.questionId === questionId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { questionId, answer };
          return updated;
        }
        return [...prev, { questionId, answer }];
      });
    },
    []
  );

  const nextQuestion = useCallback(() => {
    setCurrentQuestion((prev) => Math.min(prev + 1, totalQuestions - 1));
  }, [totalQuestions]);

  const submitQuiz = useCallback(() => {
    submitMutation.mutate(answers);
  }, [answers, submitMutation]);

  return {
    currentQuestion,
    answers,
    timer,
    isComplete,
    submitAnswer,
    nextQuestion,
    submitQuiz,
    result: submitMutation.data,
    isSubmitting: submitMutation.isPending,
    submitError: submitMutation.error,
  };
}
