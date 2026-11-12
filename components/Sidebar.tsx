"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Moon, Sun, ChevronLeft, ChevronRight, X, LogOut, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useSqlStore } from "@/store/useSqlStore";
import { countDue } from "@/features/study/schedule";
import { isNavItemActive, navGroups } from "@/features/nav";
import { logoutAction } from "@/app/actions/auth";

function NavContent({
  collapsed,
  isAdmin,
  onLinkClick,
}: {
  collapsed: boolean;
  isAdmin: boolean;
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { problems, isProblemsLoaded, dueCounts } = useAppStore();
  const { sqlProblems, isInitialized: sqlLoaded } = useSqlStore();

  useEffect(() => { setMounted(true); }, []);

  const badges = {
    "dsa-review": isProblemsLoaded ? countDue(problems) : dueCounts.dsa,
    "sql-review": sqlLoaded ? countDue(sqlProblems) : dueCounts.sql,
  };

  const linkClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors relative",
      active
        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
    );

  return (
    <>
      <div className={cn("mb-8 flex items-center gap-2", collapsed ? "px-3 justify-center" : "px-6")}>
        <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center flex-shrink-0">
          <span className="text-white dark:text-zinc-900 font-bold font-mono">D</span>
        </div>
        {!collapsed && (
          <span className="font-semibold text-lg tracking-tight whitespace-nowrap">DSA Coach</span>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-6 overflow-y-auto pb-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                {group.label}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isNavItemActive(item, pathname);
                const badge = item.badge ? badges[item.badge] : 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onLinkClick}
                    title={collapsed ? item.name : undefined}
                    className={cn(linkClass(active), collapsed && "justify-center px-2")}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        {item.name}
                        {badge > 0 && (
                          <span className="ml-auto text-[10px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                            {badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && badge > 0 && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-purple-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={cn("mt-auto border-t border-gray-100 dark:border-zinc-800 pt-3 space-y-1", collapsed ? "px-3" : "px-4")}>
        {isAdmin && (
          <Link
            href="/admin"
            onClick={onLinkClick}
            title={collapsed ? "Admin" : undefined}
            className={cn(linkClass(pathname.startsWith("/admin")), collapsed && "justify-center px-2")}
          >
            <Shield className="w-4 h-4 flex-shrink-0" />
            {!collapsed && "Admin"}
          </Link>
        )}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={collapsed ? (theme === "dark" ? "Light Mode" : "Dark Mode") : undefined}
            className={cn(
              "flex items-center gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors py-2 w-full rounded-md px-2 hover:bg-zinc-100 dark:hover:bg-zinc-800",
              collapsed && "justify-center px-0"
            )}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 flex-shrink-0" />}
            {!collapsed && (theme === "dark" ? "Light Mode" : "Dark Mode")}
          </button>
        )}

        <form action={logoutAction} className="w-full">
          <button
            type="submit"
            title={collapsed ? "Logout" : undefined}
            className={cn(
              "flex items-center gap-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors py-2 w-full rounded-md px-2",
              collapsed && "justify-center px-0"
            )}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && "Logout"}
          </button>
        </form>
      </div>
    </>
  );
}

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-zinc-900 dark:bg-white flex items-center justify-center">
            <span className="text-white dark:text-zinc-900 font-bold font-mono text-xs">D</span>
          </div>
          <span className="font-semibold text-base tracking-tight">DSA Coach</span>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          "md:hidden fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-zinc-900 flex flex-col pt-6 pb-4 shadow-2xl transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <NavContent collapsed={false} isAdmin={isAdmin} onLinkClick={() => setMobileOpen(false)} />
      </div>

      <div
        className={cn(
          "hidden md:flex flex-col h-full border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pt-6 pb-4 relative transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <NavContent collapsed={collapsed} isAdmin={isAdmin} />

        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-8 z-10 w-6 h-6 rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 shadow-sm transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </div>
    </>
  );
}
