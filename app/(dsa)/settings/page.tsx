"use client";

import { useAppStore } from "@/store/useAppStore";
import { useEffect, useState } from "react";
import { Settings, Target, AlertTriangle, ArrowDownUp } from "lucide-react";

export default function SettingsPage() {
  const { dailyGoal, setDailyGoal, problemOrder, setProblemOrder } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-8 animate-pulse">Loading...</div>;

  return (
    <div className="py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
      <header className="mb-8 flex items-center gap-3">
        <Settings className="w-8 h-8 text-zinc-800 dark:text-zinc-200" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Settings</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage your daily targets and preferences.</p>
        </div>
      </header>

      <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold">Daily Goal</h2>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              How many problems do you want to solve each day? Be realistic. Consistency is more important than speed.
            </p>
            
            <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 5, 10].map((goal) => (
                <button
                  key={goal}
                  onClick={() => setDailyGoal(goal)}
                  className={`py-3 rounded-lg font-medium border-2 transition-all ${
                    dailyGoal === goal
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                      : "border-transparent bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
          <div className="p-5 bg-zinc-50 dark:bg-zinc-950 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              The algorithm will prioritize your spaced repetition review queue before giving you new problems to solve. Try to complete your reviews every day so you don't fall behind.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden mt-6">
          <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownUp className="w-5 h-5 text-purple-500" />
              <h2 className="text-xl font-semibold">Problem Order</h2>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Choose the order in which new pending problems are presented to you.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setProblemOrder("EasyFirst")}
                className={`py-3 rounded-lg font-medium border-2 transition-all ${
                  problemOrder === "EasyFirst"
                    ? "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400"
                    : "border-transparent bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                Easy to Hard
              </button>
              <button
                onClick={() => setProblemOrder("HardFirst")}
                className={`py-3 rounded-lg font-medium border-2 transition-all ${
                  problemOrder === "HardFirst"
                    ? "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400"
                    : "border-transparent bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                Hard to Easy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
