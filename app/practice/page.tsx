"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trophy,
  BookOpen,
  Briefcase,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AtCoderContest {
  id: string;
  title: string;
  start_epoch_second: number;
}

interface AtCoderProblem {
  id: string;
  contest_id: string;
  problem_index: string;
  name: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CONTESTS_URL = "/api/atcoder/contests";
const PROBLEMS_URL = "/api/atcoder/problems";
const PER_PAGE = 10;

const CSES_TOPICS = [
  {
    title: "Dynamic Programming",
    description:
      "Coin Combinations, Knapsack, Edit Distance, Longest Increasing Subsequence",
    href: "https://cses.fi/problemset/task/1633",
    color: "purple",
  },
  {
    title: "Graph Algorithms",
    description: "Shortest Paths, MST, Topological Sort, Cycle Detection",
    href: "https://cses.fi/problemset/task/1676",
    color: "blue",
  },
  {
    title: "Tree Algorithms",
    description: "Subtrees, Diameter, Binary Lifting basics",
    href: "https://cses.fi/problemset/",
    color: "emerald",
  },
  {
    title: "Range Queries",
    description: "Segment Tree, Fenwick Tree practice",
    href: "https://cses.fi/problemset/",
    color: "orange",
  },
  {
    title: "Sorting & Searching",
    description: "Binary search patterns, sweep line",
    href: "https://cses.fi/problemset/",
    color: "sky",
  },
  {
    title: "Mathematics",
    description: "Combinatorics, Number Theory, Modular Arithmetic",
    href: "https://cses.fi/problemset/",
    color: "pink",
  },
];

const INTERVIEWBIT_TOPICS = [
  {
    title: "Arrays & Strings",
    href: "https://www.interviewbit.com/courses/programming/",
    color: "blue",
  },
  {
    title: "Trees & Binary Trees",
    href: "https://www.interviewbit.com/courses/trees/",
    color: "emerald",
  },
  {
    title: "Graphs",
    href: "https://www.interviewbit.com/courses/graphs/",
    color: "purple",
  },
  {
    title: "Dynamic Programming",
    href: "https://www.interviewbit.com/courses/dynamic-programming/",
    color: "orange",
  },
  {
    title: "Greedy",
    href: "https://www.interviewbit.com/courses/greedy-algorithm/",
    color: "yellow",
  },
  {
    title: "Backtracking",
    href: "https://www.interviewbit.com/courses/backtracking/",
    color: "red",
  },
];

const COLOR_MAP: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  purple: {
    bg: "bg-purple-50 dark:bg-purple-500/10",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-500/20",
    dot: "bg-purple-500",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-500/20",
    dot: "bg-blue-500",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-500/10",
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-500/20",
    dot: "bg-orange-500",
  },
  sky: {
    bg: "bg-sky-50 dark:bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-400",
    border: "border-sky-200 dark:border-sky-500/20",
    dot: "bg-sky-500",
  },
  pink: {
    bg: "bg-pink-50 dark:bg-pink-500/10",
    text: "text-pink-700 dark:text-pink-400",
    border: "border-pink-200 dark:border-pink-500/20",
    dot: "bg-pink-500",
  },
  yellow: {
    bg: "bg-yellow-50 dark:bg-yellow-500/10",
    text: "text-yellow-700 dark:text-yellow-400",
    border: "border-yellow-200 dark:border-yellow-500/20",
    dot: "bg-yellow-500",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-500/10",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-500/20",
    dot: "bg-red-500",
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          {badge && (
            <span className="text-xs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-full font-medium">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

// ─── AtCoder Section ──────────────────────────────────────────────────────────

function AtCoderSection() {
  const [contests, setContests] = useState<AtCoderContest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [expandedContest, setExpandedContest] = useState<string | null>(null);
  const [problemsMap, setProblemsMap] = useState<
    Record<string, AtCoderProblem[]>
  >({});
  const [loadingProblems, setLoadingProblems] = useState(false);

  useEffect(() => {
    fetch(CONTESTS_URL)
      .then((r) => r.json())
      .then((data: AtCoderContest[]) => {
        const abc = data
          .filter((c) => c.id.startsWith("abc"))
          .sort((a, b) => b.start_epoch_second - a.start_epoch_second);
        setContests(abc);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const fetchProblems = useCallback(
    async (contestId: string) => {
      if (problemsMap[contestId]) return;
      setLoadingProblems(true);
      try {
        const res = await fetch(PROBLEMS_URL);
        const all: AtCoderProblem[] = await res.json();
        const byContest: Record<string, AtCoderProblem[]> = {};
        all.forEach((p) => {
          if (!byContest[p.contest_id]) byContest[p.contest_id] = [];
          byContest[p.contest_id].push(p);
        });
        setProblemsMap((prev) => ({ ...prev, ...byContest }));
      } catch {
        /* no-op */
      } finally {
        setLoadingProblems(false);
      }
    },
    [problemsMap]
  );

  const toggleContest = (contestId: string) => {
    if (expandedContest === contestId) {
      setExpandedContest(null);
    } else {
      setExpandedContest(contestId);
      fetchProblems(contestId);
    }
  };

  const totalPages = Math.ceil(contests.length / PER_PAGE);
  const pageContests = contests.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Build page range: always show first, last, current±1
  const pageNums = (): (number | "…")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const set = new Set([1, totalPages, page, page - 1, page + 1].filter(n => n >= 1 && n <= totalPages));
    const sorted = Array.from(set).sort((a, b) => a - b);
    const result: (number | "…")[] = [];
    sorted.forEach((n, i) => {
      if (i > 0 && n - (sorted[i - 1] as number) > 1) result.push("…");
      result.push(n);
    });
    return result;
  };

  return (
    <SectionCard>
      <SectionHeader
        icon={<Trophy className="w-5 h-5 text-amber-500" />}
        title="AtCoder Beginner Contests"
        subtitle="Speed & implementation. Click a contest to view its problems."
        badge="ABC"
      />

      {loading && (
        <div className="flex items-center justify-center py-12 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading contests…
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 py-4">
          Failed to load contests. Check your internet connection.
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="space-y-2">
            {pageContests.map((contest) => {
              const isOpen = expandedContest === contest.id;
              const problems = problemsMap[contest.id];
              const date = new Date(
                contest.start_epoch_second * 1000
              ).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={contest.id}
                  className="border border-gray-100 dark:border-zinc-800 rounded-lg overflow-hidden"
                >
                  {/* Row */}
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <a
                      href={`https://atcoder.jp/contests/${contest.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono font-semibold text-sm text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase"
                    >
                      {contest.id}
                    </a>
                    <span className="text-xs text-zinc-400 ml-1">{date}</span>
                    <div className="ml-auto flex items-center gap-2">
                      <a
                        href={`https://atcoder.jp/contests/${contest.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                        title="Open on AtCoder"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => toggleContest(contest.id)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors font-medium"
                      >
                        Problems
                        {isOpen ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Problems drawer */}
                  {isOpen && (
                    <div className="border-t border-gray-100 dark:border-zinc-800 px-4 py-3 bg-zinc-50/50 dark:bg-zinc-800/30">
                      {loadingProblems && !problems ? (
                        <div className="flex items-center gap-2 text-sm text-zinc-400 py-1">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Loading problems…
                        </div>
                      ) : problems && problems.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {problems
                            .sort((a, b) =>
                              a.problem_index.localeCompare(b.problem_index)
                            )
                            .map((p) => (
                              <a
                                key={p.id}
                                href={`https://atcoder.jp/contests/${contest.id}/tasks/${p.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                              >
                                <span className="text-xs font-bold text-zinc-400">
                                  {p.problem_index}
                                </span>
                                {p.name}
                              </a>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-zinc-400">
                          No problems found for this contest.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-5">
            <button
              onClick={() => { setPage((p) => Math.max(1, p - 1)); setExpandedContest(null); }}
              disabled={page === 1}
              className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            <div className="flex items-center gap-1">
              {pageNums().map((n, i) =>
                n === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-zinc-400 text-sm">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => { setPage(n as number); setExpandedContest(null); }}
                    className={cn(
                      "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                      page === n
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    )}
                  >
                    {n}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); setExpandedContest(null); }}
              disabled={page === totalPages}
              className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </SectionCard>
  );
}

// ─── CSES Section ─────────────────────────────────────────────────────────────

function CsesSection() {
  return (
    <SectionCard>
      <SectionHeader
        icon={<BookOpen className="w-5 h-5 text-emerald-500" />}
        title="CSES Problem Set"
        subtitle="Core algorithmic foundations. Solve in order for maximum retention."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CSES_TOPICS.map((topic) => {
          const c = COLOR_MAP[topic.color];
          return (
            <a
              key={topic.title}
              href={topic.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group flex items-start gap-3 p-4 rounded-xl border transition-all hover:shadow-md",
                c.bg,
                c.border
              )}
            >
              <div
                className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", c.dot)}
              />
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "font-semibold text-sm flex items-center gap-1.5",
                    c.text
                  )}
                >
                  {topic.title}
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  {topic.description}
                </p>
              </div>
            </a>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
        <p className="text-xs text-zinc-400">
          Best approach: complete each section top-to-bottom before moving on.
        </p>
        <a
          href="https://cses.fi/problemset/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          Full Problem Set <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </SectionCard>
  );
}

// ─── InterviewBit Section ─────────────────────────────────────────────────────

function InterviewBitSection() {
  return (
    <SectionCard>
      <SectionHeader
        icon={<Briefcase className="w-5 h-5 text-blue-500" />}
        title="InterviewBit"
        subtitle="Interview-pattern problems — relevant for Google, Uber, Stripe, ByteDance and more."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {INTERVIEWBIT_TOPICS.map((topic, idx) => {
          const c = COLOR_MAP[topic.color];
          return (
            <a
              key={topic.title}
              href={topic.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group flex items-center gap-2.5 p-3.5 rounded-xl border font-medium text-sm transition-all hover:shadow-md",
                c.bg,
                c.border,
                c.text
              )}
            >
              <span className="text-xs w-5 h-5 rounded-full bg-white/60 dark:bg-zinc-900/60 flex items-center justify-center font-bold flex-shrink-0">
                {idx + 1}
              </span>
              <span className="flex-1">{topic.title}</span>
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
            </a>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
        <p className="text-xs text-zinc-400">
          <strong className="text-zinc-500 dark:text-zinc-300">Recommended path:</strong>{" "}
          Arrays & Strings → Trees & Graphs → Dynamic Programming → Greedy
        </p>
      </div>
    </SectionCard>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PracticePage() {
  return (
    <div className="py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-1">
          Practice Hub
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          AtCoder ABC contests, CSES core algorithms, and InterviewBit — all in
          one place.
        </p>
      </header>

      <AtCoderSection />
      <CsesSection />
      <InterviewBitSection />
    </div>
  );
}
