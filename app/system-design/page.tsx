"use client";

import React, { useEffect, useState } from 'react';
import { useSystemDesignStore } from '../../store/useSystemDesignStore';
import { systemDesignTopics } from '../../data/systemDesign/topics';
import { Flame, CheckCircle, ChevronRight, Award } from 'lucide-react';
import { ResourceCard } from './_components/ResourceCard';
import { DifficultyBadge } from './_components/DifficultyBadge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function DailyChallengePage() {
  const { getDailyChallengeTopic, topicsStatus, markTopicStudied, toggleFavorite, favorites, streakDays } = useSystemDesignStore();
  const [topicId, setTopicId] = useState<string | null>(null);
  
  useEffect(() => {
    setTopicId(getDailyChallengeTopic());
  }, [getDailyChallengeTopic]);

  if (!topicId) return null;

  const topic = systemDesignTopics.find(t => t.id === topicId)!;
  const status = topicsStatus[topicId]?.status || 'not-started';
  const isStudied = status === 'mastered';
  const isFavorite = favorites.includes(topicId);

  return (
    <div className="space-y-6">
      {/* Streak Card */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-20 transform rotate-12">
          <Flame className="w-48 h-48" />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-white/90 font-medium mb-1">
              <Flame className="w-5 h-5 fill-current" />
              Your Streak
            </div>
            <div className="text-5xl font-bold tracking-tight mb-2">
              {streakDays} <span className="text-2xl font-semibold opacity-80">days</span>
            </div>
            <p className="text-white/80 max-w-md">
              {streakDays > 0 
                ? "You're on fire! Complete today's challenge to keep it going." 
                : "Start your streak today by completing the daily challenge."}
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 min-w-[200px]">
            <div className="text-sm text-white/80 font-medium mb-1">Next milestone</div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <div className="font-bold">Fire Badge</div>
                <div className="text-xs text-white/70">at 7 days</div>
              </div>
            </div>
            <div className="w-full bg-white/20 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${Math.min(100, (streakDays / 7) * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Challenge Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 sm:p-8 border-b border-zinc-100 dark:border-zinc-800/50">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
              Today's Topic
            </span>
            <DifficultyBadge difficulty={topic.difficulty} />
          </div>
          
          <div className="flex items-start gap-4 mb-4">
            <span className="text-4xl hidden sm:block">{topic.emoji}</span>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{topic.name}</h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
                {topic.description}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {topic.keyConcepts.map((concept, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {concept}
              </span>
            ))}
          </div>
        </div>
        
        <div className="p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-900/50">
          <h3 className="text-lg font-bold mb-4 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Curated Resources
            <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">({topic.resources.length})</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topic.resources.slice(0, 3).map(res => (
              <ResourceCard key={res.id} resource={res} />
            ))}
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => markTopicStudied(topicId, 30)}
              disabled={isStudied}
              className={cn(
                "w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
                isStudied
                  ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 cursor-default"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              )}
            >
              <CheckCircle className={cn("w-5 h-5", isStudied && "fill-current")} />
              {isStudied ? "Marked as Studied" : "Mark as Studied"}
            </button>
            
            <button
              onClick={() => toggleFavorite(topicId)}
              className={cn(
                "w-full sm:w-auto px-6 py-3 rounded-xl font-medium border transition-colors",
                isFavorite
                  ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900/30 dark:bg-red-500/10 dark:text-red-400"
                  : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              )}
            >
              {isFavorite ? "★ Saved to Favorites" : "☆ Save to Favorites"}
            </button>
            
            <Link 
              href="/system-design/topics"
              className="w-full sm:w-auto ml-auto px-4 py-3 rounded-xl font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center justify-center gap-1"
            >
              Browse All Topics <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
