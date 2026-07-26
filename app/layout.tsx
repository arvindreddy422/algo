import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Sidebar } from "@/components/Sidebar";
import { StoreProvider } from "@/components/StoreProvider";
import { SessionProvider } from "next-auth/react";
import { getProblems, getUserStats, getSqlProblems, getSqlPrerequisites } from "@/app/actions";
import { initDb } from "@/db/init";
import { auth } from "@/auth";

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
  let session = null;
  let problems: any[] = [];
  let sqlProblems: any[] = [];
  let sqlPrerequisites: any[] = [];
  let stats: any = { dailyGoal: 3, streak: 0 };

  try {
    await initDb();
    session = await auth();
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
        <SessionProvider session={session}>
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
              {session ? (
                <>
                  <Sidebar />
                  <main className="flex-1 overflow-y-auto w-full h-full p-4 md:p-8 pt-[calc(1rem+3.5rem)] md:pt-8">
                    <div className="max-w-5xl mx-auto h-full">
                      {children}
                    </div>
                  </main>
                </>
              ) : (
                <main className="flex-1 overflow-y-auto w-full h-full">
                  {children}
                </main>
              )}
            </StoreProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
