import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Boxes,
  Braces,
  Cpu,
  Database,
  Globe,
  Layers,
  MessageSquareText,
  Puzzle,
  Workflow,
} from "lucide-react";

export type GoLevel = {
  n: number;
  slug: string;
  short: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
};

export const goLevels: GoLevel[] = [
  {
    n: 1,
    slug: "level-01-language",
    short: "Language",
    title: "The language",
    blurb: "Packages, zero values, loops, functions, and defer.",
    icon: BookOpen,
  },
  {
    n: 2,
    slug: "level-02-values",
    short: "Values",
    title: "Values, slices, maps, structs",
    blurb: "Slice headers, map rules, struct size, and strings.",
    icon: Layers,
  },
  {
    n: 3,
    slug: "level-03-methods-and-errors",
    short: "Methods",
    title: "Methods, interfaces, errors",
    blurb: "Method sets, the two words of an interface, and errors.Is.",
    icon: Braces,
  },
  {
    n: 4,
    slug: "level-04-programs",
    short: "Programs",
    title: "Programs, tests, and the standard library",
    blurb: "Modules, table tests, fuzzing, and io.Reader.",
    icon: Boxes,
  },
  {
    n: 5,
    slug: "level-05-concurrency",
    short: "Concurrency",
    title: "Concurrency",
    blurb: "Races, mutexes, channels, select, and a worker pool.",
    icon: Workflow,
  },
  {
    n: 6,
    slug: "level-06-runtime",
    short: "Runtime",
    title: "The runtime",
    blurb: "Escape analysis, the scheduler, the collector, and profiles.",
    icon: Cpu,
  },
  {
    n: 7,
    slug: "level-07-http",
    short: "HTTP",
    title: "HTTP, the client, and shutdown",
    blurb: "Server timeouts, the connection pool, and SIGTERM.",
    icon: Globe,
  },
  {
    n: 8,
    slug: "level-08-pieces",
    short: "Pieces",
    title: "Pieces you are asked to write",
    blurb: "Crawler, transfer, cache, LRU, limiter, and breaker.",
    icon: Puzzle,
  },
  {
    n: 9,
    slug: "level-09-data",
    short: "Data",
    title: "SQL, jobs, and the outbox",
    blurb: "The SQL pool, SKIP LOCKED, idempotency, and the outbox.",
    icon: Database,
  },
  {
    n: 10,
    slug: "level-10-interview",
    short: "Interview",
    title: "Designs, bugs, and the sentences",
    blurb: "Four designs, the bug list, and the sentences you say first.",
    icon: MessageSquareText,
  },
];

export function goLevelBySlug(slug: string) {
  return goLevels.find((level) => level.slug === slug) ?? null;
}

export function goNeighbors(slug: string) {
  const index = goLevels.findIndex((level) => level.slug === slug);
  if (index < 0) return { prev: null, next: null };
  return {
    prev: index > 0 ? goLevels[index - 1] : null,
    next: index < goLevels.length - 1 ? goLevels[index + 1] : null,
  };
}
