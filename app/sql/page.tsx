"use client";

import { useSqlStore } from "@/store/useSqlStore";
import { useAppStore } from "@/store/useAppStore";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Play, Database, BookOpen, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SqlDashboard() {
  const { sqlProblems, getNextSqlProblem } = useSqlStore();
  const { problemOrder } = useAppStore(); // Reusing the same problemOrder setting or could create a separate one
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-8 animate-pulse">Loading...</div>;

  const solved = sqlProblems.filter(p => p.status === 'solved').length;
  const total = sqlProblems.length;
  const progressPercent = Math.round((solved / total) * 100) || 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const solvedToday = sqlProblems.filter(p => p.solvedAt && new Date(p.solvedAt) >= today).length;
  const reviewDueCount = sqlProblems.filter(p => p.status === 'solved' && p.reviewDate && new Date(p.reviewDate) <= new Date()).length;

  const nextProblem = getNextSqlProblem(problemOrder);

  return (
    <div className="py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out flex flex-col h-full">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">SQL Practice</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Master PostgreSQL for technical interviews.</p>
        </div>
        <Link 
          href="/sql/prerequisites"
          className="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
        >
          View Prerequisites
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress Card */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-emerald-500">
            <Database className="w-5 h-5" />
            <h3 className="font-medium text-sm text-zinc-600 dark:text-zinc-400">SQL Progress</h3>
          </div>
          <div className="text-3xl font-bold">{progressPercent}% <span className="text-lg font-medium text-zinc-500 dark:text-zinc-400">({solved}/{total})</span></div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 mt-3">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Solved Today Card */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-blue-500">
            <CheckCircle className="w-5 h-5" />
            <h3 className="font-medium text-sm text-zinc-600 dark:text-zinc-400">Solved Today</h3>
          </div>
          <div className="text-3xl font-bold">{solvedToday}</div>
        </div>

        {/* Review Queue Card */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-purple-500">
            <Clock className="w-5 h-5" />
            <h3 className="font-medium text-sm text-zinc-600 dark:text-zinc-400">Review Due</h3>
          </div>
          <div className="text-3xl font-bold">{reviewDueCount} <span className="text-lg font-medium text-zinc-500 dark:text-zinc-400">pending</span></div>
        </div>
      </div>

      <div className="flex-1 mt-8">
        <h2 className="text-xl font-semibold mb-4">Up Next in SQL</h2>
        {nextProblem ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={cn(
                  "text-xs px-2.5 py-0.5 rounded-full font-medium border",
                  nextProblem.difficulty === 'Easy' ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20" :
                  nextProblem.difficulty === 'Medium' ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20" :
                  "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                )}>
                  {nextProblem.difficulty}
                </span>
                <span className="text-xs px-2.5 py-0.5 border border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 rounded-full font-medium">
                  {nextProblem.source}
                </span>
                {nextProblem.status === 'review' && (
                  <span className="text-xs px-2.5 py-0.5 border border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20 rounded-full font-medium">Review</span>
                )}
                {nextProblem.reviewDate && new Date(nextProblem.reviewDate) <= new Date() && nextProblem.status === 'solved' && (
                   <span className="text-xs px-2.5 py-0.5 border border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 rounded-full font-medium">Spaced Repetition Due</span>
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2">{nextProblem.title}</h3>
              <div className="flex flex-wrap gap-2">
                {nextProblem.topics.slice(0, 3).map(topic => (
                  <span key={topic} className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">{topic}</span>
                ))}
              </div>
            </div>
            
            <Link 
              href={`/sql/problem/${nextProblem.id}`}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 hover:bg-blue-700 transition-colors whitespace-nowrap shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              Solve SQL
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
              You have solved all pending SQL problems and have no reviews due.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
