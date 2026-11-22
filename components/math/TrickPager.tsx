import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { mathNeighbors, type MathTrick } from "@/lib/math/catalog";

function End({ trick, dir }: { trick: MathTrick; dir: "prev" | "next" }) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <Link
      href={`/math/${trick.slug}`}
      className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-amber-400 hover:bg-amber-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-amber-700 dark:hover:bg-amber-950/40"
    >
      {dir === "prev" && <Icon className="h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" />}
      <span className={`min-w-0 ${dir === "next" ? "ml-auto text-right" : ""}`}>
        <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {dir === "prev" ? "Previous" : "Next"} · {trick.n}
        </span>
        <span className="block truncate text-base font-semibold text-zinc-900 dark:text-zinc-50">{trick.short}</span>
      </span>
      {dir === "next" && <Icon className="h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" />}
    </Link>
  );
}

export function TrickPager({ slug }: { slug: string }) {
  const { prev, next } = mathNeighbors(slug);
  if (!prev && !next) return null;
  return (
    <nav className="mt-12 flex flex-col gap-3 sm:flex-row">
      {prev ? <End trick={prev} dir="prev" /> : <div className="hidden flex-1 sm:block" />}
      {next ? <End trick={next} dir="next" /> : <div className="hidden flex-1 sm:block" />}
    </nav>
  );
}
