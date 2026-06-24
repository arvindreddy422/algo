"use client";

import { useSqlStore } from "@/store/useSqlStore";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, ExternalLink, Database } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PrerequisitesPage() {
  const { sqlPrerequisites, togglePrerequisiteStatus } = useSqlStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-8 animate-pulse">Loading...</div>;

  const completedCount = sqlPrerequisites.filter(p => p.completed).length;
  const totalCount = sqlPrerequisites.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Database className="w-6 h-6 text-blue-500" />
          <h1 className="text-3xl font-bold tracking-tight">SQL Prerequisites</h1>
        </div>
        <p className="text-zinc-500 dark:text-zinc-400">
          Review these core concepts before tackling advanced SQL problems. 
          Use the documentation links to study, then check them off as you master them.
        </p>
      </header>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 mb-8 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold text-sm text-zinc-600 dark:text-zinc-400">Mastery Progress</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">{progressPercent}%</span>
        </div>
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5">
          <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="mt-3 text-xs text-zinc-500 text-right">
          {completedCount} of {totalCount} concepts mastered
        </div>
      </div>

      <div className="space-y-4">
        {sqlPrerequisites.map((prereq) => (
          <div 
            key={prereq.id}
            className={cn(
              "border rounded-xl p-5 transition-all",
              prereq.completed 
                ? "bg-zinc-50 border-gray-200 dark:bg-zinc-900/50 dark:border-zinc-800 opacity-75"
                : "bg-white border-gray-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800"
            )}
          >
            <div className="flex items-start gap-4">
              <button 
                onClick={() => togglePrerequisiteStatus(prereq.id, !prereq.completed)}
                className="mt-1 flex-shrink-0 focus:outline-none transition-transform active:scale-95"
              >
                {prereq.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-blue-500" />
                ) : (
                  <Circle className="w-6 h-6 text-zinc-300 dark:text-zinc-600 hover:text-blue-400 transition-colors" />
                )}
              </button>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider">
                      {prereq.topic}
                    </div>
                    <h3 className={cn(
                      "text-lg font-semibold mb-2",
                      prereq.completed && "line-through text-zinc-500"
                    )}>
                      {prereq.title}
                    </h3>
                  </div>
                  {prereq.docUrl && (
                    <a 
                      href={prereq.docUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-zinc-600 dark:text-zinc-300 font-medium whitespace-nowrap"
                    >
                      Docs <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                  {prereq.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
