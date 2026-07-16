import React from 'react';
import { Topic } from '../../../data/systemDesign/types';
import { DifficultyBadge } from './DifficultyBadge';
import { Heart, ChevronRight } from 'lucide-react';
import { useSystemDesignStore } from '../../../store/useSystemDesignStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TopicCardProps {
  topic: Topic;
  compact?: boolean;
}

export function TopicCard({ topic, compact = false }: TopicCardProps) {
  const { favorites, toggleFavorite, topicsStatus } = useSystemDesignStore();
  const isFavorite = favorites.includes(topic.id);
  const status = topicsStatus[topic.id]?.status || 'not-started';

  return (
    <div className={cn(
      "group relative flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/50",
      status === 'mastered' && "border-green-200 dark:border-green-900/30"
    )}>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">{topic.emoji}</span>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {topic.name}
              </h3>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{topic.category}</p>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(topic.id);
            }}
            className={cn(
              "p-2 rounded-full transition-colors",
              isFavorite 
                ? "bg-red-50 dark:bg-red-500/10 text-red-500" 
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-red-500"
            )}
          >
            <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
          </button>
        </div>

        <div className="mb-4">
          <DifficultyBadge difficulty={topic.difficulty} />
          {status === 'mastered' && (
             <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 uppercase tracking-wider">
               Mastered
             </span>
          )}
        </div>

        {!compact && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4 flex-1">
            {topic.description}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex flex-wrap gap-2">
          {topic.keyConcepts.slice(0, 3).map((concept, idx) => (
            <span key={idx} className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-md text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
              {concept}
            </span>
          ))}
          {topic.keyConcepts.length > 3 && (
            <span className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-md text-[10px] font-medium text-zinc-500">
              +{topic.keyConcepts.length - 3} more
            </span>
          )}
        </div>
      </div>
      
      <Link 
        href={`/system-design/topics#${topic.id}`}
        className="block bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
      >
        <span>View {topic.resources.length} Resources</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
