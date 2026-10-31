"use client";

import { useSession } from "next-auth/react";
import { Shield, Sparkles, Bell, Wifi } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export default function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="h-16 px-6 bg-theme-surface border-b border-theme-border flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-bold text-theme-fg">Management Portal</h2>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-theme-success/15 text-theme-success text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-theme-success animate-pulse" />
          <span>Production Ready</span>
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <ThemeToggle />

        {session?.user && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-theme-bg border border-theme-border">
            <Shield className="w-3.5 h-3.5 text-theme-primary" />
            <span className="font-semibold text-theme-fg capitalize">
              Role: {(session.user as any).role || "admin"}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

