"use client";

import { useSqlStore } from "@/store/useSqlStore";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, isPast } from "date-fns";
import { RotateCcw } from "lucide-react";
import Link from "next/link";

export default function SqlReviewPage() {
  const { sqlProblems } = useSqlStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-8 animate-pulse">Loading...</div>;

  const now = new Date();

  // Due immediately or in the past
  const dueReviews = sqlProblems
    .filter((p) => p.status === "solved" && p.reviewDate && isPast(new Date(p.reviewDate)))
    .sort((a, b) => new Date(a.reviewDate || 0).getTime() - new Date(b.reviewDate || 0).getTime());

  // Upcoming reviews (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

  const upcomingReviews = sqlProblems
    .filter(
      (p) =>
        p.status === "solved" &&
        p.reviewDate &&
        new Date(p.reviewDate).getTime() > now.getTime() &&
        new Date(p.reviewDate).getTime() <= nextWeek.getTime()
    )
    .sort((a, b) => new Date(a.reviewDate || 0).getTime() - new Date(b.reviewDate || 0).getTime());

  return (
    <div className="py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Spaced Repetition Review</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Master SQL through consistent review.</p>
        </div>
        <div className="bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
          <RotateCcw className="w-5 h-5" />
          {dueReviews.length} Due Now
        </div>
      </header>

      {dueReviews.length === 0 && upcomingReviews.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-12 text-center flex flex-col items-center">
          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full mb-4">
            <RotateCcw className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No reviews pending</h3>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">You're all caught up with your SQL reviews! Check back later.</p>
          <Link href="/sql" className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-6 py-2.5 rounded-lg font-medium transition hover:scale-[1.02]">
            Practice New SQL Problems
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {dueReviews.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                Due Now
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dueReviews.map((problem) => (
                  <div key={problem.id} className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/50 rounded-xl p-5 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-medium border uppercase tracking-wider",
                        problem.difficulty === 'Easy' ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20" :
                        problem.difficulty === 'Medium' ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20" :
                        "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                      )}>
                        {problem.difficulty}
                      </span>
                      <span className="text-xs text-zinc-500 ml-auto">
                        Confidence: {problem.confidence}/5
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">{problem.title}</h3>
                    <p className="text-xs text-zinc-500 mb-4 line-clamp-2">
                      {problem.topics.join(", ")}
                    </p>
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-xs font-medium text-red-600 dark:text-red-400">
                        {problem.reviewDate ? `Due ${formatDistanceToNow(new Date(problem.reviewDate), { addSuffix: true })}` : "Due now"}
                      </span>
                      <Link 
                        href={`/sql/problem/${problem.id}`}
                        className="text-sm bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-3 py-1.5 rounded-md font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcomingReviews.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Upcoming This Week</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-80">
                {upcomingReviews.map((problem) => (
                  <div key={problem.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-medium border uppercase tracking-wider",
                        problem.difficulty === 'Easy' ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20" :
                        problem.difficulty === 'Medium' ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20" :
                        "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                      )}>
                        {problem.difficulty}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">{problem.title}</h3>
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-500">
                        {problem.reviewDate ? `Due in ${formatDistanceToNow(new Date(problem.reviewDate))}` : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
