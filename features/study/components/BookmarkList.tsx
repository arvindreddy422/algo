"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Play, X } from "lucide-react";
import type { Difficulty, ProblemStatus } from "@/types";
import { DifficultyBadge } from "@/features/study/components/DifficultyBadge";

type BookmarkItem = {
  id: number;
  title: string;
  difficulty: Difficulty;
  topics: string[];
  status: ProblemStatus;
  source?: string;
};

type BookmarkListProps = {
  items: BookmarkItem[];
  title: string;
  description: string;
  emptyTitle: string;
  emptyBody: string;
  emptyAction: string;
  homeHref: string;
  problemHref: (id: number) => string;
  onRemove: (id: number) => void;
};

export function BookmarkList({
  items,
  title,
  description,
  emptyTitle,
  emptyBody,
  emptyAction,
  homeHref,
  problemHref,
  onRemove,
}: BookmarkListProps) {
  const mounted = useMounted();
  if (!mounted) return <div className="p-8 animate-pulse">Loading...</div>;

  const bookmarked = items.filter((item) => item.status === "bookmarked");

  return (
    <div className="py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">{title}</h1>
          <p className="text-zinc-500 dark:text-zinc-400">{description}</p>
        </div>
        <div className="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
          <Bookmark className="w-5 h-5 fill-current" />
          {bookmarked.length} Saved
        </div>
      </header>

      {bookmarked.length === 0 ? (
        <EmptyState title={emptyTitle} body={emptyBody} action={emptyAction} href={homeHref} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarked.map((problem) => (
            <div key={problem.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col group relative">
              <button
                onClick={() => onRemove(problem.id)}
                className="absolute top-4 right-4 p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                title="Remove bookmark"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-3 pr-8">
                <DifficultyBadge difficulty={problem.difficulty} compact />
                {problem.source && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 uppercase tracking-wider">
                    {problem.source}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-lg mb-2 line-clamp-1">{problem.title}</h3>
              <div className="flex flex-wrap gap-1.5 mb-6">
                {problem.topics.slice(0, 3).map((topic) => (
                  <span key={topic} className="text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    {topic}
                  </span>
                ))}
              </div>
              <div className="mt-auto pt-4 border-t border-gray-100 dark:border-zinc-800">
                <Link
                  href={problemHref(problem.id)}
                  className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 py-2 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Solve Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function EmptyState({ title, body, action, href }: { title: string; body: string; action: string; href: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-12 text-center flex flex-col items-center">
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-zinc-500 dark:text-zinc-400 mb-6">{body}</p>
      <Link href={href} className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-6 py-2.5 rounded-lg font-medium transition hover:scale-[1.02]">
        {action}
      </Link>
    </div>
  );
}

export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
