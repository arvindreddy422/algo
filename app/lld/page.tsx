import Link from "next/link";
import { Boxes, Layers, Scale, Waypoints } from "lucide-react";
import { PATTERN_SUMMARIES } from "@/data/lld/patternIndex";

const tracks = [
  {
    href: "/lld/oops",
    title: "OOP",
    icon: Layers,
    description: "Four pillars plus three real-world problems that grow from messy code to a clean design.",
    meta: "3 problems",
  },
  {
    href: "/lld/solid",
    title: "SOLID",
    icon: Scale,
    description: "Each principle starts as a violation, then gets tightened into a version you can actually ship.",
    meta: "5 principles",
  },
  {
    href: "/lld/patterns",
    title: "Design Patterns",
    icon: Waypoints,
    description: "Thirteen interview-ready patterns. Basic, improved, and best — in Python and Java.",
    meta: "13 patterns",
  },
];

export default function LldHubPage() {
  return (
    <div className="space-y-8">
      <header>
        <div className="mb-2 flex items-center gap-3">
          <Boxes className="h-6 w-6 text-blue-500" />
          <h1 className="text-3xl font-bold tracking-tight">Low Level Design</h1>
        </div>
        <p className="text-zinc-500 dark:text-zinc-400">
          Short explanations, then code that gets better. Every example is Python and Java.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {tracks.map((track) => (
          <Link
            key={track.href}
            href={track.href}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <track.icon className="mb-3 h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold">{track.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{track.description}</p>
            <div className="mt-4 text-xs font-medium uppercase tracking-wider text-zinc-500">{track.meta}</div>
          </Link>
        ))}
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Patterns</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PATTERN_SUMMARIES.map((pattern) => (
            <Link
              key={pattern.slug}
              href={`/lld/patterns/${pattern.slug}`}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {pattern.category}
              </div>
              <div className="mt-1 font-medium">{pattern.title}</div>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{pattern.tagline}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
