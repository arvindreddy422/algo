"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <div className="w-full h-screen overflow-auto">{children}</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full h-full p-4 md:p-8 pt-[calc(1rem+3.5rem)] md:pt-8">
        <div className="max-w-5xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
