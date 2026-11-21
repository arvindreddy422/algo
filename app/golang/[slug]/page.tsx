import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GoMarkdown } from "@/components/golang/Markdown";
import { LevelPager } from "@/components/golang/LevelPager";
import { goLevels, goLevelBySlug } from "@/lib/golang/catalog";
import { readLevelBody } from "@/lib/golang/content";

export function generateStaticParams() {
  return goLevels.map((level) => ({ slug: level.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const level = goLevelBySlug(slug);
  if (!level) return { title: "Go" };
  return {
    title: `Level ${level.n} · ${level.short} | Go`,
    description: level.blurb,
  };
}

export default async function GoLevelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = readLevelBody(slug);
  if (!lesson) notFound();
  const { level, body } = lesson;
  const Icon = level.icon;

  return (
    <article className="min-w-0 max-w-full pb-16">
      <header className="mb-8 rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-6 dark:border-cyan-900 dark:from-cyan-950/40 dark:to-zinc-950 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/golang" className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700 hover:underline dark:text-cyan-300">
            Go path
          </Link>
          <span className="rounded-full bg-cyan-600 px-3 py-1 text-sm font-semibold text-white">
            Level {level.n} of {goLevels.length}
          </span>
        </div>
        <div className="mt-3 flex items-start gap-3">
          <Icon className="mt-1 h-8 w-8 shrink-0 text-cyan-700 dark:text-cyan-300" />
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white">{level.title}</h1>
        </div>
        <p className="mt-3 max-w-3xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">{level.blurb}</p>
      </header>

      <GoMarkdown markdown={body} />
      <LevelPager slug={level.slug} />
    </article>
  );
}
