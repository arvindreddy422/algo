"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bookmark, CheckCircle, BarChart, Settings, Moon, Sun, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

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

  useEffect(() => {
    setMounted(true);
  }, []);

  const now = new Date();
  const dueReviewCount = problems.filter(
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

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
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
