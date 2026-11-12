"use client";

import { useSqlStore } from "@/store/useSqlStore";
import { ReviewList } from "@/features/study/components/ReviewList";

export default function SqlReviewPage() {
  const { sqlProblems } = useSqlStore();
  return (
    <ReviewList
      items={sqlProblems}
      title="Spaced Repetition Review"
      description="Master SQL through consistent review."
      emptyTitle="No reviews pending"
      emptyBody="You're all caught up with your SQL reviews. Check back later."
      emptyAction="Practice new SQL problems"
      homeHref="/sql"
      problemHref={(id) => `/sql/problem/${id}`}
    />
  );
}
