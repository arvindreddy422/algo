import { LessonBody } from "@/components/lld/LessonBody";
import { OOP_PILLARS, OOP_PROBLEMS } from "@/data/lld/oops";

export default function OopsPage() {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Object-Oriented Programming</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Four pillars, then three problems that start messy and get strict.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        {OOP_PILLARS.map((pillar) => (
          <div
            key={pillar.name}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="font-semibold">{pillar.name}</h2>
            <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{pillar.summary}</p>
          </div>
        ))}
      </section>

      <div className="space-y-12">
        {OOP_PROBLEMS.map((problem, index) => (
          <section key={problem.slug} id={problem.slug} className="space-y-4">
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Problem {index + 1}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{problem.problem}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {problem.pillars.map((pillar) => (
                  <span
                    key={pillar}
                    className="rounded-md bg-white px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                  >
                    {pillar}
                  </span>
                ))}
              </div>
            </div>
            <LessonBody lesson={problem} />
          </section>
        ))}
      </div>
    </div>
  );
}
