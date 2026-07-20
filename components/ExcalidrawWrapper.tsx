"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";

// Must be at module top-level per Next.js docs
const Excalidraw = dynamic(
  async () => {
    const { Excalidraw } = await import("@excalidraw/excalidraw");
    return Excalidraw;
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full bg-zinc-50 dark:bg-zinc-900">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
          <span className="text-sm">Loading canvas…</span>
        </div>
      </div>
    ),
  }
);

const STORAGE_KEY = "excalidraw-drawing";

type SceneData = {
  elements: readonly object[];
  appState: Record<string, unknown>;
};

export function ExcalidrawWrapper() {
  const { resolvedTheme } = useTheme();
  const [initialData, setInitialData] = useState<SceneData | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved drawing from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setInitialData(JSON.parse(raw) as SceneData);
      } else {
        setInitialData({ elements: [], appState: {} });
      }
    } catch {
      setInitialData({ elements: [], appState: {} });
    }
  }, []);

  // Debounced save to localStorage — types come from Excalidraw's onChange signature
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = useCallback((elements: any, appState: any) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            elements,
            appState: {
              viewBackgroundColor: appState.viewBackgroundColor,
              currentItemStrokeColor: appState.currentItemStrokeColor,
              currentItemBackgroundColor: appState.currentItemBackgroundColor,
              currentItemFillStyle: appState.currentItemFillStyle,
              currentItemStrokeWidth: appState.currentItemStrokeWidth,
              currentItemRoughness: appState.currentItemRoughness,
              currentItemOpacity: appState.currentItemOpacity,
              currentItemFontFamily: appState.currentItemFontFamily,
              currentItemFontSize: appState.currentItemFontSize,
              currentItemTextAlign: appState.currentItemTextAlign,
              currentItemStartArrowhead: appState.currentItemStartArrowhead,
              currentItemEndArrowhead: appState.currentItemEndArrowhead,
              scrollX: appState.scrollX,
              scrollY: appState.scrollY,
              zoom: appState.zoom,
            },
          })
        );
      } catch {
        // storage quota exceeded — fail silently
      }
    }, 800);
  }, []);

  if (!initialData) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-zinc-50 dark:bg-zinc-900">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
          <span className="text-sm">Loading canvas…</span>
        </div>
      </div>
    );
  }

  return (
    <Excalidraw
      initialData={initialData as any}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      onChange={handleChange}
      UIOptions={{
        canvasActions: {
          saveToActiveFile: false,
          loadScene: true,
          export: { saveFileToDisk: true },
          saveAsImage: true,
        },
      }}
    />
  );
}
