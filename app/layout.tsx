import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Sidebar } from "@/components/Sidebar";
import { StoreProvider } from "@/components/StoreProvider";
import { getProblems, getUserStats } from "@/app/actions";
import { initDb } from "@/db/init";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Grind75 DSA Companion",
  description: "A distraction-free spaced repetition companion for DSA preparation.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await initDb();
  const problems = await getProblems();
  const stats = await getUserStats();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased bg-gray-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-50 flex h-screen overflow-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StoreProvider problems={problems as any} stats={stats}>
            <Sidebar />
            <main className="flex-1 overflow-y-auto w-full h-full p-4 md:p-8">
              <div className="max-w-5xl mx-auto h-full">
                {children}
              </div>
            </main>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
