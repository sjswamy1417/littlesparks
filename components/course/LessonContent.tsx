"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SparkyMessage } from "@/components/sparky/SparkyMessage";
import { MathExample } from "./MathExample";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SparkMood = "excited" | "proud" | "thinking" | "celebrating" | "idle";

interface IntroBlock {
  type: "intro";
  text: string;
  sparkyMood?: SparkMood;
}

interface ConceptBlock {
  type: "concept";
  title: string;
  text: string;
}

interface WorkedExampleBlock {
  type: "worked_example";
  problem: string;
  steps: { label: string; value: string }[];
  answer: string;
  animation?: string;
}

interface TryItBlock {
  type: "try_it";
  problem: string;
  answer: string;
  hint?: string;
}

interface TipBlock {
  type: "tip";
  text: string;
  example?: string;
}

type ContentBlock =
  | IntroBlock
  | ConceptBlock
  | WorkedExampleBlock
  | TryItBlock
  | TipBlock;

interface LessonContentProps {
  content: { blocks: ContentBlock[] };
  className?: string;
}

function TryItSection({ block }: { block: TryItBlock }) {
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);

  function handleSubmit() {
    const normalized = userAnswer.trim().replace(/\s+/g, "");
    const expected = block.answer.trim().replace(/\s+/g, "");
    setResult(normalized === expected ? "correct" : "wrong");
  }

  function handleRetry() {
    setUserAnswer("");
    setResult(null);
  }

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-mono text-primary uppercase tracking-wider font-bold">
          Try It Yourself
        </span>
      </div>
      <p className="font-mono text-lg font-bold text-text mb-4">
        {block.problem}
      </p>

      <div className="flex items-center gap-3 mb-3">
        <Input
          value={userAnswer}
          onChange={(e) => {
            setUserAnswer(e.target.value);
            if (result) setResult(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Your answer..."
          className={cn(
            "max-w-[200px] font-mono text-lg",
            result === "correct" && "border-accent focus-visible:ring-accent",
            result === "wrong" && "border-destructive focus-visible:ring-destructive animate-shake"
          )}
          disabled={result === "correct"}
        />
        {result !== "correct" && (
          <Button onClick={handleSubmit} size="sm" disabled={!userAnswer.trim()}>
            Check
          </Button>
        )}
        {result === "wrong" && (
          <Button onClick={handleRetry} size="sm" variant="ghost">
            Retry
          </Button>
        )}
      </div>

      {/* Feedback */}
      {result === "correct" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-accent"
        >
          <CheckCircle2 size={18} />
          <span className="text-sm font-body font-semibold">
            Correct! Great job!
          </span>
        </motion.div>
      )}
      {result === "wrong" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-primary"
        >
          <AlertCircle size={18} />
          <span className="text-sm font-body">
            Not quite -- try again!
          </span>
        </motion.div>
      )}

      {/* Hint */}
      {block.hint && (
        <div className="mt-3">
          {!showHint ? (
            <button
              onClick={() => setShowHint(true)}
              className="text-xs text-text-muted hover:text-text font-body underline underline-offset-2 transition-colors"
            >
              Need a hint?
            </button>
          ) : (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-sm text-text-muted font-body italic"
            >
              Hint: {block.hint}
            </motion.p>
          )}
        </div>
      )}
    </div>
  );
}

export function LessonContent({ content, className }: LessonContentProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {content.blocks.map((block, index) => {
        switch (block.type) {
          case "intro":
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <SparkyMessage
                  message={block.text}
                  mood={block.sparkyMood ?? "excited"}
                />
              </motion.div>
            );

          case "concept":
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg border border-border bg-surface p-5"
              >
                <h3 className="font-display text-lg font-bold text-text mb-2">
                  {block.title}
                </h3>
                <p className="text-sm text-text-muted font-body leading-relaxed">
                  {block.text}
                </p>
              </motion.div>
            );

          case "worked_example":
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MathExample
                  problem={block.problem}
                  steps={block.steps}
                  answer={block.answer}
                />
              </motion.div>
            );

          case "try_it":
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TryItSection block={block} />
              </motion.div>
            );

          case "tip":
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg border border-accent/20 bg-accent/5 p-5"
              >
                <div className="flex items-start gap-3">
                  <Lightbulb
                    size={20}
                    className="text-accent shrink-0 mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-mono text-accent uppercase tracking-wider font-bold">
                      Pro Tip
                    </span>
                    <p className="mt-1 text-sm text-text font-body leading-relaxed">
                      {block.text}
                    </p>
                    {block.example && (
                      <p className="mt-2 font-mono text-sm text-text-muted bg-background rounded px-3 py-2">
                        {block.example}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
