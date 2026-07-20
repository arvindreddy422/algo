import "@excalidraw/excalidraw/index.css";
import { ExcalidrawWrapper } from "@/components/ExcalidrawWrapper";

export const metadata = {
  title: "Whiteboard | DSA Coach",
  description: "Freeform drawing canvas powered by Excalidraw.",
};

export default function WhiteboardPage() {
  return (
    <div className="flex flex-col h-full -m-4 md:-m-8">
      {/* Thin header strip */}
      <div className="flex items-center gap-2 px-5 py-2.5 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
        <span className="font-semibold text-sm tracking-tight">Whiteboard</span>
        <span className="text-[10px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-full">
          auto-saved
        </span>
      </div>

      {/* Canvas — fills remaining height */}
      <div className="flex-1 overflow-hidden">
        <ExcalidrawWrapper />
      </div>
    </div>
  );
}
