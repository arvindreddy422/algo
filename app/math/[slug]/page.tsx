import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Timer } from "lucide-react";
import { Mermaid } from "@/components/golang/Mermaid";
import { TrickDiagram } from "@/components/math/diagrams";
import { TrickPager } from "@/components/math/TrickPager";
import { mathTrickBySlug, mathTricks, practiceHref } from "@/lib/math/catalog";

export function generateStaticParams() {
  return mathTricks.map((trick) => ({ slug: trick.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const trick = mathTrickBySlug(slug);
  if (!trick) return { title: "Math" };
  return {
    title: `${trick.title} | Math`,
    description: trick.blurb,
  };
}

export default async function MathTrickPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trick = mathTrickBySlug(slug);
  if (!trick) notFound();
  const Icon = trick.icon;

  return (
    <article className="min-w-0 max-w-full pb-16">
      <header className="mb-8 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 dark:border-amber-900 dark:from-amber-950/40 dark:to-zinc-950 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/math" className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700 hover:underline dark:text-amber-300">
            Math tricks
          </Link>
          <span className="rounded-full bg-amber-600 px-3 py-1 text-sm font-semibold text-white">
            {trick.n} of {mathTricks.length}
          </span>
        </div>
        <div className="mt-3 flex items-start gap-3">
          <Icon className="mt-1 h-8 w-8 shrink-0 text-amber-700 dark:text-amber-300" />
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white">{trick.title}</h1>
        </div>
        <p className="mt-3 max-w-3xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">{trick.blurb}</p>
      </header>

      <TrickDiagram kind={trick.diagram} />

      <div className="space-y-8">
        {trick.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-3 max-w-3xl text-lg leading-8 text-zinc-700 dark:text-zinc-300">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>

      <Mermaid chart={trick.chart} />

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">Try it</p>
        <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-950 dark:text-white">{trick.walk.problem}</p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-lg leading-8 text-zinc-700 dark:text-zinc-300">
          {trick.walk.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <Link
          href={practiceHref(trick)}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-amber-700"
        >
          <Timer className="h-4 w-4" />
          Practice this
        </Link>
      </section>

      <TrickPager slug={trick.slug} />
    </article>
  );
}
