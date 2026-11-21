"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { VaultNote } from "@/lib/noteTypes";

function wikiMarkdown(markdown: string, notes: VaultNote[]) {
  return markdown.replace(/\[\[([^\[\]\n]+?)\]\]/g, (_full, inner: string) => {
    const [targetPart, alias] = inner.split("|");
    const target = targetPart.split("#")[0]?.trim() ?? "";
    const label = (alias ?? target).trim() || target;
    const safeLabel = label.replace(/[\[\]]/g, "");
    const match = notes.find(
      (note) => note.kind === "note" && note.title.localeCompare(target, undefined, { sensitivity: "accent" }) === 0
    );
    if (!match) return `[${safeLabel}](#missing:${encodeURIComponent(target)})`;
    return `[${safeLabel}](#note:${match.id})`;
  });
}

const components: Components = {
  h1: ({ children }) => <h1 className="mb-3 mt-6 text-2xl font-semibold tracking-tight first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 mt-6 text-xl font-semibold tracking-tight first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 mt-5 text-lg font-semibold first:mt-0">{children}</h3>,
  p: ({ children }) => <p className="mb-3 leading-7">{children}</p>,
  ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>,
  li: ({ children }) => <li className="leading-7">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-2 border-zinc-300 pl-3 text-zinc-600 dark:border-zinc-600 dark:text-zinc-300">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-zinc-200 dark:border-zinc-800" />,
  a: ({ href, children }) => {
    const internal = href?.startsWith("#note:") || href?.startsWith("#missing:");
    if (internal) {
      return (
        <a href={href} className="text-violet-600 underline decoration-violet-400/60 underline-offset-2 dark:text-violet-400">
          {children}
        </a>
      );
    }
    return (
      <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-2">
        {children}
      </a>
    );
  },
  code: ({ className, children }) => {
    const block = Boolean(className);
    if (block) {
      return <code className={`${className ?? ""} font-mono text-[13px]`}>{children}</code>;
    }
    return <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[13px] dark:bg-zinc-800">{children}</code>;
  },
  pre: ({ children }) => (
    <pre className="mb-3 overflow-x-auto rounded-xl bg-zinc-100 p-3 text-[13px] dark:bg-zinc-900">{children}</pre>
  ),
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-zinc-200 px-2 py-1 text-left dark:border-zinc-700">{children}</th>,
  td: ({ children }) => <td className="border border-zinc-200 px-2 py-1 dark:border-zinc-700">{children}</td>,
};

export function NotePreview({
  markdown,
  notes,
  onOpen,
}: {
  markdown: string;
  notes: VaultNote[];
  onOpen: (href: string) => void;
}) {
  return (
    <div
      className="text-sm text-zinc-800 dark:text-zinc-100"
      onClick={(event) => {
        const anchor = (event.target as HTMLElement).closest("a");
        const href = anchor?.getAttribute("href");
        if (!href || (!href.startsWith("#note:") && !href.startsWith("#missing:"))) return;
        event.preventDefault();
        onOpen(href);
      }}
    >
      {markdown.trim() ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {wikiMarkdown(markdown, notes)}
        </ReactMarkdown>
      ) : (
        <p className="text-zinc-400">Nothing written yet. Use [[Note title]] to link another note.</p>
      )}
    </div>
  );
}
