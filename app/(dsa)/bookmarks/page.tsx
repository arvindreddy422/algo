"use client";

import { useAppStore } from "@/store/useAppStore";
import { BookmarkList } from "@/features/study/components/BookmarkList";

export default function BookmarksPage() {
  const { problems, removeBookmark } = useAppStore();
  return (
    <BookmarkList
      items={problems}
      title="Bookmarks"
      description="Problems you've saved to solve or review later."
      emptyTitle="No bookmarked problems yet"
      emptyBody="Press B while viewing a problem to save it here."
      emptyAction="Browse problems"
      homeHref="/"
      problemHref={(id) => `/problem/${id}`}
      onRemove={removeBookmark}
    />
  );
}
