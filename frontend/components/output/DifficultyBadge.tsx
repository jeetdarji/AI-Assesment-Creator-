"use client";

interface DifficultyBadgeProps {
  difficulty: "Easy" | "Moderate" | "Hard";
}

const BADGE_STYLES: Record<string, string> = {
  Easy: "bg-green-100 text-green-700 border-green-300",
  Moderate: "bg-amber-100 text-amber-700 border-amber-300",
  Hard: "bg-red-100 text-red-700 border-red-300",
};

export default function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const style = BADGE_STYLES[difficulty] || BADGE_STYLES.Easy;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${style}`}
    >
      {difficulty}
    </span>
  );
}
