import React from 'react';
import { Difficulty } from '../../../data/systemDesign/types';
import { cn } from '@/lib/utils';

interface DifficultyBadgeProps {
  difficulty: Difficulty | 'easy' | 'medium' | 'hard';
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  let stars = '';
  let label = '';
  let colorClass = '';

  if (difficulty === 1 || difficulty === 'easy') {
    stars = '⭐';
    label = 'Beginner';
    colorClass = 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30';
  } else if (difficulty === 2 || difficulty === 'medium') {
    stars = '⭐⭐';
    label = 'Intermediate';
    colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30';
  } else {
    stars = '⭐⭐⭐';
    label = 'Advanced';
    colorClass = 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30';
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border', colorClass)}>
      <span>{stars}</span>
      <span>{label}</span>
    </span>
  );
}
