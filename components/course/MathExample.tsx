"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MathStep {
  label: string;
  value: string;
}

interface MathExampleProps {
  problem: string;
  steps: MathStep[];
  answer: string;
  className?: string;
}

export function MathExample({
  problem,
  steps,
  answer,
  className,
}: MathExampleProps) {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const allStepsVisible = visibleSteps >= steps.length;

  function handleNext() {
    if (visibleSteps < steps.length) {
      setVisibleSteps((prev) => prev + 1);
    } else if (!showAnswer) {
      setShowAnswer(true);
    }
  }

  function handleReset() {
    setVisibleSteps(0);
    setShowAnswer(false);
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface p-5",
        className
      )}
    >
      {/* Problem */}
      <div className="mb-5">
        <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
          Problem
        </span>
        <p className="mt-1 font-mono text-xl font-bold text-text">
          {problem}
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-3 mb-5">
        <AnimatePresence mode="popLayout">
          {steps.slice(0, visibleSteps).map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: 20 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
              className="flex items-start gap-3 rounded-md bg-background px-4 py-3"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-xs font-mono font-bold text-secondary">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-body text-text-muted">
                  {step.label}
                </p>
                <p className="font-mono text-sm font-semibold text-text mt-0.5">
                  {step.value}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Answer */}
      <AnimatePresence>
        {showAnswer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mb-5 flex items-center gap-3 rounded-md border border-accent/30 bg-accent/10 px-4 py-3"
          >
            <CheckCircle2 size={20} className="text-accent shrink-0" />
            <div>
              <span className="text-xs font-body text-accent/80">Answer</span>
              <p className="font-mono text-lg font-bold text-accent">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!showAnswer ? (
          <Button onClick={handleNext} size="sm" variant="default">
            <span className="flex items-center gap-1.5">
              {allStepsVisible ? "Show Answer" : "Next Step"}
              <ChevronRight size={14} />
            </span>
          </Button>
        ) : (
          <Button onClick={handleReset} size="sm" variant="ghost">
            Try Again
          </Button>
        )}

        {visibleSteps > 0 && !showAnswer && (
          <Button onClick={handleReset} size="sm" variant="ghost">
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
