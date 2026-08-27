"use client";

import { useEffect, useState, useCallback } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isToday, parseISO, addDays } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, X, Check, Trash2, RotateCcw, Edit3, Save } from "lucide-react";
import { cn } from "@/lib/utils";

type Todo = {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  status: "pending" | "in_progress" | "review" | "completed";
  priority: "low" | "medium" | "high";
  category: string;
  dueDate: string | null;
  revisionDate: string | null;
  createdAt: string;
  updatedAt: string;
};

const PRIORITY_COLOR = {
  low: "bg-blue-500",
  medium: "bg-amber-500",
  high: "bg-red-500",
};

const REVISION_OPTIONS = [
  { label: "3 Days", days: 3 },
  { label: "7 Days", days: 7 },
  { label: "10 Days", days: 10 },
  { label: "Custom", days: -1 },
];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showRevision, setShowRevision] = useState(false);
  const [customRevDate, setCustomRevDate] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [newCategory, setNewCategory] = useState("General");
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  const fetchTodos = useCallback(async () => {
    const res = await fetch("/api/todos");
    if (res.ok) setTodos(await res.json());
  }, []);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startPad = startOfMonth(currentMonth).getDay();

  const todosForDay = (date: Date) =>
    todos.filter(t =>
      (t.dueDate && isSameDay(parseISO(t.dueDate), date)) ||
      (t.revisionDate && isSameDay(parseISO(t.revisionDate), date))
    );

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedTodo(null);
    setShowCreate(false);
    setShowRevision(false);
    setEditMode(false);
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !selectedDate) return;
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle.trim(),
        priority: newPriority,
        category: newCategory,
        dueDate: format(selectedDate, "yyyy-MM-dd"),
        status: "pending",
      }),
    });
    setNewTitle(""); setShowCreate(false);
    fetchTodos();
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    setSelectedTodo(null);
    fetchTodos();
  };

  const handleComplete = (todo: Todo) => {
    setSelectedTodo(todo);
    setShowRevision(true);
    setCustomRevDate(format(addDays(new Date(), 7), "yyyy-MM-dd"));
  };

  const handleRevisionSave = async (days: number, customDate?: string) => {
    if (!selectedTodo) return;
    const revDate = days === -1 ? customDate! : format(addDays(new Date(), days), "yyyy-MM-dd");
    await fetch(`/api/todos/${selectedTodo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "review", completed: true, revisionDate: revDate }),
    });
    setShowRevision(false); setSelectedTodo(null);
    fetchTodos();
  };

  const handleRevisionNoSchedule = async () => {
    if (!selectedTodo) return;
    await fetch(`/api/todos/${selectedTodo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed", completed: true }),
    });
    setShowRevision(false); setSelectedTodo(null);
    fetchTodos();
  };

  const handleSaveEdit = async () => {
    if (!selectedTodo || !editTitle.trim()) return;
    await fetch(`/api/todos/${selectedTodo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle.trim() }),
    });
    setEditMode(false);
    fetchTodos();
    setSelectedTodo(prev => prev ? { ...prev, title: editTitle.trim() } : null);
  };

  const dayTodos = selectedDate ? todosForDay(selectedDate) : [];

  return (
    <div className="py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Calendar</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Click a day to view, create, or complete tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-sm min-w-[130px] text-center">{format(currentMonth, "MMMM yyyy")}</span>
          <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-zinc-100 dark:border-zinc-800">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} className="py-3 text-center text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{d}</div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7">
            {Array.from({ length: startPad }).map((_, i) => (
              <div key={`pad-${i}`} className="min-h-[90px] border-b border-r border-zinc-50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50" />
            ))}
            {days.map((day) => {
              const dayTasks = todosForDay(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const today = isToday(day);
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "min-h-[90px] p-2 border-b border-r border-zinc-100 dark:border-zinc-800/60 cursor-pointer transition-all hover:bg-violet-50/50 dark:hover:bg-violet-900/10",
                    isSelected && "bg-violet-50 dark:bg-violet-900/20 ring-2 ring-inset ring-violet-400",
                    !isSameMonth(day, currentMonth) && "opacity-40"
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold mb-1",
                    today && "bg-violet-600 text-white",
                    isSelected && !today && "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300"
                  )}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, 3).map(t => (
                      <div
                        key={t.id}
                        className={cn(
                          "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium truncate",
                          t.revisionDate && isSameDay(parseISO(t.revisionDate), day)
                            ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300"
                            : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                        )}
                      >
                        <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", PRIORITY_COLOR[t.priority])} />
                        <span className="truncate">{t.title}</span>
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-[10px] text-zinc-400 pl-1">+{dayTasks.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5 space-y-4 h-fit">
          {selectedDate ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400 font-medium">{format(selectedDate, "EEEE")}</p>
                  <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50">{format(selectedDate, "MMMM d, yyyy")}</h2>
                </div>
                <button onClick={() => { setShowCreate(v => !v); setSelectedTodo(null); setShowRevision(false); }}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-md transition-all">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Create form */}
              {showCreate && (
                <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Task title…"
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    onKeyDown={e => e.key === "Enter" && handleCreate()}
                  />
                  <div className="flex gap-2">
                    <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
                      className="flex-1 px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none">
                      {["General","DSA","SQL","System Design","Projects"].map(c => <option key={c}>{c}</option>)}
                    </select>
                    <select value={newPriority} onChange={e => setNewPriority(e.target.value as any)}
                      className="flex-1 px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowCreate(false)} className="flex-1 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 transition-colors">Cancel</button>
                    <button onClick={handleCreate} disabled={!newTitle.trim()}
                      className="flex-1 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors">
                      Add Task
                    </button>
                  </div>
                </div>
              )}

              {/* Task list */}
              {dayTodos.length === 0 && !showCreate ? (
                <div className="text-center py-8 text-zinc-400">
                  <p className="text-sm">No tasks on this day</p>
                  <p className="text-xs mt-1">Click + to add one</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {dayTodos.map(todo => (
                    <div key={todo.id}
                      className={cn("rounded-2xl border p-3 cursor-pointer transition-all hover:shadow-sm",
                        selectedTodo?.id === todo.id ? "border-violet-400 bg-violet-50/50 dark:bg-violet-900/10" : "border-zinc-100 dark:border-zinc-800",
                        todo.completed && "opacity-60"
                      )}
                      onClick={() => { setSelectedTodo(t => t?.id === todo.id ? null : todo); setShowRevision(false); setEditMode(false); }}
                    >
                      <div className="flex items-start gap-2">
                        <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", PRIORITY_COLOR[todo.priority])} />
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate", todo.completed && "line-through text-zinc-400")}>{todo.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-zinc-400">{todo.category}</span>
                            {todo.revisionDate && isSameDay(parseISO(todo.revisionDate), selectedDate!) && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/40 text-violet-600 rounded-full font-medium">Revision</span>
                            )}
                            {todo.dueDate && isSameDay(parseISO(todo.dueDate), selectedDate!) && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-full font-medium">Due</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded actions */}
                      {selectedTodo?.id === todo.id && !showRevision && (
                        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2 animate-in fade-in duration-150">
                          {editMode ? (
                            <div className="flex gap-2">
                              <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                                className="flex-1 px-2 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                                onKeyDown={e => e.key === "Enter" && handleSaveEdit()}
                                autoFocus
                              />
                              <button onClick={handleSaveEdit} className="p-1.5 bg-emerald-500 text-white rounded-lg"><Save className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setEditMode(false)} className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              {!todo.completed && (
                                <button onClick={(e) => { e.stopPropagation(); handleComplete(todo); }}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl transition-colors">
                                  <Check className="w-3.5 h-3.5" /> Done
                                </button>
                              )}
                              {todo.completed && (
                                <button onClick={(e) => { e.stopPropagation(); handleComplete(todo); }}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-violet-500 hover:bg-violet-400 text-white text-xs font-bold rounded-xl transition-colors">
                                  <RotateCcw className="w-3.5 h-3.5" /> Re-schedule
                                </button>
                              )}
                              <button onClick={(e) => { e.stopPropagation(); setEditMode(true); setEditTitle(todo.title); }}
                                className="p-1.5 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(todo.id); }}
                                className="p-1.5 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Revision scheduler */}
                      {selectedTodo?.id === todo.id && showRevision && (
                        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3 animate-in fade-in duration-150">
                          <p className="text-xs font-semibold text-zinc-500">Schedule next revision from today:</p>
                          <div className="grid grid-cols-3 gap-1.5">
                            {REVISION_OPTIONS.slice(0, 3).map(opt => (
                              <button key={opt.days} onClick={() => handleRevisionSave(opt.days)}
                                className="py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-colors">
                                {opt.label}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2 items-center">
                            <input type="date" value={customRevDate} onChange={e => setCustomRevDate(e.target.value)}
                              className="flex-1 px-2 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                            <button onClick={() => handleRevisionSave(-1, customRevDate)}
                              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-colors">
                              Set
                            </button>
                          </div>
                          <button onClick={handleRevisionNoSchedule}
                            className="w-full py-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                            Mark done without revision
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-zinc-400">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
                <ChevronRight className="w-7 h-7 text-violet-400" />
              </div>
              <p className="text-sm font-medium">Select a day</p>
              <p className="text-xs mt-1">Click any date to view or add tasks</p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-xs text-zinc-400">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-900/40" /><span>Due date</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-violet-100 dark:bg-violet-900/40" /><span>Revision scheduled</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /><span>High priority</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /><span>Medium</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /><span>Low</span></div>
      </div>
    </div>
  );
}
