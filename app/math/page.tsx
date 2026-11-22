import Link from "next/link";
import { ArrowRight, Timer } from "lucide-react";
import { mathTricks } from "@/lib/math/catalog";

export const metadata = {
  title: "Tricks | Math",
  description: "Short mental-math tricks for the 2 to 9 tables, addition, and subtraction.",
};

export default function MathTricksPage() {
  return (
    <div className="space-y-10 pb-10">
      <header className="overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white p-6 shadow-sm dark:border-amber-900 dark:from-amber-950/50 dark:via-zinc-950 dark:to-zinc-950 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
          Math · {mathTricks.length} tricks
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white">Read a trick, then try it fast</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          Short reads for the tables from 2 to 9, then Vedic moves for a product like 83 × 7. Each one has a picture and a flow. When a trick feels familiar, practice it.
        </p>
        <Link
          href="/math/practice"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-amber-700"
        >
          <Timer className="h-4 w-4" />
          Practice the 9s
        </Link>
      </header>

      <ol className="grid gap-4">
        {mathTricks.map((trick) => {
          const Icon = trick.icon;
          return (
            <li key={trick.slug}>
              <Link
                href={`/math/${trick.slug}`}
                className="group flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-amber-400 hover:bg-amber-50/60 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-amber-700 dark:hover:bg-amber-950/20"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-600 text-lg font-semibold text-white">
                  {trick.n}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-xl font-semibold text-zinc-950 dark:text-white">
                    <Icon className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                    {trick.title}
                  </span>
                  <span className="mt-1 block text-[16px] leading-7 text-zinc-600 dark:text-zinc-300">{trick.blurb}</span>
                </span>
                <ArrowRight className="mt-1 hidden h-5 w-5 shrink-0 text-amber-700 transition-transform group-hover:translate-x-0.5 dark:text-amber-300 sm:block" />
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
