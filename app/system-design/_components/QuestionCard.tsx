import React, { useState } from 'react';
import { InterviewQuestion } from '../../../data/systemDesign/types';
import { DifficultyBadge } from './DifficultyBadge';
import { ChevronDown, ChevronUp, Clock, Building2, Lightbulb, Link as LinkIcon } from 'lucide-react';
import { useSystemDesignStore } from '../../../store/useSystemDesignStore';
import { cn } from '@/lib/utils';
import { ResourceCard } from './ResourceCard';

interface QuestionCardProps {
  question: InterviewQuestion;
  studyModeActive: boolean;
}

export function QuestionCard({ question, studyModeActive }: QuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { questionStatus, setQuestionStatus } = useSystemDesignStore();
  
  const status = questionStatus[question.id] || 'not-ready';
  
  // If study mode is active, override expanded state initially
  const showContent = isExpanded || !studyModeActive;

  return (
    <div className={cn(
      "bg-white dark:bg-zinc-900 border rounded-2xl overflow-hidden transition-all",
      isExpanded ? "border-indigo-300 dark:border-indigo-800 shadow-md" : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
    )}>
      {/* Header (Always visible) */}
      <div 
        className="p-5 cursor-pointer flex gap-4 items-start select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <DifficultyBadge difficulty={question.difficulty} />
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <Clock className="w-3 h-3" /> {question.estimatedTime}m
            </div>
            
            <div className="ml-auto">
              <select 
                value={status}
                onChange={(e) => {
                  e.stopPropagation();
                  setQuestionStatus(question.id, e.target.value as any);
                }}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "text-xs font-bold px-3 py-1 rounded-full outline-none appearance-none cursor-pointer",
                  status === 'not-ready' && "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
                  status === 'learning' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                  status === 'ready' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                  status === 'mastered' && "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                )}
              >
                <option value="not-ready">🔴 Not Ready</option>
                <option value="learning">🟡 Learning</option>
                <option value="ready">🟢 Ready</option>
                <option value="mastered">✅ Mastered</option>
              </select>
            </div>
          </div>
          
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 pr-8">
            {question.question}
          </h3>
          
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {question.companies.join(', ')}
            </span>
          </div>
        </div>
        
        <div className="p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-full text-zinc-400 flex-shrink-0 mt-8">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>
      
      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-5 animate-in fade-in slide-in-from-top-2">
          {studyModeActive && !showContent ? (
            <div className="text-center py-8">
              <p className="text-zinc-500 mb-4 font-medium">Study Mode is Active</p>
              <button 
                onClick={() => setIsExpanded(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
              >
                Reveal Answer Guide
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-500" /> Interview Tips
                </h4>
                <ul className="space-y-2">
                  {question.interviewTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="text-indigo-500 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 uppercase tracking-wider text-zinc-500">Key Concepts</h4>
                <div className="flex flex-wrap gap-2">
                  {question.keyConcepts.map((concept, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
              
              {question.resources.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                    <LinkIcon className="w-4 h-4 text-blue-500" /> Curated Resources
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {question.resources.map(res => (
                      <ResourceCard key={res.id} resource={res} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
