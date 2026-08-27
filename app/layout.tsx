import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LayoutShell } from "@/components/LayoutShell";
import { StoreProvider } from "@/components/StoreProvider";
import { getProblems, getUserStats, getSqlProblems, getSqlPrerequisites } from "@/app/actions";
import { initDb } from "@/db/init";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Grind75 DSA Companion",
  description: "A distraction-free spaced repetition companion for DSA preparation.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let problems: any[] = [];
  let sqlProblems: any[] = [];
  let sqlPrerequisites: any[] = [];
  let stats: any = { dailyGoal: 3, streak: 0 };

  try {
    await initDb();
    problems = await getProblems();
    sqlProblems = await getSqlProblems();
    sqlPrerequisites = await getSqlPrerequisites();
    stats = await getUserStats();
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
          <StoreProvider
            problems={problems as any}
            sqlProblems={sqlProblems as any}
            sqlPrerequisites={sqlPrerequisites as any}
            stats={stats}
          >
            <LayoutShell>{children}</LayoutShell>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
