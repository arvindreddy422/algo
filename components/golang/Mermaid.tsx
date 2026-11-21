"use client";

import { useTheme } from "next-themes";
import { useEffect, useId, useState } from "react";

export function Mermaid({ chart }: { chart: string }) {
  const { resolvedTheme } = useTheme();
  const reactId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    setSvg(null);

    (async () => {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: resolvedTheme === "dark" ? "dark" : "neutral",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        flowchart: { htmlLabels: true, wrappingWidth: 480, padding: 12 },
      });
      try {
        const { svg: next } = await mermaid.render(`goDiagram${reactId}`, chart.trim());
        if (!cancelled) setSvg(next);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, reactId, resolvedTheme]);

  if (failed) {
    return (
      <pre className="my-6 overflow-x-auto rounded-xl border border-amber-300 bg-amber-50 p-4 text-[15px] leading-7 text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
        {chart}
      </pre>
    );
  }

  return (
    <div className="my-8 overflow-x-auto rounded-2xl border border-cyan-200 bg-cyan-50/60 px-4 py-6 dark:border-cyan-900 dark:bg-cyan-950/30">
      {svg ? (
        <div className="flex justify-center [&_svg]:h-auto [&_svg]:max-w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="py-8 text-center text-sm text-cyan-800/70 dark:text-cyan-200/70">Drawing diagram…</div>
      )}
    </div>
  );
}
