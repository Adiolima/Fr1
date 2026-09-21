"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAssistenteDetalhe = /^\/assistentes\/[^/]+$/.test(pathname);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {!isAssistenteDetalhe && <Sidebar />}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
