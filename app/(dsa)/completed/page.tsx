"use client";

import { useAppStore } from "@/store/useAppStore";
import { CompletedList } from "@/features/study/components/CompletedList";

export default function CompletedPage() {
  const { problems } = useAppStore();
  return (
    <CompletedList
      items={problems}
      title="Completed"
      description="Everything you've successfully solved."
      emptyTitle="No completed problems yet"
      emptyBody="Head to the dashboard to start solving some problems."
      emptyAction="Start Solving"
      homeHref="/"
      problemHref={(id) => `/problem/${id}`}
    />
  );
}
