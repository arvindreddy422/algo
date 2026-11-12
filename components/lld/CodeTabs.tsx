"use client";

import { cn } from "@/lib/utils";
import type { LangCode } from "@/data/lld/types";
import { useLldLanguage } from "./LldLanguageProvider";

export function CodeTabs({ code }: { code: LangCode }) {
  const { language, setLanguage } = useLldLanguage();
  const source = language === "python" ? code.python : code.java;

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-1 border-b border-zinc-200 bg-zinc-50 px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900/80">
        {(["python", "java"] as const).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setLanguage(lang)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
              language === lang
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            )}
          >
            {lang}
          </button>
        ))}
      </div>
      <pre className="overflow-x-auto bg-zinc-100 p-4 text-sm leading-relaxed dark:bg-zinc-950">
        <code className="font-mono text-[13px] text-zinc-800 dark:text-zinc-200">{source}</code>
      </pre>
    </div>
  );
}
