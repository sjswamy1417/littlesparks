import { cn } from "@/lib/utils";

const ANIMAL_AVATARS: Record<number, { emoji: string; color: string; label: string }> = {
  1: { emoji: "\uD83E\uDD81", color: "border-primary", label: "Lion" },
  2: { emoji: "\uD83E\uDD8A", color: "border-secondary", label: "Fox" },
  3: { emoji: "\uD83D\uDC3B", color: "border-amber-500", label: "Bear" },
  4: { emoji: "\uD83D\uDC27", color: "border-sky-400", label: "Penguin" },
  5: { emoji: "\uD83E\uDD89", color: "border-violet-400", label: "Owl" },
  6: { emoji: "\uD83D\uDC30", color: "border-pink-400", label: "Rabbit" },
  7: { emoji: "\uD83D\uDC2F", color: "border-orange-400", label: "Tiger" },
  8: { emoji: "\uD83D\uDC32", color: "border-accent", label: "Dragon" },
};

interface AvatarProps {
  avatarId: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8 text-base",
  md: "w-10 h-10 text-xl",
  lg: "w-14 h-14 text-3xl",
};

export function Avatar({ avatarId, size = "md", className }: AvatarProps) {
  const avatar = ANIMAL_AVATARS[avatarId] ?? ANIMAL_AVATARS[1];

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full border-2 bg-surface select-none",
        avatar.color,
        sizeMap[size],
        className
      )}
      role="img"
      aria-label={avatar.label}
    >
      {avatar.emoji}
    </div>
  );
}

export { ANIMAL_AVATARS };
