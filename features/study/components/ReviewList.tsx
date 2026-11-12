"use client";

import Link from "next/link";
import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";
import { CalendarClock, CheckCircle2, Clock, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Difficulty, ProblemStatus } from "@/types";
import { partitionReviews, REVIEW_CONFIDENCE_LABELS } from "@/features/study/schedule";
import { DifficultyBadge } from "@/features/study/components/DifficultyBadge";
import { useMounted } from "@/features/study/components/BookmarkList";

type ReviewItem = {
  id: number;
  title: string;
  difficulty: Difficulty;
  topics: string[];
  status: ProblemStatus;
  reviewDate?: string;
  confidence?: number;
};

type ReviewListProps = {
  items: ReviewItem[];
  title: string;
  description: string;
  emptyTitle: string;
  emptyBody: string;
  emptyAction: string;
  homeHref: string;
  problemHref: (id: number) => string;
};

export function ReviewList({
  items,
  title,
  description,
  emptyTitle,
  emptyBody,
  emptyAction,
  homeHref,
  problemHref,
}: ReviewListProps) {
  const mounted = useMounted();
  if (!mounted) return <div className="p-8 animate-pulse">Loading...</div>;

  const { due, upcoming } = partitionReviews(items);

  const formatReviewDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d, yyyy");
  };

  return (
    <div className="py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">{title}</h1>
          <p className="text-zinc-500 dark:text-zinc-400">{description}</p>
        </div>
        {due.length > 0 && (
          <div className="bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {due.length} Due Now
          </div>
        )}
      </header>

      {due.length === 0 && upcoming.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-12 text-center flex flex-col items-center">
          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full mb-4">
            <CheckCircle2 className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="font-semibold text-lg mb-1">{emptyTitle}</h3>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">{emptyBody}</p>
          <Link href={homeHref} className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-6 py-2.5 rounded-lg font-medium transition hover:scale-[1.02]">
            {emptyAction}
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {due.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                Due for Review
              </h2>
              <div className="space-y-3">
                {due.map((problem) => {
                  const confidence = problem.confidence ? REVIEW_CONFIDENCE_LABELS[problem.confidence] : null;
                  return (
                    <div key={problem.id} className="bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-500/20 rounded-xl p-5 flex items-center justify-between group">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1.5">
                          <DifficultyBadge difficulty={problem.difficulty} compact />
                          {confidence && <span className={cn("text-xs font-medium", confidence.color)}>{confidence.text}</span>}
                          <span className="text-xs text-zinc-400">
                            {problem.reviewDate && `Due ${formatDistanceToNow(new Date(problem.reviewDate), { addSuffix: true })}`}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg truncate">{problem.title}</h3>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {problem.topics.slice(0, 3).map((topic) => (
                            <span key={topic} className="text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Link
                        href={problemHref(problem.id)}
                        className="ml-4 bg-purple-600 text-white px-5 py-2.5 rounded-lg font-medium inline-flex items-center gap-2 hover:bg-purple-700 transition-colors shrink-0"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        Review
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {upcoming.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-zinc-400" />
                Upcoming Reviews
              </h2>
              <div className="overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Problem</th>
                      <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Difficulty</th>
                      <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Confidence</th>
                      <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-right">Review Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                    {upcoming.map((problem) => {
                      const confidence = problem.confidence ? REVIEW_CONFIDENCE_LABELS[problem.confidence] : null;
                      return (
                        <tr key={problem.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <Link href={problemHref(problem.id)} className="font-medium hover:text-purple-500 transition line-clamp-1">
                              {problem.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <DifficultyBadge difficulty={problem.difficulty} compact />
                          </td>
                          <td className="px-6 py-4">
                            {confidence ? <span className={cn("text-sm", confidence.color)}>{confidence.text}</span> : <span className="text-zinc-400">-</span>}
                          </td>
                          <td className="px-6 py-4 text-right text-zinc-500 whitespace-nowrap">
                            {problem.reviewDate ? formatReviewDate(problem.reviewDate) : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
