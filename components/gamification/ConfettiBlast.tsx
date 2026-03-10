"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface ConfettiBlastProps {
  trigger: boolean;
}

export function ConfettiBlast({ trigger }: ConfettiBlastProps) {
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (trigger && !hasFiredRef.current) {
      hasFiredRef.current = true;

      const colors = ["#FF6B35", "#7B2FBE", "#C8F135", "#FFD700"];

      // Center burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6, x: 0.5 },
        colors,
        shapes: ["star", "circle"],
        ticks: 200,
        gravity: 0.8,
        scalar: 1.2,
      });

      // Left side burst
      setTimeout(() => {
        confetti({
          particleCount: 40,
          angle: 60,
          spread: 55,
          origin: { x: 0.2, y: 0.65 },
          colors,
          shapes: ["star", "circle"],
          ticks: 180,
          gravity: 0.9,
        });
      }, 150);

      // Right side burst
      setTimeout(() => {
        confetti({
          particleCount: 40,
          angle: 120,
          spread: 55,
          origin: { x: 0.8, y: 0.65 },
          colors,
          shapes: ["star", "circle"],
          ticks: 180,
          gravity: 0.9,
        });
      }, 300);
    }

    // Reset when trigger goes back to false
    if (!trigger) {
      hasFiredRef.current = false;
    }
  }, [trigger]);

  // This component doesn't render anything visible
  return null;
}
