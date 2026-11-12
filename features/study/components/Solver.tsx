"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Bookmark, Check, SkipForward, RefreshCw, Play, Pause, Save, MonitorPlay } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStopwatch } from "@/hooks/useStopwatch";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type { ConfidenceLevel, Problem } from "@/types";
import { SOLVER_CONFIDENCE } from "@/features/study/schedule";
import { DifficultyBadge } from "@/features/study/components/DifficultyBadge";

type SolverProblem = Problem & { source?: string };

type SolverProps = {
  problem: SolverProblem | null;
  homeHref: string;
  problemHref: (id: number) => string;
  notesTitle: string;
  notesPlaceholder: string;
  solvedHeading: string;
  externalLabel: string;
  youtubeHref: string;
  markSolved: (id: number, timeSpent: number, confidence: ConfidenceLevel, notes?: string) => Promise<void>;
  bookmark: (id: number) => Promise<void>;
  skip: (id: number) => Promise<void>;
  needReview: (id: number) => Promise<void>;
  updateNotes: (id: number, notes: string) => Promise<void>;
  getNext: () => SolverProblem | null;
};

export function Solver({
  problem,
  homeHref,
  problemHref,
  notesTitle,
  notesPlaceholder,
  solvedHeading,
  externalLabel,
  youtubeHref,
  markSolved,
  bookmark,
  skip,
  needReview,
  updateNotes,
  getNext,
}: SolverProps) {
  const router = useRouter();
  const { seconds, isRunning, toggle, formatTime } = useStopwatch(true);
  const [notes, setNotes] = useState("");
  const [showConfidence, setShowConfidence] = useState(false);

  useEffect(() => {
    if (problem) setNotes(problem.notes || "");
    // Reset notes only when the open problem changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem?.id]);

  const goToNext = () => {
    const next = getNext();
    router.push(next ? problemHref(next.id) : homeHref);
  };

  const submitSolved = (confidence: ConfidenceLevel) => {
    if (!problem) return;
    markSolved(problem.id, seconds, confidence, notes);
    goToNext();
  };

  useKeyboardShortcuts({
    s: () => !showConfidence && setShowConfidence(true),
    b: () => {
      if (!showConfidence && problem) {
        bookmark(problem.id);
        goToNext();
      }
    },
    r: () => {
      if (!showConfidence && problem) {
        needReview(problem.id);
        goToNext();
      }
    },
    k: () => {
      if (!showConfidence && problem) {
        skip(problem.id);
        goToNext();
      }
    },
    n: () => !showConfidence && goToNext(),
    "1": () => showConfidence && submitSolved(1),
    "2": () => showConfidence && submitSolved(2),
    "3": () => showConfidence && submitSolved(3),
    "4": () => showConfidence && submitSolved(4),
    "5": () => showConfidence && submitSolved(5),
  });

  if (!problem) return <div className="p-8">Problem not found.</div>;

  if (showConfidence) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] animate-in fade-in zoom-in duration-300">
        <h2 className="text-3xl font-bold mb-2">{solvedHeading}</h2>
        <p className="text-zinc-500 mb-8 max-w-md text-center">
          How confident were you with the solution? This helps us schedule your next review using spaced repetition.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 w-full max-w-3xl">
          {SOLVER_CONFIDENCE.map((choice) => (
            <button
              key={choice.level}
              onClick={() => submitSolved(choice.level)}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col items-center text-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
            >
              <div className={cn("text-4xl font-black mb-2 opacity-50 group-hover:opacity-100", choice.color)}>
                {choice.level}
              </div>
              <div className="font-semibold text-sm mb-1">{choice.label}</div>
              <div className="text-xs text-zinc-500">{choice.desc}</div>
              <div className="text-[10px] text-zinc-400 mt-2 border border-zinc-200 dark:border-zinc-800 rounded px-1.5 py-0.5">
                Press {choice.level}
              </div>
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
            <DifficultyBadge difficulty={problem.difficulty} />
            {problem.source && (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium border border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
                {problem.source}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">{problem.title}</h1>
          <div className="flex flex-wrap gap-2">
            {problem.topics.map((topic) => (
              <span key={topic} className="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md">
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-3 flex items-center justify-between min-w-[200px]">
          <div className="text-2xl font-mono tracking-wider font-semibold">{formatTime()}</div>
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
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between pb-2">
              <h3 className="font-semibold">{notesTitle}</h3>
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
              onChange={(event) => setNotes(event.target.value)}
              placeholder={notesPlaceholder}
              className="w-full flex-1 p-4 bg-transparent resize-none focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Actions</h3>
            <ActionButton label="Solved" hint="S" icon={Check} tone="emerald" onClick={() => setShowConfidence(true)} />
            <ActionButton label="Bookmark" hint="B" icon={Bookmark} tone="blue" onClick={() => { bookmark(problem.id); goToNext(); }} />
            <ActionButton label="Need Review" hint="R" icon={RefreshCw} tone="purple" onClick={() => { needReview(problem.id); goToNext(); }} />
            <ActionButton label="Skip" hint="K" icon={SkipForward} tone="zinc" onClick={() => { skip(problem.id); goToNext(); }} />
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl flex flex-col overflow-hidden">
            <a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition border-b border-gray-200 dark:border-zinc-800"
            >
              <div className="flex items-center gap-3">
                <div className="bg-[#FFA116]/10 p-2 rounded-md">
                  <ExternalLink className="w-4 h-4 text-[#FFA116]" />
                </div>
                <span className="font-medium">{externalLabel}</span>
              </div>
            </a>
            <a
              href={youtubeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition"
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

function ActionButton({
  label,
  hint,
  icon: Icon,
  tone,
  onClick,
}: {
  label: string;
  hint: string;
  icon: typeof Check;
  tone: "emerald" | "blue" | "purple" | "zinc";
  onClick: () => void;
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20",
    purple: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/20",
    zinc: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700",
  };
  const hints = {
    emerald: "bg-emerald-200/50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300",
    blue: "bg-blue-200/50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300",
    purple: "bg-purple-200/50 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300",
    zinc: "bg-zinc-300/50 dark:bg-zinc-700/50 text-zinc-800 dark:text-zinc-400",
  };

  return (
    <button onClick={onClick} className={cn("w-full flex items-center justify-between p-3 rounded-lg transition group", tones[tone])}>
      <span className="flex items-center gap-2 font-medium">
        <Icon className="w-4 h-4" /> {label}
      </span>
      <span className={cn("text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition", hints[tone])}>{hint}</span>
    </button>
  );
}
