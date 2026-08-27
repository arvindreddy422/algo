"use client";

import { useState } from "react";
import { Calendar, Clock, Check, X, Sparkles } from "lucide-react";
import { format, addDays } from "date-fns";

type RevisionModalProps = {
  isOpen: boolean;
  taskTitle: string;
  onClose: () => void;
  onConfirm: (revisionDate: string | null) => void;
};

export function RevisionModal({
  isOpen,
  taskTitle,
  onClose,
  onConfirm,
}: RevisionModalProps) {
  const [selectedOption, setSelectedOption] = useState<"3d" | "1w" | "2w" | "custom" | "none">("3d");
  const [customDate, setCustomDate] = useState<string>(
    format(addDays(new Date(), 3), "yyyy-MM-dd")
  );

  if (!isOpen) return null;

  const handleSave = () => {
    let finalDate: string | null = null;
    const today = new Date();

    if (selectedOption === "3d") {
      finalDate = format(addDays(today, 3), "yyyy-MM-dd");
    } else if (selectedOption === "1w") {
      finalDate = format(addDays(today, 7), "yyyy-MM-dd");
    } else if (selectedOption === "2w") {
      finalDate = format(addDays(today, 14), "yyyy-MM-dd");
    } else if (selectedOption === "custom") {
      finalDate = customDate || format(addDays(today, 3), "yyyy-MM-dd");
    } else if (selectedOption === "none") {
      finalDate = null;
    }

    onConfirm(finalDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-md w-full space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Glow Header Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                Task Completed! 🎉
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[240px]">
                {taskTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-violet-500" />
            Schedule Revision Interval
          </label>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedOption("3d")}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                selectedOption === "3d"
                  ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/25 scale-[1.02]"
                  : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 hover:border-violet-400"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold">3 Days</span>
              <span className="text-[10px] opacity-75">
                {format(addDays(new Date(), 3), "MMM d")}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedOption("1w")}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                selectedOption === "1w"
                  ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/25 scale-[1.02]"
                  : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 hover:border-violet-400"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-bold">1 Week</span>
              <span className="text-[10px] opacity-75">
                {format(addDays(new Date(), 7), "MMM d")}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedOption("2w")}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                selectedOption === "2w"
                  ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/25 scale-[1.02]"
                  : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 hover:border-violet-400"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-bold">2 Weeks</span>
              <span className="text-[10px] opacity-75">
                {format(addDays(new Date(), 14), "MMM d")}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setSelectedOption("custom")}
              className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                selectedOption === "custom"
                  ? "bg-violet-600 border-violet-500 text-white shadow-md"
                  : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 hover:border-violet-400"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> Custom Calendar
            </button>

            <button
              type="button"
              onClick={() => setSelectedOption("none")}
              className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                selectedOption === "none"
                  ? "bg-zinc-700 border-zinc-600 text-white"
                  : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/60 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700"
              }`}
            >
              No Revision
            </button>
          </div>

          {selectedOption === "custom" && (
            <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <label className="text-[11px] text-zinc-500 mb-1 block">Pick exact revision date:</label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
                className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20"
          >
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
  );
}
