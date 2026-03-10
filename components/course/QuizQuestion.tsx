"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionData {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizQuestionProps {
  question: QuestionData;
  onAnswer: (isCorrect: boolean) => void;
  showResult: boolean;
  className?: string;
}

export function QuizQuestion({
  question,
  onAnswer,
  showResult,
  className,
}: QuizQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  function handleSelect(option: string) {
    if (selectedOption !== null) return; // Already answered

    setSelectedOption(option);
    const correct = option === question.correctAnswer;
    setIsCorrect(correct);
    onAnswer(correct);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-lg border border-border bg-surface p-6", className)}
    >
      {/* Question text */}
      <h3 className="font-display text-lg font-bold text-text mb-5 leading-relaxed">
        {question.text}
      </h3>

      {/* Options grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === option;
          const isAnswer = option === question.correctAnswer;
          const answered = selectedOption !== null;

          let optionState: "default" | "correct" | "wrong" | "missed" = "default";
          if (showResult && answered) {
            if (isSelected && isCorrect) optionState = "correct";
            else if (isSelected && !isCorrect) optionState = "wrong";
            else if (!isSelected && isAnswer) optionState = "missed";
          }

          return (
            <motion.button
              key={index}
              onClick={() => handleSelect(option)}
              disabled={answered}
              whileHover={!answered ? { scale: 1.02 } : {}}
              whileTap={!answered ? { scale: 0.98 } : {}}
              animate={
                optionState === "wrong"
                  ? {
                      x: [0, -6, 6, -4, 4, -2, 2, 0],
                    }
                  : optionState === "correct"
                  ? {
                      scale: [1, 1.05, 1],
                    }
                  : {}
              }
              transition={
                optionState === "wrong"
                  ? { duration: 0.5 }
                  : optionState === "correct"
                  ? { duration: 0.4, ease: "easeOut" }
                  : {}
              }
              className={cn(
                "relative flex items-center gap-3 rounded-lg border px-4 py-3 text-left font-body text-sm transition-all duration-200",
                !answered &&
                  "border-border bg-background hover:border-primary/50 hover:bg-primary/5 cursor-pointer",
                answered && "cursor-default",
                optionState === "correct" &&
                  "border-accent/50 bg-accent/10 text-accent",
                optionState === "wrong" &&
                  "border-destructive/50 bg-destructive/10 text-destructive",
                optionState === "missed" &&
                  "border-accent/30 bg-accent/5",
                optionState === "default" && answered && "opacity-50"
              )}
            >
              {/* Option label (A, B, C, D) */}
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold font-mono",
                  optionState === "correct"
                    ? "bg-accent/20 text-accent"
                    : optionState === "wrong"
                    ? "bg-destructive/20 text-destructive"
                    : "bg-surface text-text-muted"
                )}
              >
                {String.fromCharCode(65 + index)}
              </span>

              {/* Option text */}
              <span className="flex-1">{option}</span>

              {/* Result icon */}
              {showResult && answered && optionState === "correct" && (
                <CheckCircle2 size={18} className="text-accent shrink-0" />
              )}
              {showResult && answered && optionState === "wrong" && (
                <XCircle size={18} className="text-destructive shrink-0" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Explanation */}
      {showResult && selectedOption !== null && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ delay: 0.3 }}
          className="mt-4 rounded-md bg-background p-4"
        >
          <p className="text-sm text-text-muted font-body">
            <span className="font-semibold text-text">Explanation: </span>
            {question.explanation}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
