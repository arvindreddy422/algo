"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { LldLanguage } from "@/data/lld/types";

const STORAGE_KEY = "lld-language";

type LldLanguageContextValue = {
  language: LldLanguage;
  setLanguage: (language: LldLanguage) => void;
};

const LldLanguageContext = createContext<LldLanguageContextValue | null>(null);

export function LldLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LldLanguage>("python");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "python" || stored === "java") {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (next: LldLanguage) => {
    setLanguageState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <LldLanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LldLanguageContext.Provider>
  );
}

export function useLldLanguage() {
  const ctx = useContext(LldLanguageContext);
  if (!ctx) {
    throw new Error("useLldLanguage must be used within LldLanguageProvider");
  }
  return ctx;
}
