"use client";

import { useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useSqlStore } from "@/store/useSqlStore";
import type { Problem, SqlProblem, SqlPrerequisite } from "@/types";
import type { ProblemOrder } from "@/features/study/schedule";

type Stats = {
  dailyGoal?: number;
  streak?: number;
  lastActiveDate?: string | null;
  problemOrder?: ProblemOrder;
};

export function StoreProvider({
  stats,
  dueCounts,
  children,
}: {
  stats: Stats;
  dueCounts: { dsa: number; sql: number };
  children: React.ReactNode;
}) {
  const initialized = useRef(false);

  if (!initialized.current) {
    useAppStore.getState().initStats(stats);
    useAppStore.getState().setDueCounts(dueCounts);
    initialized.current = true;
  }

  return <>{children}</>;
}

export function DsaCatalogHydrator({ problems }: { problems: Problem[] }) {
  const initialized = useRef(false);
  if (!initialized.current) {
    useAppStore.getState().initProblems(problems);
    initialized.current = true;
  }
  return null;
}

export function SqlCatalogHydrator({
  problems,
  prerequisites,
}: {
  problems: SqlProblem[];
  prerequisites: SqlPrerequisite[];
}) {
  const initialized = useRef(false);
  if (!initialized.current) {
    useSqlStore.getState().initSqlStore(problems, prerequisites);
    initialized.current = true;
  }
  return null;
}
