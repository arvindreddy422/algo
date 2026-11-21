"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { ExcalidrawWrapper } from "@/components/ExcalidrawWrapper";

export function WhiteboardFrame() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const onChange = () => {
      if (document.fullscreenElement !== rootRef.current) {
        setExpanded(false);
      }
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const node = rootRef.current;
    if (!node) return;

    if (document.fullscreenElement || expanded) {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {
          // The overlay still closes below.
        }
      }
      setExpanded(false);
      return;
    }

    setExpanded(true);
    try {
      await node.requestFullscreen();
    } catch {
      // The fixed overlay still covers the app when the browser blocks fullscreen.
    }
  }, [expanded]);

  return (
    <div
      ref={rootRef}
      className={
        expanded
          ? "fixed inset-0 z-[80] flex h-screen w-screen flex-col bg-white dark:bg-zinc-950"
          : "flex h-full min-h-0 flex-col bg-white dark:bg-zinc-950"
      }
    >
      <div className="flex flex-shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-5 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
        <span className="text-sm font-semibold tracking-tight">Whiteboard</span>
        <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800">
          auto-saved
        </span>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          {expanded ? "Exit full screen" : "Full screen"}
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0">
          <ExcalidrawWrapper />
        </div>
      </div>
    </div>
  );
}
