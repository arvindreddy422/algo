"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import type { Difficulty, ProblemStatus } from "@/types";
import { DifficultyBadge } from "@/features/study/components/DifficultyBadge";
import { useMounted } from "@/features/study/components/BookmarkList";

type CompletedItem = {
  id: number;
  title: string;
  difficulty: Difficulty;
  status: ProblemStatus;
  solveTime?: number;
  confidence?: number;
  solvedAt?: string;
  source?: string;
};

type CompletedListProps = {
  items: CompletedItem[];
  title: string;
  description: string;
  emptyTitle: string;
  emptyBody: string;
  emptyAction: string;
  homeHref: string;
  problemHref: (id: number) => string;
};

export function CompletedList({
  items,
  title,
  description,
  emptyTitle,
  emptyBody,
  emptyAction,
  homeHref,
  problemHref,
}: CompletedListProps) {
  const mounted = useMounted();
  if (!mounted) return <div className="p-8 animate-pulse">Loading...</div>;

  const completed = items
    .filter((item) => item.status === "solved" || item.status === "review")
    .sort((a, b) => new Date(b.solvedAt || 0).getTime() - new Date(a.solvedAt || 0).getTime());
  const showSource = completed.some((item) => item.source);

  return (
    <div className="py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">{title}</h1>
          <p className="text-zinc-500 dark:text-zinc-400">{description}</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {completed.length} Solved
        </div>
      </header>

      {completed.length === 0 ? (
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
        <div className="overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Problem</th>
                <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Difficulty</th>
                {showSource && <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Source</th>}
                <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Time Spent</th>
                <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Confidence</th>
                <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-right">Solved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
              {completed.map((problem) => (
                <tr key={problem.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={problemHref(problem.id)} className="font-medium hover:text-blue-500 transition line-clamp-1">
                      {problem.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <DifficultyBadge difficulty={problem.difficulty} compact />
                  </td>
                  {showSource && (
                    <td className="px-6 py-4">
                      {problem.source ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 uppercase tracking-wider">
                          {problem.source}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 text-zinc-500">
                    {problem.solveTime ? `${Math.floor(problem.solveTime / 60)}m ${problem.solveTime % 60}s` : "-"}
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{problem.confidence ? `${problem.confidence}/5` : "-"}</td>
                  <td className="px-6 py-4 text-right text-zinc-500 whitespace-nowrap">
                    {problem.solvedAt ? formatDistanceToNow(new Date(problem.solvedAt), { addSuffix: true }) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
