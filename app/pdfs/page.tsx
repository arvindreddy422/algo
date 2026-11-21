import { readdir } from "fs/promises";
import path from "path";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { getSessionUser } from "@/lib/sessionUser";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "PDF Notes | DSA Coach",
  description: "Admin-only PDF notes.",
};

function labelFor(name: string) {
  return name
    .replace(/\.pdf$/i, "")
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function PdfsPage({
  searchParams,
}: {
  searchParams: Promise<{ file?: string }>;
}) {
  const me = await getSessionUser();
  if (!me) redirect("/login");
  if (me.role !== "admin") redirect("/notes");

  const names = (await readdir(path.join(process.cwd(), "public", "pdfs")))
    .filter((name) => name.toLowerCase().endsWith(".pdf"))
    .sort((a, b) => a.localeCompare(b));

  const { file } = await searchParams;
  const selected = file && names.includes(file) ? file : names[0];

  return (
    <div className="flex h-full min-h-0">
      <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
          <h1 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-white">PDF Notes</h1>
          <p className="mt-1 text-xs text-zinc-500">{names.length} files</p>
        </div>
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
          {names.map((name) => {
            const active = name === selected;
            return (
              <Link
                key={name}
                href={`/pdfs?file=${encodeURIComponent(name)}`}
                className={cn(
                  "flex items-start gap-2 rounded-lg px-3 py-2 text-sm leading-5 transition-colors",
                  active
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                )}
              >
                <FileText className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{labelFor(name)}</span>
              </Link>
            );
          })}
          {names.length === 0 && (
            <p className="px-3 py-2 text-sm text-zinc-500">No PDFs in public/pdfs yet.</p>
          )}
        </nav>
      </aside>
      {selected ? (
        <iframe
          src={`/pdfs/${encodeURIComponent(selected)}`}
          title={labelFor(selected)}
          className="h-full min-w-0 flex-1 bg-white"
        />
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
          Add a PDF to public/pdfs and redeploy.
        </div>
      )}
    </div>
  );
}
