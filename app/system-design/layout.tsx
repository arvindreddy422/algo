"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Layers, BookOpen, Search, Rss, HelpCircle, TrendingUp } from 'lucide-react';

const tabs = [
  { name: "Today's Challenge", href: "/system-design", icon: Layers },
  { name: "Curriculum", href: "/system-design/curriculum", icon: BookOpen },
  { name: "Topics", href: "/system-design/topics", icon: Search },
  { name: "Blog Feed", href: "/system-design/blog-feed", icon: Rss },
  { name: "Interviews", href: "/system-design/interview-questions", icon: HelpCircle },
  { name: "Progress", href: "/system-design/progress", icon: TrendingUp },
];

export default function SystemDesignLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-8 animate-pulse">Loading System Design...</div>;

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col pt-4 sm:pt-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
          System Design Hub
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
            PRO
          </span>
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">Master large-scale architecture and ace your backend interviews.</p>
      </div>

      <nav className="flex overflow-x-auto pb-1 mb-6 border-b border-zinc-200 dark:border-zinc-800 hide-scrollbar shrink-0">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2",
                  isActive
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10"
                    : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                )}
              >
                <tab.icon className={cn("w-4 h-4", isActive ? "text-indigo-500 dark:text-indigo-400" : "text-zinc-400")} />
                {tab.name}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-12">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
          {children}
        </div>
      </div>
    </div>
  );
}
