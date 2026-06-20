"use client";

import { useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Problem } from "@/types";

export function StoreProvider({ problems, stats, children }: { problems: Problem[], stats: any, children: React.ReactNode }) {
  const initialized = useRef(false);
  
  if (!initialized.current) {
    useAppStore.getState().initStore(problems, stats);
    initialized.current = true;
  }
  
  return <>{children}</>;
}
