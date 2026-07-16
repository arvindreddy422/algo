import React from 'react';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  id: string;
  title: string;
  icon: string;
  description: string;
  isUnlocked: boolean;
  progress?: number;
  total?: number;
}

export function AchievementBadge({ title, icon, description, isUnlocked, progress, total }: AchievementBadgeProps) {
  return (
    <div className={cn(
      "flex flex-col items-center p-4 rounded-xl border text-center transition-all",
      isUnlocked 
        ? "bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/20 dark:to-zinc-900 border-amber-200 dark:border-amber-700/50 shadow-sm" 
        : "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 opacity-60 grayscale"
    )}>
      <div className={cn(
        "text-4xl mb-3",
        isUnlocked && "drop-shadow-md"
      )}>
        {icon}
      </div>
      <h4 className={cn(
        "font-bold text-sm mb-1",
        isUnlocked ? "text-amber-900 dark:text-amber-400" : "text-zinc-600 dark:text-zinc-400"
      )}>
        {title}
      </h4>
      <p className="text-xs text-zinc-500 dark:text-zinc-500 max-w-[150px] leading-tight mb-3">
        {description}
      </p>
      
      {!isUnlocked && progress !== undefined && total !== undefined && (
        <div className="w-full mt-auto">
          <div className="flex justify-between text-[10px] font-medium text-zinc-500 mb-1">
            <span>{progress} / {total}</span>
            <span>{Math.round((progress / total) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-400 dark:bg-amber-500 rounded-full" 
              style={{ width: `${(progress / total) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
