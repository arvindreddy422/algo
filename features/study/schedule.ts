import type { ConfidenceLevel, Difficulty, ProblemStatus } from "@/types";

export type ProblemOrder = "EasyFirst" | "HardFirst";

export const REVIEW_INTERVAL_DAYS: Record<ConfidenceLevel, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
};

export const SOLVER_CONFIDENCE: {
  level: ConfidenceLevel;
  label: string;
  desc: string;
  color: string;
}[] = [
  { level: 1, label: "No Idea", desc: "Review tomorrow", color: "text-red-500" },
  { level: 2, label: "Struggled", desc: "Review in 3 days", color: "text-orange-500" },
  { level: 3, label: "Needed Hint", desc: "Review in 7 days", color: "text-yellow-500" },
  { level: 4, label: "Good", desc: "Review in 14 days", color: "text-lime-500" },
  { level: 5, label: "Mastered", desc: "Review in 30 days", color: "text-emerald-500" },
];

export const REVIEW_CONFIDENCE_LABELS: Record<number, { text: string; color: string }> = {
  1: { text: "Struggled", color: "text-red-500" },
  2: { text: "Difficult", color: "text-orange-500" },
  3: { text: "Okay", color: "text-yellow-500" },
  4: { text: "Good", color: "text-blue-500" },
  5: { text: "Easy", color: "text-emerald-500" },
};

const DIFFICULTY_RANK: Record<Difficulty, number> = { Hard: 1, Medium: 2, Easy: 3 };

export type Schedulable = {
  status: ProblemStatus;
  difficulty: Difficulty;
  reviewDate?: string | null;
};

export function getNextReviewDate(confidence: ConfidenceLevel, from = new Date()): string {
  const date = new Date(from);
  date.setDate(date.getDate() + REVIEW_INTERVAL_DAYS[confidence]);
  return date.toISOString();
}

export function isDueReview(item: { status: ProblemStatus; reviewDate?: string | null }, now = new Date()): boolean {
  return item.status === "solved" && !!item.reviewDate && new Date(item.reviewDate).getTime() <= now.getTime();
}

export function countDue<T extends { status: ProblemStatus; reviewDate?: string | null }>(items: T[], now = new Date()): number {
  return items.filter((item) => isDueReview(item, now)).length;
}

export function pickNextItem<T extends Schedulable>(items: T[], order: ProblemOrder, now = new Date()): T | null {
  const due = items.find((item) => isDueReview(item, now));
  if (due) return due;

  const explicit = items.find((item) => item.status === "review");
  if (explicit) return explicit;

  const pending = items.filter((item) => item.status === "pending");
  if (pending.length === 0) return null;
  if (order === "HardFirst") {
    return [...pending].sort((a, b) => DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty])[0];
  }
  return pending[0];
}

export function partitionReviews<T extends { status: ProblemStatus; reviewDate?: string | null }>(items: T[], now = new Date()) {
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + 7);

  const byReviewDate = (a: T, b: T) => new Date(a.reviewDate || 0).getTime() - new Date(b.reviewDate || 0).getTime();

  const due = items.filter((item) => isDueReview(item, now)).sort(byReviewDate);
  const upcoming = items
    .filter((item) => {
      if (item.status !== "solved" || !item.reviewDate) return false;
      const at = new Date(item.reviewDate).getTime();
      return at > now.getTime() && at <= horizon.getTime();
    })
    .sort(byReviewDate);

  return { due, upcoming };
}

export function solvedFields<T extends { attempts: number; solveTime?: number | null; notes?: string | null }>(
  current: T,
  timeSpent: number,
  confidence: ConfidenceLevel,
  notes?: string,
  now = new Date(),
) {
  return {
    status: "solved" as const,
    attempts: current.attempts + 1,
    solveTime: (current.solveTime || 0) + timeSpent,
    solvedAt: now.toISOString(),
    reviewDate: getNextReviewDate(confidence, now),
    confidence,
    notes: notes !== undefined ? notes : (current.notes ?? undefined),
  };
}
