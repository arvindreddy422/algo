export function LessonHeader({
  title,
  tagline,
  explanation,
  whenToUse,
  whenNot,
}: {
  title: string;
  tagline: string;
  explanation: string;
  whenToUse?: string;
  whenNot?: string;
}) {
  return (
    <header className="space-y-3">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">{tagline}</p>
      </div>
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{explanation}</p>
      {(whenToUse || whenNot) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {whenToUse && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">When to use</h4>
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{whenToUse}</p>
            </div>
          )}
          {whenNot && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 dark:border-amber-500/20 dark:bg-amber-500/10">
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">When not</h4>
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{whenNot}</p>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
