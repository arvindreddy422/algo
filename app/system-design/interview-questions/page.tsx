"use client";

import React, { useState, useMemo } from 'react';
import { systemDesignQuestions } from '../../../data/systemDesign/questions';
import { QuestionCard } from '../_components/QuestionCard';
import { HelpCircle, Search, Filter, Eye, EyeOff } from 'lucide-react';
import { useSystemDesignStore } from '../../../store/useSystemDesignStore';

export default function InterviewQuestionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [studyMode, setStudyMode] = useState(false);
  
  const { questionStatus } = useSystemDesignStore();

  const filteredQuestions = useMemo(() => {
    return systemDesignQuestions.filter(q => {
      const matchesSearch = 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.keyConcepts.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
        q.companies.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    });
  }, [searchQuery, difficultyFilter]);
  
  // Calculate stats
  const total = systemDesignQuestions.length;
  const readyOrMastered = systemDesignQuestions.filter(q => {
    const status = questionStatus[q.id];
    return status === 'ready' || status === 'mastered';
  }).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-indigo-500" />
              Interview Question Bank
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Practice real questions asked at top tech companies.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <span className="text-sm font-semibold text-zinc-500 block mb-1">Interview Readiness</span>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{readyOrMastered}</span>
                <span className="text-sm text-zinc-500 mb-1">/ {total} ready</span>
              </div>
            </div>
            
            <button
              onClick={() => setStudyMode(!studyMode)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                studyMode 
                  ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700" 
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              {studyMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              {studyMode ? "Study Mode Active" : "Enable Study Mode"}
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search questions, companies, or concepts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            />
          </div>
          
          <div className="relative min-w-[150px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none cursor-pointer transition-all"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Beginner</option>
              <option value="medium">Intermediate</option>
              <option value="hard">Advanced</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Question List */}
      <div className="space-y-4">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map(question => (
            <QuestionCard 
              key={question.id} 
              question={question} 
              studyModeActive={studyMode}
            />
          ))
        ) : (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl border-dashed">
            <p className="text-zinc-500 mb-4">No questions found matching your criteria.</p>
            <button 
              onClick={() => { setSearchQuery(""); setDifficultyFilter("all"); }}
              className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
