"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  ChevronDown,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Difficulty = "Easy" | "Medium" | "Hard";

type DailyEntry = {
  id: number;
  title: string;
  url: string | null;
  approach: string;
  notes: string | null;
  difficulty: Difficulty | null;
  topic: string | null;
  logDate: string;
  addedBy: string;
  addedByName: string;
  updatedBy: string | null;
  updatedByName: string | null;
  createdAt: string;
  updatedAt: string;
};

type SessionUser = { id: string; name: string; email: string };
type DateCount = { date: string; count: number };
type DuplicateMatch = { id: number; title: string; logDate: string; addedByName: string };

type LogFormState = {
  title: string;
  url: string;
  approach: string;
  notes: string;
  difficulty: Difficulty | "";
  topic: string;
  logDate: string;
};

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

const DIFFICULTY_CLASS: Record<Difficulty, string> = {
  Easy: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  Medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  Hard: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
};

const DIFFICULTY_BAR: Record<Difficulty, string> = {
  Easy: "bg-emerald-500",
  Medium: "bg-amber-500",
  Hard: "bg-red-500",
};

const AVATAR_COLORS = [
  "bg-violet-600",
  "bg-sky-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
];

function localToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function toDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatLogDate(value: string) {
  return format(toDate(value), "EEE, d MMM yyyy");
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const letters = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
  return letters || "?";
}

function avatarColor(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash + char.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[hash];
}

function emptyForm(logDate: string): LogFormState {
  return {
    title: "",
    url: "",
    approach: "",
    notes: "",
    difficulty: "",
    topic: "",
    logDate,
  };
}

function entryToForm(entry: DailyEntry): LogFormState {
  return {
    title: entry.title,
    url: entry.url ?? "",
    approach: entry.approach,
    notes: entry.notes ?? "",
    difficulty: entry.difficulty ?? "",
    topic: entry.topic ?? "",
    logDate: entry.logDate,
  };
}

function useDuplicate(url: string, ignoreId?: number) {
  const [match, setMatch] = useState<DuplicateMatch | null>(null);

  useEffect(() => {
    const trimmed = url.trim();
    if (!trimmed) {
      setMatch(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/daily?checkUrl=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        const found = (data.matches as DuplicateMatch[] | undefined)?.find((item) => item.id !== ignoreId) ?? null;
        setMatch(found);
      } catch {
        // Ignore aborted lookups.
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [url, ignoreId]);

  return match;
}

const inputClass =
  "w-full min-w-0 max-w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-zinc-400">{children}</span>;
}

function LogForm({
  form,
  setForm,
  topics,
  duplicate,
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
  listId,
}: {
  form: LogFormState;
  setForm: (next: LogFormState) => void;
  topics: string[];
  duplicate: DuplicateMatch | null;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (event: React.FormEvent) => void;
  onCancel?: () => void;
  listId: string;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <FieldLabel>Question</FieldLabel>
        <input
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
          placeholder="Two Sum"
          required
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="min-w-0 lg:col-span-2">
          <FieldLabel>Link</FieldLabel>
          <input
            value={form.url}
            onChange={(event) => setForm({ ...form, url: event.target.value })}
            placeholder="https://leetcode.com/problems/two-sum"
            type="text"
            inputMode="url"
            className={inputClass}
          />
          {duplicate && (
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
              {`Already logged on ${formatLogDate(duplicate.logDate)} by ${duplicate.addedByName}${duplicate.title ? ` (${duplicate.title})` : ""}. You can still save it.`}
            </p>
          )}
        </div>
        <div className="min-w-0">
          <FieldLabel>Topic</FieldLabel>
          <input
            value={form.topic}
            onChange={(event) => setForm({ ...form, topic: event.target.value })}
            placeholder="Sliding window"
            list={listId}
            className={inputClass}
          />
          <datalist id={listId}>
            {topics.map((topic) => (
              <option key={topic} value={topic} />
            ))}
          </datalist>
        </div>
        <div className="min-w-0">
          <FieldLabel>Date</FieldLabel>
          <input
            value={form.logDate}
            onChange={(event) => setForm({ ...form, logDate: event.target.value })}
            type="date"
            required
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <FieldLabel>Difficulty</FieldLabel>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setForm({ ...form, difficulty: "" })}
            className={cn(
              "min-h-10 px-3.5 rounded-full text-xs font-medium border",
              form.difficulty === ""
                ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                : "border-zinc-200 dark:border-zinc-700 text-zinc-500"
            )}
          >
            Skip
          </button>
          {DIFFICULTIES.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setForm({ ...form, difficulty: level })}
              className={cn(
                "min-h-10 px-3.5 rounded-full text-xs font-medium border",
                form.difficulty === level
                  ? DIFFICULTY_CLASS[level]
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-500"
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>How to approach it</FieldLabel>
        <textarea
          value={form.approach}
          onChange={(event) => setForm({ ...form, approach: event.target.value })}
          placeholder="What to notice, which pattern to use, and the steps — in plain English."
          required
          rows={5}
          className={cn(inputClass, "leading-relaxed")}
        />
      </div>
      <div>
        <FieldLabel>Hints and test cases</FieldLabel>
        <textarea
          value={form.notes}
          onChange={(event) => setForm({ ...form, notes: event.target.value })}
          placeholder="Edge cases, a sample input, or a hint for later."
          rows={3}
          className={cn(inputClass, "leading-relaxed")}
        />
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 min-h-11 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 text-white text-sm font-medium rounded-lg dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default function DailyPage() {
  const today = useMemo(() => localToday(), []);
  const [me, setMe] = useState<SessionUser | null>(null);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [dates, setDates] = useState<DateCount[]>([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [personFilter, setPersonFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<LogFormState>(() => emptyForm(today));
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<LogFormState>(() => emptyForm(today));
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const createDuplicate = useDuplicate(showForm ? form.url : "", undefined);
  const editDuplicate = useDuplicate(editingId ? editForm.url : "", editingId ?? undefined);

  const load = useCallback(async (date: string, query: string) => {
    setError("");
    try {
      const qs = query
        ? `q=${encodeURIComponent(query)}`
        : `date=${encodeURIComponent(date)}`;
      const [listRes, datesRes] = await Promise.all([
        fetch(`/api/daily?${qs}`),
        fetch("/api/daily/dates"),
      ]);
      if (listRes.status === 401 || datesRes.status === 401) {
        setError("Sign in again to use the daily log.");
        return;
      }
      if (!listRes.ok) {
        const body = await listRes.json().catch(() => ({}));
        setError(body.error || "Could not load the log.");
        return;
      }
      const list = await listRes.json();
      const dateBody = datesRes.ok ? await datesRes.json() : { dates: [] };
      setMe(list.me ?? null);
      setEntries(Array.isArray(list.entries) ? list.entries : []);
      setDates(Array.isArray(dateBody.dates) ? dateBody.dates : []);
    } catch {
      setError("Could not load the log.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    load(selectedDate, search);
  }, [load, selectedDate, search]);

  const topics = useMemo(
    () => Array.from(new Set(entries.map((entry) => entry.topic).filter((topic): topic is string => Boolean(topic)))).sort(),
    [entries]
  );

  const visible = personFilter === "all" ? entries : entries.filter((entry) => entry.addedBy === personFilter);

  const byPerson = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    for (const entry of entries) {
      const current = map.get(entry.addedBy) ?? { name: entry.addedByName, count: 0 };
      current.count += 1;
      map.set(entry.addedBy, current);
    }
    return Array.from(map.entries());
  }, [entries]);

  const history = useMemo(() => {
    const todayCount = dates.find((item) => item.date === today)?.count ?? 0;
    return [
      { date: today, count: todayCount },
      ...dates.filter((item) => item.date !== today),
    ];
  }, [dates, today]);

  const openCreate = () => {
    setForm(emptyForm(search ? today : selectedDate));
    setFormError("");
    setShowForm(true);
    setEditingId(null);
  };

  const selectDay = (date: string) => {
    setSearchInput("");
    setSearch("");
    setSelectedDate(date);
    setExpandedId(null);
    setEditingId(null);
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          difficulty: form.difficulty || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(body.error || "Could not save the problem.");
        return;
      }
      setShowForm(false);
      setForm(emptyForm(form.logDate));
      setSearchInput("");
      setSearch("");
      setSelectedDate(form.logDate);
      setExpandedId(body.id ?? null);
      await load(form.logDate, "");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (entry: DailyEntry) => {
    setEditingId(entry.id);
    setEditForm(entryToForm(entry));
    setExpandedId(entry.id);
    setFormError("");
    setConfirmDeleteId(null);
  };

  const handleEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingId) return;
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch(`/api/daily/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          difficulty: editForm.difficulty || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(body.error || "Could not update the problem.");
        return;
      }
      const nextDate = editForm.logDate;
      setEditingId(null);
      if (!search && nextDate !== selectedDate) setSelectedDate(nextDate);
      await load(search ? selectedDate : nextDate, search);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/daily/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Could not delete the problem.");
      return;
    }
    setConfirmDeleteId(null);
    setExpandedId(null);
    setEditingId(null);
    await load(selectedDate, search);
  };

  const heading = search
    ? `Results for “${search}”`
    : selectedDate === today
      ? "Today"
      : format(toDate(selectedDate), "EEEE, d MMMM");

  const emptyCopy = search
    ? "No problems match that search."
    : personFilter !== "all"
      ? "Nothing from this person here."
      : selectedDate === today
        ? "Nothing logged today. Add the problem you just solved."
        : "No problems logged on this day.";

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">Shared log</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Daily</h1>
          <p className="mt-1 text-sm text-zinc-500">Problems you both solved, and how to approach them.</p>
        </div>
        <button
          type="button"
          onClick={() => (showForm ? setShowForm(false) : openCreate())}
          className="inline-flex w-full lg:w-auto items-center justify-center gap-2 min-h-11 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-lg dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Close" : "Add problem"}
        </button>
      </header>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 min-w-0">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search titles and topics"
            className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
          />
        </div>
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setSearch("");
            }}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 px-3 py-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <X className="w-3.5 h-3.5" />
            Clear search
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto overscroll-x-contain snap-x snap-mandatory pb-1 -mx-4 px-4 md:-mx-6 md:px-6 lg:mx-0 lg:px-0 min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {history.map((item) => {
          const active = !search && item.date === selectedDate;
          const date = toDate(item.date);
          return (
            <button
              key={item.date}
              type="button"
              onClick={() => selectDay(item.date)}
              className={cn(
                "snap-start shrink-0 w-[4.75rem] min-h-16 rounded-xl border px-2 py-2.5 text-center transition-colors",
                active
                  ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700"
              )}
            >
              <span className={cn("block text-[10px] uppercase tracking-wider", active ? "opacity-70" : "text-zinc-400")}>
                {item.date === today ? "Today" : format(date, "EEE")}
              </span>
              <span className="mt-0.5 block text-lg font-semibold leading-none tabular-nums">{format(date, "d")}</span>
              <span className={cn("mt-1 block text-[10px]", active ? "opacity-70" : "text-zinc-400")}>
                {format(date, "MMM")} · {item.count}
              </span>
            </button>
          );
        })}
      </div>

      {showForm && (
        <section className="min-w-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Log a problem</h2>
          <LogForm
            form={form}
            setForm={setForm}
            topics={topics}
            duplicate={createDuplicate}
            submitting={submitting}
            submitLabel="Save problem"
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            listId="daily-topics-create"
          />
          {formError && !editingId && <p className="mt-3 text-sm text-red-500">{formError}</p>}
        </section>
      )}

      <section className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 break-words">{heading}</h2>
            <p className="text-sm text-zinc-500">
              {visible.length} {visible.length === 1 ? "problem" : "problems"}
              {personFilter !== "all" && entries.length !== visible.length ? ` of ${entries.length}` : ""}
            </p>
          </div>
          {byPerson.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setPersonFilter("all")}
                className={cn(
                  "min-h-10 px-3 rounded-full text-xs font-medium border",
                  personFilter === "all"
                    ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-500"
                )}
              >
                Everyone
              </button>
              {byPerson.map(([id, info]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPersonFilter(id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 min-h-10 max-w-full px-3 rounded-full text-xs font-medium border",
                    personFilter === id
                      ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
                  )}
                >
                  <span className={cn("w-4 h-4 rounded-full text-[9px] font-semibold text-white inline-flex items-center justify-center", personFilter === id ? "bg-white/20" : avatarColor(id))}>
                    {initials(info.name).slice(0, 1)}
                  </span>
                  {me?.id === id ? "You" : info.name} · {info.count}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 px-6 py-14 text-center">
            <p className="text-sm text-zinc-500">{emptyCopy}</p>
            {!search && personFilter === "all" && (
              <button
                type="button"
                onClick={openCreate}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                <Plus className="w-4 h-4" />
                Add a problem
              </button>
            )}
          </div>
        ) : (
          <ul className="space-y-2.5">
            {visible.map((entry) => {
              const open = expandedId === entry.id;
              const editedBySomeoneElse = Boolean(entry.updatedBy && entry.updatedBy !== entry.addedBy);
              const mine = me?.id === entry.addedBy;
              return (
                <li
                  key={entry.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm"
                >
                  <div className="flex">
                    <div className={cn("w-1 shrink-0", entry.difficulty ? DIFFICULTY_BAR[entry.difficulty] : "bg-zinc-200 dark:bg-zinc-700")} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 sm:gap-3 px-3 py-3 sm:px-4 sm:py-3.5">
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={() => {
                            if (editingId === entry.id) return;
                            setConfirmDeleteId(null);
                            setEditingId(null);
                            setExpandedId(open ? null : entry.id);
                          }}
                          className="flex-1 min-w-0 text-left"
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium break-words text-zinc-900 dark:text-zinc-50">{entry.title}</span>
                            {entry.difficulty && (
                              <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full border", DIFFICULTY_CLASS[entry.difficulty])}>
                                {entry.difficulty}
                              </span>
                            )}
                            {entry.topic && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                                {entry.topic}
                              </span>
                            )}
                          </div>
                          <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
                            <span className={cn("w-5 h-5 rounded-full text-[10px] font-semibold text-white inline-flex items-center justify-center", avatarColor(entry.addedBy))}>
                              {initials(entry.addedByName)}
                            </span>
                            {mine ? `${entry.addedByName} (you)` : entry.addedByName}
                            {search ? ` · ${formatLogDate(entry.logDate)}` : ""}
                            {editedBySomeoneElse ? ` · Edited by ${entry.updatedByName}` : ""}
                          </span>
                        </button>
                        <div className="flex items-center gap-1 shrink-0">
                          {entry.url && (
                            <a
                              href={entry.url}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Open ${entry.title}`}
                              className="inline-flex min-h-11 items-center gap-1 px-2.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
                            >
                              Open
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform", open && "rotate-180")} />
                        </div>
                      </div>

                      {open && (
                        <div className="px-3 pb-3 sm:px-4 sm:pb-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                          {editingId === entry.id ? (
                            <>
                              <LogForm
                                form={editForm}
                                setForm={setEditForm}
                                topics={topics}
                                duplicate={editDuplicate}
                                submitting={submitting}
                                submitLabel="Save changes"
                                onSubmit={handleEdit}
                                onCancel={() => setEditingId(null)}
                                listId="daily-topics-edit"
                              />
                              {formError && <p className="mt-3 text-sm text-red-500">{formError}</p>}
                            </>
                          ) : (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                <div className="min-w-0 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 p-3 sm:p-4">
                                  <h3 className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-2">Approach</h3>
                                  <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap break-words">{entry.approach}</p>
                                </div>
                                <div className="min-w-0 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 p-3 sm:p-4">
                                  <h3 className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-2">Hints and test cases</h3>
                                  <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap break-words">
                                    {entry.notes || "None yet."}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEdit(entry)}
                                  className="inline-flex min-h-11 items-center gap-1.5 px-3 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  Edit
                                </button>
                                {confirmDeleteId === entry.id ? (
                                  <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                                    <span className="text-zinc-500">Delete this problem?</span>
                                    <button type="button" onClick={() => handleDelete(entry.id)} className="min-h-11 font-medium text-red-600">
                                      Delete
                                    </button>
                                    <button type="button" onClick={() => setConfirmDeleteId(null)} className="min-h-11 font-medium text-zinc-500">
                                      Cancel
                                    </button>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(entry.id)}
                                    className="inline-flex min-h-11 items-center gap-1.5 px-3 text-xs font-medium rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
