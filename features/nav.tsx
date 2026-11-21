import type { LucideIcon } from "lucide-react";
import {
  Home,
  Bookmark,
  CheckCircle,
  BarChart,
  Settings,
  RotateCcw,
  Database,
  PenLine,
  NotebookPen,
} from "lucide-react";

export type NavBadge = "dsa-review" | "sql-review";

export type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: NavBadge;
  isActive?: (pathname: string) => boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Algorithms",
    items: [
      { name: "Dashboard", href: "/", icon: Home, isActive: (pathname) => pathname === "/" },
      { name: "Bookmarks", href: "/bookmarks", icon: Bookmark },
      { name: "Review", href: "/review", icon: RotateCcw, badge: "dsa-review" },
      { name: "Completed", href: "/completed", icon: CheckCircle },
      { name: "Statistics", href: "/stats", icon: BarChart },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
  {
    label: "Databases",
    items: [
      {
        name: "SQL Practice",
        href: "/sql",
        icon: Database,
        isActive: (pathname) => pathname === "/sql" || pathname.startsWith("/sql/problem") || pathname === "/sql/prerequisites",
      },
      { name: "SQL Review", href: "/sql/review", icon: RotateCcw, badge: "sql-review", isActive: (pathname) => pathname.startsWith("/sql/review") },
      { name: "SQL Bookmarks", href: "/sql/bookmarks", icon: Bookmark, isActive: (pathname) => pathname.startsWith("/sql/bookmarks") },
      { name: "SQL Completed", href: "/sql/completed", icon: CheckCircle, isActive: (pathname) => pathname.startsWith("/sql/completed") },
    ],
  },
  {
    label: "Practice Hub",
    items: [
      { name: "Whiteboard", href: "/whiteboard", icon: PenLine, isActive: (pathname) => pathname.startsWith("/whiteboard") },
    ],
  },
  {
    label: "Productivity",
    items: [
      { name: "Daily", href: "/daily", icon: NotebookPen, isActive: (pathname) => pathname.startsWith("/daily") },
    ],
  },
];

export function isNavItemActive(item: NavItem, pathname: string) {
  if (item.isActive) return item.isActive(pathname);
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
