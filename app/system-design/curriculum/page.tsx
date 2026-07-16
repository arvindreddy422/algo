"use client";

import React, { useState } from 'react';
import { systemDesignCurriculum } from '../../../data/systemDesign/curriculum';
import { systemDesignTopics } from '../../../data/systemDesign/topics';
import { useSystemDesignStore } from '../../../store/useSystemDesignStore';
import { ChevronDown, ChevronUp, CheckCircle, Circle, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function CurriculumPage() {
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({
    'week-1': true // Expand first week by default
  });
  
  const { topicsStatus } = useSystemDesignStore();
  
  const toggleWeek = (weekId: string) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekId]: !prev[weekId]
    }));
  };
  
  // Calculate overall progress
  const totalTopicsInCurriculum = systemDesignCurriculum.reduce((acc, week) => acc + week.topics.length, 0);
  const completedTopics = systemDesignCurriculum.reduce((acc, week) => {
    return acc + week.topics.filter(t => topicsStatus[t]?.status === 'mastered').length;
  }, 0);
  
  const overallProgress = totalTopicsInCurriculum > 0 ? Math.round((completedTopics / totalTopicsInCurriculum) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header & Progress */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">4-Week Mastery Curriculum</h2>
            <p className="text-zinc-500 dark:text-zinc-400">A structured path from foundations to interview readiness.</p>
          </div>
          
          <div className="w-full md:w-64 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Overall Progress</span>
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{overallProgress}%</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-zinc-500 text-right">
              {completedTopics} / {totalTopicsInCurriculum} topics completed
            </div>
          </div>
        </div>
      </div>
      
      {/* Timeline */}
      <div className="space-y-4">
        {systemDesignCurriculum.map((week, index) => {
          const isExpanded = !!expandedWeeks[week.id];
          const weekTopics = week.topics.map(tId => systemDesignTopics.find(t => t.id === tId)).filter(Boolean) as typeof systemDesignTopics;
          const weekCompleted = weekTopics.filter(t => topicsStatus[t.id]?.status === 'mastered').length;
          const weekProgress = weekTopics.length > 0 ? Math.round((weekCompleted / weekTopics.length) * 100) : 0;
          
          return (
            <div key={week.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all shadow-sm">
              <button 
                onClick={() => toggleWeek(week.id)}
                className="w-full text-left p-5 sm:p-6 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
              >
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="hidden sm:flex flex-col items-center justify-center w-14 h-14 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-xl font-bold text-lg">
                    W{index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="sm:hidden font-bold text-indigo-600 dark:text-indigo-400">Week {index + 1}:</span>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{week.focusArea}</h3>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{week.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="hidden md:block w-32">
                    <div className="flex justify-between text-xs font-medium text-zinc-500 mb-1.5">
                      <span>{weekCompleted}/{weekTopics.length}</span>
                      <span>{weekProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${weekProgress}%` }} />
                    </div>
                  </div>
                  <div className="text-zinc-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </button>
              
              {isExpanded && (
                <div className="p-2 sm:p-4 border-t border-zinc-200 dark:border-zinc-800">
                  {weekTopics.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">
                      <p>This week is dedicated to mock interviews and practice.</p>
                      <Link href="/system-design/interview-questions" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline mt-2 inline-block">
                        Go to Interview Questions →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {weekTopics.map(topic => {
                        const status = topicsStatus[topic.id]?.status || 'not-started';
                        const isMastered = status === 'mastered';
                        const isLearning = status === 'in-progress';
                        
                        return (
                          <Link 
                            key={topic.id}
                            href={`/system-design/topics#${topic.id}`}
                            className="flex items-center justify-between p-3 sm:p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              {isMastered ? (
                                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                              ) : isLearning ? (
                                <PlayCircle className="w-5 h-5 text-blue-500 shrink-0" />
                              ) : (
                                <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600 shrink-0" />
                              )}
                              
                              <div>
                                <div className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {topic.name}
                                </div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-500 hidden sm:block mt-0.5">
                                  {topic.category}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="hidden sm:flex gap-1.5">
                                {topic.resources.slice(0, 3).map((res, i) => (
                                  <span key={i} className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px]" title={res.type}>
                                    {res.type === 'video' ? '🎥' : res.type === 'paper' ? '📄' : '📰'}
                                  </span>
                                ))}
                              </div>
                              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                {topic.resources.length} resources
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
