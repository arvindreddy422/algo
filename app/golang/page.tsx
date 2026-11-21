import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { goLevels } from "@/lib/golang/catalog";

export const metadata = {
  title: "Go | DSA Coach",
  description: "Learn Go from the language through the interview, one level at a time.",
};

export default function GoPathPage() {
  return (
    <div className="space-y-10 pb-10">
      <header className="overflow-hidden rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-white p-6 shadow-sm dark:border-cyan-900 dark:from-cyan-950/50 dark:via-zinc-950 dark:to-zinc-950 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">Go · 10 levels</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white">Learn Go from the start</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          One level at a time. Read it, type the code, then do the practice at the bottom. Open the next level when the exit checklist is true.
        </p>
        <Link
          href={`/golang/${goLevels[0].slug}`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-cyan-700"
        >
          Start level 1
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <ol className="grid gap-4">
        {goLevels.map((level) => {
          const Icon = level.icon;
          return (
            <li key={level.slug}>
              <Link
                href={`/golang/${level.slug}`}
                className="group flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-cyan-400 hover:bg-cyan-50/60 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-cyan-700 dark:hover:bg-cyan-950/20"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-600 text-lg font-semibold text-white">
                  {level.n}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-xl font-semibold text-zinc-950 dark:text-white">
                    <Icon className="h-5 w-5 text-cyan-700 dark:text-cyan-300" />
                    {level.title}
                  </span>
                  <span className="mt-1 block text-[16px] leading-7 text-zinc-600 dark:text-zinc-300">{level.blurb}</span>
                </span>
                <ArrowRight className="mt-1 hidden h-5 w-5 shrink-0 text-cyan-700 transition-transform group-hover:translate-x-0.5 dark:text-cyan-300 sm:block" />
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
