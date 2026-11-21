import Link from "next/link";
import type { ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Mermaid } from "@/components/golang/Mermaid";
import { goLevels } from "@/lib/golang/catalog";
import { highlightCode } from "@/lib/golang/highlight";

const LANG_LABEL: Record<string, string> = {
  go: "Go",
  bash: "Shell",
  sh: "Shell",
  shell: "Shell",
  sql: "SQL",
  yaml: "YAML",
  yml: "YAML",
  text: "Text",
  plaintext: "Text",
};

function plainText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(plainText).join("");
  if (typeof node === "object" && "props" in node) {
    const props = node.props as { children?: ReactNode };
    return plainText(props.children);
  }
  return "";
}

function headingClass(text: string, base: string) {
  if (text.startsWith("Practice")) return `${base} text-amber-800 dark:text-amber-200`;
  if (text.startsWith("Exit checklist")) return `${base} text-emerald-800 dark:text-emerald-200`;
  return base;
}

function LessonLink({ href, children }: { href?: string; children?: ReactNode }) {
  if (!href) return <span>{children}</span>;
  const file = href.split("#")[0]?.split("/").pop() ?? "";
  if (file.endsWith(".md")) {
    const slug = file.replace(/\.md$/, "");
    const level = goLevels.find((item) => item.slug === slug);
    if (level) {
      return (
        <Link href={`/golang/${level.slug}`} className="font-medium text-cyan-700 underline decoration-cyan-400/70 underline-offset-4 hover:text-cyan-900 dark:text-cyan-300 dark:hover:text-cyan-100">
          {children}
        </Link>
      );
    }
    return <span className="font-mono text-[0.95em] text-zinc-600 dark:text-zinc-300">{children}</span>;
  }
  if (href.startsWith("/")) {
    return (
      <Link href={href} className="font-medium text-cyan-700 underline decoration-cyan-400/70 underline-offset-4 dark:text-cyan-300">
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" className="font-medium text-cyan-700 underline decoration-cyan-400/70 underline-offset-4 dark:text-cyan-300">
      {children}
    </a>
  );
}

export async function GoMarkdown({ markdown }: { markdown: string }) {
  const components: Components = {
    h1: ({ children }) => (
      <h1 className="mb-4 mt-10 text-4xl font-semibold tracking-tight text-zinc-950 first:mt-0 dark:text-white">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className={headingClass(plainText(children), "mb-4 mt-12 border-b border-cyan-200 pb-2 text-[1.7rem] font-semibold tracking-tight text-zinc-950 dark:border-cyan-900 dark:text-white")}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-8 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{children}</h3>
    ),
    p: ({ children }) => <p className="mb-5 text-[17px] leading-8 text-zinc-800 dark:text-zinc-100">{children}</p>,
    ul: ({ children }) => <ul className="mb-5 list-disc space-y-2 pl-6 text-[17px] leading-8 text-zinc-800 marker:text-cyan-600 dark:text-zinc-100">{children}</ul>,
    ol: ({ children }) => <ol className="mb-5 list-decimal space-y-2 pl-6 text-[17px] leading-8 text-zinc-800 marker:font-semibold marker:text-cyan-700 dark:text-zinc-100 dark:marker:text-cyan-300">{children}</ol>,
    li: ({ children }) => <li className="pl-1">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-zinc-950 dark:text-white">{children}</strong>,
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-cyan-500 bg-cyan-50/80 px-4 py-1 text-zinc-700 dark:border-cyan-400 dark:bg-cyan-950/40 dark:text-zinc-200">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-10 border-zinc-200 dark:border-zinc-800" />,
    a: ({ href, children }) => <LessonLink href={href}>{children}</LessonLink>,
    code: ({ className, children }) => {
      const lang = /language-([\w-]+)/.exec(className || "")?.[1];
      const text = String(children).replace(/\n$/, "");
      if (!lang) {
        return (
          <code className="rounded-md bg-cyan-50 px-1.5 py-0.5 font-mono text-[0.92em] text-cyan-900 dark:bg-cyan-950 dark:text-cyan-100">
            {children}
          </code>
        );
      }
      if (lang === "mermaid") return <Mermaid chart={text} />;
      return <HighlightedCode code={text} lang={lang} />;
    },
    pre: ({ children }) => <>{children}</>,
    table: ({ children }) => (
      <div className="my-6 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
        <table className="w-full border-collapse text-left text-[15.5px] leading-7">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-cyan-50 text-cyan-950 dark:bg-cyan-950/60 dark:text-cyan-50">{children}</thead>,
    th: ({ children }) => <th className="border-b border-cyan-200 px-4 py-3 font-semibold dark:border-cyan-900">{children}</th>,
    td: ({ children }) => <td className="border-b border-zinc-200 px-4 py-3 align-top text-zinc-800 dark:border-zinc-800 dark:text-zinc-100">{children}</td>,
    tr: ({ children }) => <tr className="even:bg-zinc-50 dark:even:bg-zinc-900/60">{children}</tr>,
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {markdown}
    </ReactMarkdown>
  );
}

async function HighlightedCode({ code, lang }: { code: string; lang: string }) {
  const html = await highlightCode(code, lang);
  const label = LANG_LABEL[lang] ?? lang;
  return (
    <figure className="go-code my-6 overflow-hidden rounded-2xl border border-zinc-300 shadow-sm dark:border-zinc-600">
      <figcaption className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900">
        <span className="font-mono text-[13px] font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">{label}</span>
      </figcaption>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </figure>
  );
}
