"use client";

import { useSqlStore } from "@/store/useSqlStore";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SqlCompletedPage() {
  const { sqlProblems } = useSqlStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-8 animate-pulse">Loading...</div>;

  const completed = sqlProblems
    .filter((p) => p.status === "solved" || p.status === "review")
    .sort((a, b) => new Date(b.solvedAt || 0).getTime() - new Date(a.solvedAt || 0).getTime());

  return (
    <div className="py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Completed SQL</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Everything you've successfully solved.</p>
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
          <h3 className="font-semibold text-lg mb-1">No completed SQL problems yet</h3>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">Head to the dashboard to start solving some SQL problems.</p>
          <Link href="/sql" className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-6 py-2.5 rounded-lg font-medium transition hover:scale-[1.02]">
            Start Solving
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Problem</th>
                <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Difficulty</th>
                <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Source</th>
                <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Time Spent</th>
                <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Confidence</th>
                <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-right">Solved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
              {completed.map((problem) => (
                <tr key={problem.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/sql/problem/${problem.id}`} className="font-medium hover:text-blue-500 transition line-clamp-1">
                      {problem.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-medium border uppercase tracking-wider",
                      problem.difficulty === 'Easy' ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20" :
                      problem.difficulty === 'Medium' ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20" :
                      "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                    )}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 uppercase tracking-wider">
                      {problem.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
                    {problem.solveTime ? `${Math.floor(problem.solveTime / 60)}m ${problem.solveTime % 60}s` : '-'}
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
                    {problem.confidence ? `${problem.confidence}/5` : '-'}
                  </td>
                  <td className="px-6 py-4 text-right text-zinc-500 whitespace-nowrap">
                    {problem.solvedAt ? formatDistanceToNow(new Date(problem.solvedAt), { addSuffix: true }) : '-'}
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
