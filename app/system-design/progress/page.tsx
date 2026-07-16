"use client";

import React, { useEffect, useState } from 'react';
import { useSystemDesignStore } from '../../../store/useSystemDesignStore';
import { systemDesignTopics } from '../../../data/systemDesign/topics';
import { systemDesignQuestions } from '../../../data/systemDesign/questions';
import { TrendingUp, Flame, BookOpen, Clock, Target, Calendar } from 'lucide-react';
import { AchievementBadge } from '../_components/AchievementBadge';
import { cn } from '@/lib/utils';

export default function ProgressDashboard() {
  const [mounted, setMounted] = useState(false);
  const { streakDays, totalStudyMinutes, topicsStatus, questionStatus, readBlogPosts, weeklyStudyLog } = useSystemDesignStore();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Calculate stats
  const totalTopics = systemDesignTopics.length;
  const topicsLearned = Object.values(topicsStatus).filter(t => t.status === 'mastered').length;
  const topicProgress = Math.round((topicsLearned / totalTopics) * 100) || 0;
  
  const totalQuestions = systemDesignQuestions.length;
  const questionsReady = Object.values(questionStatus).filter(s => s === 'ready' || s === 'mastered').length;
  
  const hours = Math.floor(totalStudyMinutes / 60);
  const minutes = totalStudyMinutes % 60;
  
  // Category progress
  const categoryStats = systemDesignTopics.reduce((acc, topic) => {
    if (!acc[topic.category]) {
      acc[topic.category] = { total: 0, completed: 0 };
    }
    acc[topic.category].total++;
    if (topicsStatus[topic.id]?.status === 'mastered') {
      acc[topic.category].completed++;
    }
    return acc;
  }, {} as Record<string, { total: number, completed: number }>);
  
  // Last 7 days chart data
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      date: dateStr,
      day: dayName,
      minutes: weeklyStudyLog[dateStr] || 0
    };
  });
  
  const maxMins = Math.max(...last7Days.map(d => d.minutes), 60); // min 60 to give scale

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 text-white shadow-sm">
          <div className="flex items-center gap-2 text-white/80 font-medium mb-2 text-sm">
            <Flame className="w-4 h-4 fill-current" /> Current Streak
          </div>
          <div className="text-3xl font-bold">{streakDays} <span className="text-lg font-medium opacity-80">days</span></div>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-500 font-medium mb-2 text-sm">
            <BookOpen className="w-4 h-4" /> Topics Learned
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{topicsLearned} <span className="text-lg font-medium text-zinc-500">/ {totalTopics}</span></div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 mt-3">
            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${topicProgress}%` }} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-green-500 font-medium mb-2 text-sm">
            <Target className="w-4 h-4" /> Questions Ready
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{questionsReady} <span className="text-lg font-medium text-zinc-500">/ {totalQuestions}</span></div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 mt-3">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.round((questionsReady/totalQuestions)*100) || 0}%` }} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-blue-500 font-medium mb-2 text-sm">
            <Clock className="w-4 h-4" /> Total Study Time
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {hours}<span className="text-lg font-medium text-zinc-500 mr-1">h</span>
            {minutes}<span className="text-lg font-medium text-zinc-500">m</span>
          </div>
          <p className="text-xs text-zinc-500 mt-3">Across {readBlogPosts.length} blogs & {topicsLearned} topics</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart (CSS Bar Chart) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <Calendar className="w-5 h-5 text-indigo-500" /> Weekly Activity
          </h3>
          
          <div className="h-48 flex items-end justify-between gap-2 pb-6 border-b border-zinc-100 dark:border-zinc-800/50">
            {last7Days.map((day, i) => (
              <div key={i} className="flex flex-col items-center flex-1 group">
                <div className="w-full relative flex items-end justify-center h-40">
                  {/* Tooltip */}
                  <div className="absolute -top-8 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {day.minutes} mins
                  </div>
                  {/* Bar */}
                  <div 
                    className={cn(
                      "w-4/5 sm:w-1/2 rounded-t-sm transition-all duration-500 hover:opacity-80",
                      day.minutes > 0 ? "bg-indigo-500 dark:bg-indigo-400" : "bg-zinc-100 dark:bg-zinc-800/50"
                    )}
                    style={{ height: `${Math.max((day.minutes / maxMins) * 100, day.minutes > 0 ? 5 : 2)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-zinc-500 mt-2">{day.day}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between items-center text-sm">
            <span className="text-zinc-500">Last 7 Days</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {last7Days.reduce((a, b) => a + b.minutes, 0)} mins total
            </span>
          </div>
        </div>
        
        {/* Category Mastery */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <TrendingUp className="w-5 h-5 text-indigo-500" /> Category Mastery
          </h3>
          
          <div className="space-y-4">
            {Object.entries(categoryStats).map(([category, stats]) => {
              const pct = Math.round((stats.completed / stats.total) * 100) || 0;
              return (
                <div key={category}>
                  <div className="flex justify-between text-sm font-medium mb-1.5">
                    <span className="text-zinc-700 dark:text-zinc-300">{category}</span>
                    <span className="text-zinc-500">{pct}% ({stats.completed}/{stats.total})</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        pct === 100 ? "bg-green-500" : "bg-indigo-500"
                      )}
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Achievements */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-6 text-zinc-900 dark:text-zinc-100">Achievements</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AchievementBadge 
            id="streak-7" title="Fire Starter" icon="🔥" 
            description="Study for 7 consecutive days" 
            isUnlocked={streakDays >= 7} progress={streakDays} total={7} 
          />
          <AchievementBadge 
            id="streak-30" title="Unstoppable" icon="🏆" 
            description="Study for 30 consecutive days" 
            isUnlocked={streakDays >= 30} progress={streakDays} total={30} 
          />
          <AchievementBadge 
            id="topics-10" title="Architect" icon="🏗️" 
            description="Master 10 system design topics" 
            isUnlocked={topicsLearned >= 10} progress={topicsLearned} total={10} 
          />
          <AchievementBadge 
            id="blogs-20" title="Avid Reader" icon="📚" 
            description="Read 20 engineering blog posts" 
            isUnlocked={readBlogPosts.length >= 20} progress={readBlogPosts.length} total={20} 
          />
        </div>
      </div>
    </div>
  );
}
