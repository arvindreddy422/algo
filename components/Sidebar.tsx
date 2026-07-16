"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bookmark, CheckCircle, BarChart, Settings, Moon, Sun, RotateCcw, Database, Layers, BookOpen, Search, Rss, HelpCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useSqlStore } from "@/store/useSqlStore";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Bookmarks", href: "/bookmarks", icon: Bookmark },
  { name: "Review", href: "/review", icon: RotateCcw },
  { name: "Completed", href: "/completed", icon: CheckCircle },
  { name: "Statistics", href: "/stats", icon: BarChart },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { problems } = useAppStore();
  const { sqlProblems } = useSqlStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const now = new Date();
  const dueReviewCount = problems.filter(
    (p) => p.status === 'solved' && p.reviewDate && new Date(p.reviewDate).getTime() <= now.getTime()
  ).length;

  const dueSqlReviewCount = sqlProblems.filter(
    (p) => p.status === 'solved' && p.reviewDate && new Date(p.reviewDate).getTime() <= now.getTime()
  ).length;

  return (
    <div className="w-64 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-full flex flex-col pt-6 pb-4">
      <div className="px-6 mb-8 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center">
          <span className="text-white dark:text-zinc-900 font-bold font-mono">D</span>
        </div>
        <span className="font-semibold text-lg tracking-tight">DSA Coach</span>
      </div>

      <nav className="flex-1 px-3 space-y-6 overflow-y-auto pb-4">
        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Algorithms</div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href) && !pathname.startsWith('/sql'));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                  {item.name === "Review" && dueReviewCount > 0 && (
                    <span className="ml-auto text-[10px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {dueReviewCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Databases</div>
          <div className="space-y-1">
            <Link
              href="/sql"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === "/sql" || pathname.startsWith("/sql/problem") || pathname === "/sql/prerequisites"
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
              )}
            >
              <Database className="w-4 h-4" />
              SQL Practice
            </Link>
            <Link
              href="/sql/review"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname.startsWith("/sql/review")
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
              )}
            >
              <RotateCcw className="w-4 h-4" />
              SQL Review
              {dueSqlReviewCount > 0 && (
                <span className="ml-auto text-[10px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {dueSqlReviewCount}
                </span>
              )}
            </Link>
            <Link
              href="/sql/bookmarks"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname.startsWith("/sql/bookmarks")
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
              )}
            >
              <Bookmark className="w-4 h-4" />
              SQL Bookmarks
            </Link>
            <Link
              href="/sql/completed"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname.startsWith("/sql/completed")
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
              )}
            >
              <CheckCircle className="w-4 h-4" />
              SQL Completed
            </Link>
          </div>
        </div>

        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mt-6">System Design</div>
          <div className="space-y-1">
            <Link
              href="/system-design"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === "/system-design"
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
              )}
            >
              <Layers className="w-4 h-4" />
              Today's Challenge
            </Link>
            <Link
              href="/system-design/curriculum"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname.startsWith("/system-design/curriculum")
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
              )}
            >
              <BookOpen className="w-4 h-4" />
              Curriculum
            </Link>
            <Link
              href="/system-design/topics"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname.startsWith("/system-design/topics")
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
              )}
            >
              <Search className="w-4 h-4" />
              Topic Explorer
            </Link>
            <Link
              href="/system-design/blog-feed"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname.startsWith("/system-design/blog-feed")
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
              )}
            >
              <Rss className="w-4 h-4" />
              Blog Feed
            </Link>
            <Link
              href="/system-design/interview-questions"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname.startsWith("/system-design/interview-questions")
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
              )}
            >
              <HelpCircle className="w-4 h-4" />
              Q&A Tracker
            </Link>
            <Link
              href="/system-design/progress"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname.startsWith("/system-design/progress")
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
              )}
            >
              <TrendingUp className="w-4 h-4" />
              Progress
            </Link>
          </div>
        </div>
      </nav>

      <div className="px-6 mt-auto">
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors py-2"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        )}
      </div>
    </div>
  );
}
