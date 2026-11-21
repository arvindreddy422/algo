"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export function LayoutShell({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const isBarePage = pathname === "/login" || pathname === "/change-password";
  const isWhiteboard = pathname.startsWith("/whiteboard");

  if (isBarePage) {
    return <div className="w-full h-screen overflow-auto">{children}</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar isAdmin={isAdmin} />
      <main
        className={
          isWhiteboard
            ? "flex min-h-0 min-w-0 flex-1 flex-col h-full pt-14 md:pt-0"
            : "flex-1 min-w-0 overflow-y-auto w-full h-full p-4 md:p-6 lg:p-8 pt-[calc(1rem+3.5rem)] md:pt-6 lg:pt-8"
        }
      >
        {isWhiteboard ? (
          children
        ) : (
          <div className="max-w-5xl mx-auto min-w-0">{children}</div>
        )}
      </main>
    </div>
  );
}
