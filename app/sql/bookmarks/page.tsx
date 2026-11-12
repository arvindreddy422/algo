"use client";

import { useSqlStore } from "@/store/useSqlStore";
import { BookmarkList } from "@/features/study/components/BookmarkList";

export default function SqlBookmarksPage() {
  const { sqlProblems, removeSqlBookmark } = useSqlStore();
  return (
    <BookmarkList
      items={sqlProblems}
      title="SQL Bookmarks"
      description="Problems you've saved for later."
      emptyTitle="No bookmarked SQL problems"
      emptyBody="Press B while viewing a problem to save it here."
      emptyAction="Browse SQL problems"
      homeHref="/sql"
      problemHref={(id) => `/sql/problem/${id}`}
      onRemove={removeSqlBookmark}
    />
  );
}
