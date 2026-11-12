import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonBody } from "@/components/lld/LessonBody";
import { getPattern, PATTERNS } from "@/data/lld/patterns";

export function generateStaticParams() {
  return PATTERNS.map((pattern) => ({ slug: pattern.slug }));
}

export default async function PatternPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pattern = getPattern(slug);
  if (!pattern) notFound();

  const index = PATTERNS.findIndex((item) => item.slug === slug);
  const prev = index > 0 ? PATTERNS[index - 1] : undefined;
  const next = index < PATTERNS.length - 1 ? PATTERNS[index + 1] : undefined;

  return (
    <div className="space-y-8">
      <LessonBody lesson={pattern} />
      <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-6 dark:border-zinc-800">
        {prev ? (
          <Link
            href={`/lld/patterns/${prev.slug}`}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/lld/patterns/${next.slug}`}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
