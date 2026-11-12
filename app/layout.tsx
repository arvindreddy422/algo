import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LayoutShell } from "@/components/LayoutShell";
import { StoreProvider } from "@/components/StoreProvider";
import { getDueCounts, getUserStats } from "@/app/actions";
import { getSessionUser } from "@/lib/sessionUser";
import type { ProblemOrder } from "@/features/study/schedule";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Grind75 DSA Companion",
  description: "A distraction-free spaced repetition companion for DSA preparation.",
};

const emptyStats = {
  dailyGoal: 3,
  streak: 0,
  lastActiveDate: null as string | null,
  problemOrder: "EasyFirst" as ProblemOrder,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let stats = emptyStats;
  let dueCounts = { dsa: 0, sql: 0 };
  let isAdmin = false;

  try {
    const me = await getSessionUser();
    isAdmin = me?.role === "admin";
    if (me) {
      const [loadedStats, loadedCounts] = await Promise.all([getUserStats(), getDueCounts()]);
      stats = loadedStats;
      dueCounts = loadedCounts;
    }
  } catch (err) {
    console.error("Layout initialization error:", err);
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`antialiased bg-gray-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-50 flex h-screen overflow-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StoreProvider stats={stats} dueCounts={dueCounts}>
            <LayoutShell isAdmin={isAdmin}>{children}</LayoutShell>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
