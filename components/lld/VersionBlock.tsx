import { cn } from "@/lib/utils";
import type { CodeVersion } from "@/data/lld/types";
import { CodeTabs } from "./CodeTabs";

const versionStyles: Record<CodeVersion["label"], string> = {
  Basic: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  Improved: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  Best: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
};

export function VersionBlock({ version }: { version: CodeVersion }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", versionStyles[version.label])}>
          {version.label}
        </span>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{version.intent}</p>
      </div>

      <CodeTabs code={version.code} />

      <div className="mt-4 space-y-3">
        <div>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Drawbacks</h4>
          <ul className="list-disc space-y-1 pl-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {version.drawbacks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        {version.nextImprovement && (
          <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/40">
            <h4 className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Next improvement</h4>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{version.nextImprovement}</p>
          </div>
        )}
      </div>
    </div>
  );
}
