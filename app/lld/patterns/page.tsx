import Link from "next/link";
import { PATTERN_SUMMARIES } from "@/data/lld/patternIndex";
import type { PatternCategory } from "@/data/lld/types";

const categories: { id: PatternCategory; label: string }[] = [
  { id: "creational", label: "Creational" },
  { id: "structural", label: "Structural" },
  { id: "behavioral", label: "Behavioral" },
];

export default function PatternsIndexPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Design Patterns</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Thirteen patterns. Each page walks Basic → Improved → Best in Python and Java.
        </p>
      </header>

      {categories.map((category) => {
        const items = PATTERN_SUMMARIES.filter((pattern) => pattern.category === category.id);
        return (
          <section key={category.id}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              {category.label}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((pattern) => (
                <Link
                  key={pattern.slug}
                  href={`/lld/patterns/${pattern.slug}`}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                >
                  <h3 className="font-semibold">{pattern.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {pattern.tagline}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
