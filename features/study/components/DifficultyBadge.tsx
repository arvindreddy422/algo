import { cn } from "@/lib/utils";
import type { Difficulty } from "@/types";

const TONE: Record<Difficulty, string> = {
  Easy: "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
  Medium: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20",
  Hard: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
};

export function DifficultyBadge({ difficulty, compact = false }: { difficulty: Difficulty; compact?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full border font-medium",
        compact ? "text-[10px] px-2 py-0.5 uppercase tracking-wider" : "text-xs px-2.5 py-0.5",
        TONE[difficulty],
      )}
    >
      {difficulty}
    </span>
  );
}
