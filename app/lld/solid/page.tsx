import { LessonBody } from "@/components/lld/LessonBody";
import { SOLID_PRINCIPLES } from "@/data/lld/solid";

export default function SolidPage() {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">SOLID</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Five rules for types that stay easy to change. Each one starts as a violation.
        </p>
      </header>

      <nav className="flex flex-wrap gap-2">
        {SOLID_PRINCIPLES.map((principle) => (
          <a
            key={principle.slug}
            href={`#${principle.slug}`}
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700"
          >
            <span className="font-semibold text-blue-600 dark:text-blue-400">{principle.letter}</span>
            {" · "}
            {principle.name}
          </a>
        ))}
      </nav>

      <div className="space-y-12">
        {SOLID_PRINCIPLES.map((principle) => (
          <section key={principle.slug} id={principle.slug} className="scroll-mt-8">
            <LessonBody lesson={principle} />
          </section>
        ))}
      </div>
    </div>
  );
}
