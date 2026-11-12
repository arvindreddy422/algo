"use client";

import { useAppStore } from "@/store/useAppStore";
import { useEffect, useState } from "react";
import { BarChart, Flame, Target, Clock, CheckCircle } from "lucide-react";

export default function StatsPage() {
  const { problems, streak } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-8 animate-pulse">Loading...</div>;

  const total = problems.length;
  const solved = problems.filter((p) => p.status === "solved" || p.status === "review").length;
  const remaining = total - solved;
  
  const completionPercent = total ? Math.round((solved / total) * 100) : 0;

  const easyTotal = problems.filter(p => p.difficulty === 'Easy').length;
  const easySolved = problems.filter(p => (p.status === "solved" || p.status === "review") && p.difficulty === 'Easy').length;
  
  const medTotal = problems.filter(p => p.difficulty === 'Medium').length;
  const medSolved = problems.filter(p => (p.status === "solved" || p.status === "review") && p.difficulty === 'Medium').length;

  const hardTotal = problems.filter(p => p.difficulty === 'Hard').length;
  const hardSolved = problems.filter(p => (p.status === "solved" || p.status === "review") && p.difficulty === 'Hard').length;

  const solvedProblems = problems.filter(p => p.solveTime && p.solveTime > 0);
  const avgSolveTime = solvedProblems.length 
    ? Math.round(solvedProblems.reduce((acc, curr) => acc + (curr.solveTime || 0), 0) / solvedProblems.length) 
    : 0;

  return (
    <div className="py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Statistics</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Track your performance and learning consistency over time.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2 text-zinc-500">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <h3 className="font-medium text-sm">Total Solved</h3>
          </div>
          <div className="text-3xl font-bold">{solved} <span className="text-lg font-medium text-zinc-400">/ {total}</span></div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2 text-zinc-500">
            <Target className="w-5 h-5 text-blue-500" />
            <h3 className="font-medium text-sm">Remaining</h3>
          </div>
          <div className="text-3xl font-bold">{remaining} <span className="text-lg font-medium text-zinc-400">problems</span></div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2 text-zinc-500">
            <Flame className="w-5 h-5 text-orange-500" />
            <h3 className="font-medium text-sm">Best Streak</h3>
          </div>
          <div className="text-3xl font-bold">{streak} <span className="text-lg font-medium text-zinc-400">days</span></div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2 text-zinc-500">
            <Clock className="w-5 h-5 text-purple-500" />
            <h3 className="font-medium text-sm">Avg Solve Time</h3>
          </div>
          <div className="text-3xl font-bold">{Math.floor(avgSolveTime / 60)}m {avgSolveTime % 60}s</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2"><BarChart className="w-5 h-5" /> Difficulty Breakdown</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="text-green-600 dark:text-green-400 font-medium tracking-wide text-sm bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded">EASY</div>
                <div className="text-sm font-medium">{easySolved} / {easyTotal}</div>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${easyTotal ? (easySolved/easyTotal)*100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="text-yellow-600 dark:text-yellow-400 font-medium tracking-wide text-sm bg-yellow-50 dark:bg-yellow-500/10 px-2 py-0.5 rounded">MEDIUM</div>
                <div className="text-sm font-medium">{medSolved} / {medTotal}</div>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${medTotal ? (medSolved/medTotal)*100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="text-red-600 dark:text-red-400 font-medium tracking-wide text-sm bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded">HARD</div>
                <div className="text-sm font-medium">{hardSolved} / {hardTotal}</div>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${hardTotal ? (hardSolved/hardTotal)*100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-center items-center">
             <div className="relative w-48 h-48 flex items-center justify-center mb-4">
               {/* Extremely simple pseudo concentric progress circle for aesthetics */}
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="none" className="text-zinc-100 dark:text-zinc-800" />
                 <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="none" className="text-blue-500" strokeDasharray="552.92" strokeDashoffset={552.92 - (552.92 * completionPercent) / 100} strokeLinecap="round" />
               </svg>
               <div className="absolute flex flex-col items-center justify-center">
                 <span className="text-4xl font-bold">{completionPercent}%</span>
                 <span className="text-sm text-zinc-500">completed</span>
               </div>
             </div>
             <p className="text-center text-zinc-500 dark:text-zinc-400 max-w-sm mt-4">
               You are making great progress! Keep following your daily goals to master data structures and algorithms.
             </p>
        </div>
      </div>
    </div>
  );
}
