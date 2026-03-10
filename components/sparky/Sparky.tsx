"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type SparkMood = "excited" | "proud" | "thinking" | "celebrating" | "idle";

interface SparkyProps {
  mood?: SparkMood;
  size?: number;
  className?: string;
}

function getEyes(mood: SparkMood) {
  switch (mood) {
    case "excited":
      // Wide open sparkly eyes
      return (
        <>
          <circle cx="38" cy="42" r="5" fill="#0F0E17" />
          <circle cx="62" cy="42" r="5" fill="#0F0E17" />
          <circle cx="40" cy="40" r="1.5" fill="#FFFBF2" />
          <circle cx="64" cy="40" r="1.5" fill="#FFFBF2" />
        </>
      );
    case "proud":
      // Happy squinting eyes
      return (
        <>
          <path
            d="M33 42 Q38 37 43 42"
            stroke="#0F0E17"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M57 42 Q62 37 67 42"
            stroke="#0F0E17"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </>
      );
    case "thinking":
      // One eye squinting, one wide
      return (
        <>
          <circle cx="38" cy="42" r="4" fill="#0F0E17" />
          <circle cx="40" cy="40" r="1.2" fill="#FFFBF2" />
          <path
            d="M57 43 Q62 39 67 43"
            stroke="#0F0E17"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </>
      );
    case "celebrating":
      // Big happy eyes with stars
      return (
        <>
          <circle cx="38" cy="42" r="5.5" fill="#0F0E17" />
          <circle cx="62" cy="42" r="5.5" fill="#0F0E17" />
          <circle cx="40" cy="40" r="2" fill="#FFFBF2" />
          <circle cx="64" cy="40" r="2" fill="#FFFBF2" />
          {/* Tiny star sparkles near eyes */}
          <circle cx="46" cy="36" r="1" fill="#C8F135" />
          <circle cx="54" cy="36" r="1" fill="#C8F135" />
        </>
      );
    case "idle":
    default:
      // Relaxed default eyes
      return (
        <>
          <circle cx="38" cy="42" r="4" fill="#0F0E17" />
          <circle cx="62" cy="42" r="4" fill="#0F0E17" />
          <circle cx="40" cy="40" r="1.2" fill="#FFFBF2" />
          <circle cx="64" cy="40" r="1.2" fill="#FFFBF2" />
        </>
      );
  }
}

function getMouth(mood: SparkMood) {
  switch (mood) {
    case "excited":
      return (
        <path
          d="M40 54 Q50 64 60 54"
          stroke="#0F0E17"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      );
    case "proud":
      return (
        <path
          d="M42 53 Q50 60 58 53"
          stroke="#0F0E17"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      );
    case "thinking":
      // Small "o" mouth
      return (
        <ellipse cx="52" cy="56" rx="4" ry="3" fill="#0F0E17" />
      );
    case "celebrating":
      // Big open smile
      return (
        <path
          d="M38 52 Q50 68 62 52"
          stroke="#0F0E17"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="#FF8C5A"
        />
      );
    case "idle":
    default:
      return (
        <path
          d="M43 54 Q50 59 57 54"
          stroke="#0F0E17"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      );
  }
}

function getCheeks(mood: SparkMood) {
  // Blush cheeks for certain moods
  if (mood === "proud" || mood === "celebrating" || mood === "excited") {
    return (
      <>
        <ellipse cx="30" cy="50" rx="5" ry="3" fill="#FF8C5A" opacity={0.4} />
        <ellipse cx="70" cy="50" rx="5" ry="3" fill="#FF8C5A" opacity={0.4} />
      </>
    );
  }
  return null;
}

export function Sparky({ mood = "idle", size = 80, className }: SparkyProps) {
  return (
    <motion.div
      className={cn("inline-flex", className)}
      animate={{
        y: [0, -6, 0],
      }}
      transition={{
        duration: 3,
        ease: "easeInOut",
        repeat: Infinity,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Glow behind star */}
        <defs>
          <radialGradient id="sparky-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#FFD700" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="star-fill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FF8C00" />
            <stop offset="100%" stopColor="#FF6B35" />
          </linearGradient>
        </defs>

        {/* Background glow */}
        <circle cx="50" cy="50" r="48" fill="url(#sparky-glow)" />

        {/* Five-pointed star body */}
        <motion.path
          d="M50 8 L61 35 L90 38 L68 56 L75 85 L50 70 L25 85 L32 56 L10 38 L39 35 Z"
          fill="url(#star-fill)"
          stroke="#E8A800"
          strokeWidth="1.5"
          animate={
            mood === "celebrating"
              ? { scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }
              : mood === "excited"
              ? { scale: [1, 1.03, 1] }
              : {}
          }
          transition={{
            duration: mood === "celebrating" ? 0.6 : 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "50px 50px" }}
        />

        {/* Face */}
        {getEyes(mood)}
        {getMouth(mood)}
        {getCheeks(mood)}

        {/* Sparkle effects for celebrating mood */}
        {mood === "celebrating" && (
          <>
            <motion.circle
              cx="15"
              cy="20"
              r="2"
              fill="#C8F135"
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            />
            <motion.circle
              cx="85"
              cy="25"
              r="1.5"
              fill="#FF6B35"
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
            />
            <motion.circle
              cx="20"
              cy="80"
              r="1.5"
              fill="#7B2FBE"
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
            />
            <motion.circle
              cx="80"
              cy="78"
              r="2"
              fill="#C8F135"
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.9 }}
            />
          </>
        )}
      </svg>
    </motion.div>
  );
}
