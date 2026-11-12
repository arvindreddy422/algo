"use client";

import { useAppStore } from "@/store/useAppStore";
import { ReviewList } from "@/features/study/components/ReviewList";

export default function ReviewPage() {
  const { problems } = useAppStore();
  return (
    <ReviewList
      items={problems}
      title="Spaced Repetition"
      description="Review previously solved problems to strengthen retention."
      emptyTitle="No reviews scheduled"
      emptyBody="Solve problems and set your confidence level to schedule spaced repetition reviews."
      emptyAction="Start Solving"
      homeHref="/"
      problemHref={(id) => `/problem/${id}`}
    />
  );
}
