"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const topics = [
  { href: "/lld/oops", label: "OOP" },
  { href: "/lld/solid", label: "SOLID" },
  { href: "/lld/patterns", label: "Patterns" },
];

export function LldTopicNav() {
  const pathname = usePathname();
  const isHub = pathname === "/lld";

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      {!isHub && (
        <Link
          href="/lld"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
          LLD
        </Link>
      )}
      <div className="flex flex-wrap gap-1.5">
        {topics.map((topic) => {
          const active = pathname === topic.href || pathname.startsWith(`${topic.href}/`);
          return (
            <Link
              key={topic.href}
              href={topic.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-50"
              )}
            >
              {topic.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
