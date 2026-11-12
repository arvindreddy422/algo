"use client";

import { useSqlStore } from "@/store/useSqlStore";
import { CompletedList } from "@/features/study/components/CompletedList";

export default function SqlCompletedPage() {
  const { sqlProblems } = useSqlStore();
  return (
    <CompletedList
      items={sqlProblems}
      title="Completed SQL"
      description="Everything you've successfully solved."
      emptyTitle="No completed SQL problems yet"
      emptyBody="Head to the dashboard to start solving some SQL problems."
      emptyAction="Start Solving"
      homeHref="/sql"
      problemHref={(id) => `/sql/problem/${id}`}
    />
  );
}
