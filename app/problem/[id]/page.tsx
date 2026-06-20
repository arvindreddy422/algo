"use client";

import { useAppStore } from "@/store/useAppStore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStopwatch } from "@/hooks/useStopwatch";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { ExternalLink, Bookmark, Check, SkipForward, RefreshCw, Play, Pause, Save, MonitorPlay } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfidenceLevel, Problem } from "@/types";

export default function ProblemPage() {
  const { id } = useParams();
  const router = useRouter();
  const { problems, markSolved, bookmark, skip, needReview, updateNotes, getNextProblem } = useAppStore();
  const problem = problems.find(p => p.id === Number(id));
  
  const { seconds, isRunning, toggle, formatTime } = useStopwatch(true);
  const [notes, setNotes] = useState("");
  const [showConfidence, setShowConfidence] = useState(false);
  
  useEffect(() => {
    if (problem) {
      setNotes(problem.notes || "");
    }
  }, [problem?.id]);

  const goToNext = () => {
    const next = getNextProblem();
    if (next) {
      router.push(`/problem/${next.id}`);
    } else {
      router.push('/');
    }
  };

  const handleSolved = () => {
    setShowConfidence(true);
  };

  const submitSolved = (confidence: ConfidenceLevel) => {
    if (problem) {
      markSolved(problem.id, seconds, confidence, notes);
      goToNext();
    }
  };

  const handleBookmark = () => {
    if (problem) {
      bookmark(problem.id);
      goToNext();
    }
  };

  const handleReview = () => {
    if (problem) {
      needReview(problem.id);
      goToNext();
    }
  };

  const handleSkip = () => {
    if (problem) {
      skip(problem.id);
      goToNext();
    }
  };

  useKeyboardShortcuts({
    's': () => !showConfidence && handleSolved(),
    'b': () => !showConfidence && handleBookmark(),
    'r': () => !showConfidence && handleReview(),
    'k': () => !showConfidence && handleSkip(),
    'n': () => !showConfidence && goToNext(),
    '1': () => showConfidence && submitSolved(1),
    '2': () => showConfidence && submitSolved(2),
    '3': () => showConfidence && submitSolved(3),
    '4': () => showConfidence && submitSolved(4),
    '5': () => showConfidence && submitSolved(5),
  });

  if (!problem) return <div className="p-8">Problem not found.</div>;

  if (showConfidence) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] animate-in fade-in zoom-in duration-300">
        <h2 className="text-3xl font-bold mb-2">Problem Solved! 🎉</h2>
        <p className="text-zinc-500 mb-8 max-w-md text-center">
          How confident were you with the solution? This helps us schedule your next review using spaced repetition.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 w-full max-w-3xl">
          {[
            { level: 1 as ConfidenceLevel, label: "No Idea", desc: "Review tomorrow", color: "text-red-500" },
            { level: 2 as ConfidenceLevel, label: "Struggled", desc: "Review in 3 days", color: "text-orange-500" },
            { level: 3 as ConfidenceLevel, label: "Needed Hint", desc: "Review in 7 days", color: "text-yellow-500" },
            { level: 4 as ConfidenceLevel, label: "Good", desc: "Review in 14 days", color: "text-lime-500" },
            { level: 5 as ConfidenceLevel, label: "Mastered", desc: "Review in 30 days", color: "text-emerald-500" },
          ].map((c) => (
            <button
              key={c.level}
              onClick={() => submitSolved(c.level)}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col items-center text-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
            >
              <div className={cn("text-4xl font-black mb-2 opacity-50 group-hover:opacity-100", c.color)}>
                {c.level}
              </div>
              <div className="font-semibold text-sm mb-1">{c.label}</div>
              <div className="text-xs text-zinc-500">{c.desc}</div>
              <div className="text-[10px] text-zinc-400 mt-2 border border-zinc-200 dark:border-zinc-800 rounded px-1.5 py-0.5">Press {c.level}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className={cn(
              "text-xs px-2.5 py-0.5 rounded-full font-medium border",
              problem.difficulty === 'Easy' ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20" :
              problem.difficulty === 'Medium' ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20" :
              "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
            )}>
              {problem.difficulty}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">{problem.title}</h1>
          <div className="flex flex-wrap gap-2">
            {problem.topics.map(topic => (
              <span key={topic} className="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md">{topic}</span>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-3 flex items-center justify-between min-w-[200px]">
          <div className="text-2xl font-mono tracking-wider font-semibold">
            {formatTime()}
          </div>
          <button 
            onClick={toggle}
            className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
          >
            {isRunning ? <Pause className="w-5 h-5 text-red-500" /> : <Play className="w-5 h-5 text-emerald-500" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          {/* Notes Area */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between pb-2">
              <h3 className="font-semibold">Personal Notes</h3>
              <button 
                onClick={() => updateNotes(problem.id, notes)}
                className="text-xs flex items-center gap-1 text-zinc-500 hover:text-blue-500 transition-colors"
                title="Save Notes (autosaves on completion)"
              >
                <Save className="w-3.5 h-3.5" /> Save
              </button>
            </div>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record your mistakes, optimal solutions, time/space complexity here... (Markdown supported mentally)"
              className="w-full flex-1 p-4 bg-transparent resize-none focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Actions</h3>
            
            <button onClick={handleSolved} className="w-full flex items-center justify-between p-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition group">
              <span className="flex items-center gap-2 font-medium"><Check className="w-4 h-4" /> Solved</span>
              <span className="text-xs bg-emerald-200/50 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded text-emerald-800 dark:text-emerald-300 opacity-0 group-hover:opacity-100 transition">S</span>
            </button>
            
            <button onClick={handleBookmark} className="w-full flex items-center justify-between p-3 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition group">
              <span className="flex items-center gap-2 font-medium"><Bookmark className="w-4 h-4" /> Bookmark</span>
              <span className="text-xs bg-blue-200/50 dark:bg-blue-900/50 px-1.5 py-0.5 rounded text-blue-800 dark:text-blue-300 opacity-0 group-hover:opacity-100 transition">B</span>
            </button>

            <button onClick={handleReview} className="w-full flex items-center justify-between p-3 bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-500/20 transition group">
              <span className="flex items-center gap-2 font-medium"><RefreshCw className="w-4 h-4" /> Need Review</span>
              <span className="text-xs bg-purple-200/50 dark:bg-purple-900/50 px-1.5 py-0.5 rounded text-purple-800 dark:text-purple-300 opacity-0 group-hover:opacity-100 transition">R</span>
            </button>

            <button onClick={handleSkip} className="w-full flex items-center justify-between p-3 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition group">
              <span className="flex items-center gap-2 font-medium"><SkipForward className="w-4 h-4" /> Skip</span>
              <span className="text-xs bg-zinc-300/50 dark:bg-zinc-700/50 px-1.5 py-0.5 rounded text-zinc-800 dark:text-zinc-400 opacity-0 group-hover:opacity-100 transition">K</span>
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl flex flex-col overflow-hidden">
            <a 
              href={problem.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition border-b border-gray-200 dark:border-zinc-800 group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-[#FFA116]/10 p-2 rounded-md">
                  <ExternalLink className="w-4 h-4 text-[#FFA116]" />
                </div>
                <span className="font-medium">Open in LeetCode</span>
              </div>
            </a>
            <a 
              href={`https://www.youtube.com/results?search_query=leetcode+${problem.id}+${encodeURIComponent(problem.title)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-500/10 p-2 rounded-md">
                  <MonitorPlay className="w-4 h-4 text-red-500" />
                </div>
                <span className="font-medium">Search YouTube</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
