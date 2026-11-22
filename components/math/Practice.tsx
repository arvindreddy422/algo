"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ROUND_SIZE, makeRound, readAnswer, type DrillKind, type Question } from "@/lib/math/drills";
import {
  bestId,
  formatDrillTime,
  getBestsSnapshot,
  getServerBestsSnapshot,
  now,
  saveBestTime,
  subscribeBests,
} from "@/lib/math/score";
import { cn } from "@/lib/utils";

const DRILLS: { id: DrillKind; label: string }[] = [
  { id: "nines", label: "9 table" },
  { id: "tables", label: "Tables 2–9" },
  { id: "fast", label: "Fast ×" },
  { id: "addition", label: "Addition" },
  { id: "subtraction", label: "Subtraction" },
];

const TABLES = [2, 3, 4, 5, 6, 7, 8, 9] as const;

type Phase = "ready" | "playing" | "feedback" | "done";

export function Practice({
  initialDrill,
  initialTable,
}: {
  initialDrill: DrillKind;
  initialTable: number | "mix";
}) {
  const [kind, setKind] = useState<DrillKind>(initialDrill);
  const [table, setTable] = useState<number | "mix">(
    initialDrill === "tables" || initialDrill === "fast" ? initialTable : "mix",
  );
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [draft, setDraft] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [beat, setBeat] = useState(false);
  const bests = useSyncExternalStore(subscribeBests, getBestsSnapshot, getServerBestsSnapshot);

  const startedAt = useRef<number | null>(null);
  const waitRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const started = startedAt.current;
      if (started != null) setElapsed(now() - started);
    }, 100);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (phase === "playing") inputRef.current?.focus();
  }, [phase, index]);

  useEffect(() => {
    return () => {
      if (waitRef.current != null) window.clearTimeout(waitRef.current);
    };
  }, []);

  function clearWait() {
    if (waitRef.current != null) {
      window.clearTimeout(waitRef.current);
      waitRef.current = null;
    }
  }

  function resetRound(nextKind: DrillKind, nextTable: number | "mix", nextQuestions: Question[] | null) {
    clearWait();
    startedAt.current = null;
    setKind(nextKind);
    setTable(nextTable);
    setQuestions(nextQuestions);
    setPhase("ready");
    setIndex(0);
    setCorrect(0);
    setDraft("");
    setElapsed(0);
    setRunning(false);
    setBeat(false);
  }

  function deal(nextKind: DrillKind, nextTable: number | "mix") {
    resetRound(nextKind, nextTable, makeRound(nextKind, nextTable));
  }

  function finish(nextCorrect: number, ms: number, drill: DrillKind, drillTable: number | "mix") {
    setRunning(false);
    setElapsed(ms);
    setPhase("done");
    const isBest = nextCorrect === ROUND_SIZE && saveBestTime(bestId(drill, drillTable), ms);
    setBeat(isBest);
  }

  function advance(from: number) {
    setIndex(from + 1);
    setDraft("");
    setPhase("playing");
  }

  function start() {
    const next = questions ?? makeRound(kind, table);
    clearWait();
    startedAt.current = now();
    setQuestions(next);
    setElapsed(0);
    setIndex(0);
    setCorrect(0);
    setDraft("");
    setBeat(false);
    setRunning(true);
    setPhase("playing");
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (phase !== "playing" || !questions) return;
    if (draft.trim() === "") return;
    const parsed = readAnswer(draft);
    const ok = parsed === questions[index].answer;
    const nextCorrect = correct + (ok ? 1 : 0);
    const last = index + 1 >= ROUND_SIZE;
    setCorrect(nextCorrect);

    if (last) {
      const ms = now() - (startedAt.current ?? now());
      startedAt.current = null;
      setRunning(false);
      setElapsed(ms);
      if (!ok) {
        setPhase("feedback");
        clearWait();
        const drill = kind;
        const drillTable = table;
        waitRef.current = window.setTimeout(() => {
          waitRef.current = null;
          finish(nextCorrect, ms, drill, drillTable);
        }, 1100);
        return;
      }
      finish(nextCorrect, ms, kind, table);
      return;
    }

    if (!ok) {
      setPhase("feedback");
      const from = index;
      clearWait();
      waitRef.current = window.setTimeout(() => {
        waitRef.current = null;
        advance(from);
      }, 1100);
      return;
    }
    advance(index);
  }

  const current = questions?.[index];
  const best = bests[bestId(kind, table)];
  const accuracy = Math.round((correct / ROUND_SIZE) * 100);

  return (
    <div className="space-y-6 pb-10">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">Math practice</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white">Ten questions, then a new set</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          The clock starts when you press Start and stops on the last answer. A wrong answer shows the right one, then moves on. A perfect round can set your best time.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {DRILLS.map((drill) => (
          <button
            key={drill.id}
            type="button"
            onClick={() => deal(drill.id, keptFactor(drill.id, table))}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              kind === drill.id
                ? "bg-amber-600 text-white"
                : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-amber-50 dark:bg-zinc-900 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-amber-950/40",
            )}
          >
            {drill.label}
          </button>
        ))}
      </div>

      {(kind === "tables" || kind === "fast") && (
        <div className="flex flex-wrap gap-2">
          <TableChip active={table === "mix"} onClick={() => deal(kind, "mix")}>
            Mix
          </TableChip>
          {TABLES.map((n) => (
            <TableChip key={n} active={table === n} onClick={() => deal(kind, n)}>
              {n}
            </TableChip>
          ))}
          {kind === "fast" && (
            <TableChip active={table === 11} onClick={() => deal("fast", 11)}>
              × 11
            </TableChip>
          )}
        </div>
      )}

      <section className="mx-auto max-w-xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        {phase === "ready" && (
          <div className="text-center">
            <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-300">{readyCopy(kind, table)}</p>
            <p className="mt-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Best perfect time: {best == null ? "Not yet" : formatDrillTime(best)}
            </p>
            <button
              type="button"
              onClick={start}
              className="mt-6 rounded-xl bg-amber-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-amber-700"
            >
              Start
            </button>
          </div>
        )}

        {current && (phase === "playing" || phase === "feedback") && (
          <div>
            <div className="flex items-center justify-between text-sm font-medium text-zinc-500 dark:text-zinc-400">
              <span>
                Question {index + 1} of {ROUND_SIZE}
              </span>
              <span className="tabular-nums">{formatDrillTime(elapsed)}</span>
            </div>
            <p className="mt-8 text-center text-5xl font-semibold tabular-nums tracking-tight text-zinc-950 dark:text-white sm:text-6xl">
              {current.prompt}
            </p>
            <form onSubmit={submit} className="mt-8 flex items-center justify-center gap-3">
              <label htmlFor="math-answer" className="sr-only">
                Answer
              </label>
              <input
                id="math-answer"
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                inputMode="numeric"
                autoComplete="off"
                enterKeyHint="done"
                disabled={phase === "feedback"}
                className={cn(
                  "w-44 rounded-2xl border bg-transparent px-4 py-3 text-center text-3xl font-semibold tabular-nums outline-none",
                  phase === "feedback"
                    ? "border-rose-400 text-rose-700 dark:border-rose-700 dark:text-rose-300"
                    : "border-zinc-300 focus:border-amber-500 dark:border-zinc-600",
                )}
              />
              <button
                type="submit"
                disabled={phase === "feedback"}
                className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
              >
                Check
              </button>
            </form>
            <p className="sr-only" aria-live="polite">
              {phase === "feedback"
                ? `${current.prompt} equals ${current.answer}`
                : `Question ${index + 1}. ${current.prompt}`}
            </p>
            <p className="mt-4 min-h-7 text-center text-lg font-medium">
              {phase === "feedback" ? (
                <span className="text-rose-700 dark:text-rose-300">
                  {current.prompt} = {current.answer}
                </span>
              ) : (
                <span className="text-zinc-400">Press Enter</span>
              )}
            </p>
          </div>
        )}

        {phase === "done" && (
          <div>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Time" value={formatDrillTime(elapsed)} note={beat ? "New best" : undefined} />
              <Stat label="Correct" value={`${correct} / ${ROUND_SIZE}`} />
              <Stat label="Accuracy" value={`${accuracy}%`} />
              <Stat label="Best perfect time" value={best == null ? "Not yet" : formatDrillTime(best)} />
            </div>
            <button
              type="button"
              onClick={() => deal(kind, table)}
              className="mt-6 w-full rounded-xl bg-amber-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-amber-700"
            >
              New set
            </button>
            <Link href="/math" className="mt-4 block text-center text-sm font-semibold text-amber-700 hover:underline dark:text-amber-300">
              Read the tricks
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function TableChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 min-w-9 rounded-full px-3 text-sm font-semibold tabular-nums transition-colors",
        active
          ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200"
          : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-700",
      )}
    >
      {children}
    </button>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-700">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-950 dark:text-white">{value}</p>
      {note && <p className="text-sm font-medium text-amber-700 dark:text-amber-300">{note}</p>}
    </div>
  );
}

function keptFactor(kind: DrillKind, table: number | "mix"): number | "mix" {
  if (kind !== "tables" && kind !== "fast") return "mix";
  if (table === 11) return kind === "fast" ? 11 : "mix";
  if (typeof table === "number" && table >= 2 && table <= 9) return table;
  return "mix";
}

function readyCopy(kind: DrillKind, table: number | "mix") {
  if (kind === "nines") return "All ten facts, 9 × 1 through 9 × 10, in a new order.";
  if (kind === "addition") return "Ten sums. Both numbers are from 0 to 20.";
  if (kind === "subtraction") return "Ten differences. Both numbers are from 0 to 20, and the result is never below 0.";
  if (kind === "fast") {
    if (table === 11) return "Ten products. A number from 10 to 99 times 11.";
    if (table === "mix") return "Ten products. A number from 10 to 99 times a number from 2 to 9.";
    return `Ten products. A number from 10 to 99 times ${table}.`;
  }
  if (table === "mix") return "Ten facts from the 2s through the 9s.";
  return `Ten facts, ${table} × 1 through ${table} × 10, in a new order.`;
}
