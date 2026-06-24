"use client";

import { useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useSqlStore } from "@/store/useSqlStore";
import { Problem, SqlProblem, SqlPrerequisite } from "@/types";

export function StoreProvider({ problems, sqlProblems, sqlPrerequisites, stats, children }: { problems: Problem[], sqlProblems: SqlProblem[], sqlPrerequisites: SqlPrerequisite[], stats: any, children: React.ReactNode }) {
  const initialized = useRef(false);
  
  if (!initialized.current) {
    useAppStore.getState().initStore(problems, stats);
    useSqlStore.getState().initSqlStore(sqlProblems, sqlPrerequisites);
    initialized.current = true;
  }
  
  return <>{children}</>;
}
