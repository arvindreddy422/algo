"use client";

import { useAppStore } from "@/store/useAppStore";
import Link from "next/link";
import { BookmarkMinus, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function BookmarksPage() {
  const { problems, removeBookmark } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-8 animate-pulse">Loading...</div>;

  const bookmarked = problems.filter((p) => p.status === "bookmarked");

  return (
    <div className="py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Bookmarks</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Problems you've saved to solve or review later.</p>
      </header>

      {bookmarked.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-12 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">No bookmarked problems yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarked.map((problem) => (
            <div key={problem.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 flex items-center justify-between group">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium border text-[10px] uppercase tracking-wider",
                    problem.difficulty === 'Easy' ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20" :
                    problem.difficulty === 'Medium' ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20" :
                    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                  )}>
                    {problem.difficulty}
                  </span>
                </div>
                <h3 className="font-semibold text-lg">{problem.title}</h3>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => removeBookmark(problem.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition"
                  title="Remove Bookmark"
                >
                  <BookmarkMinus className="w-4 h-4" />
                </button>
                <Link
                  href={`/problem/${problem.id}`}
                  className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition"
                  title="Solve Problem"
                >
                  <Play className="w-4 h-4 fill-current" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
