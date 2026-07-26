"use client";

import React from "react";
import { StatCard } from "@/components/stat-card";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SolvedStats {
  easy: number;
  medium: number;
  hard: number;
  total: number;
}

interface StatsDashboardProps {
  stats: SolvedStats;
  isLoading: boolean;
  error: string;
  isSidebarOpen?: boolean;
}

export function StatsDashboard({
  stats,
  isLoading,
  error,
  isSidebarOpen = false,
}: StatsDashboardProps) {
  return (
    <>
      <div
        className={cn(
          "grid gap-4 mb-8 transition-all duration-300",
          isSidebarOpen ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 md:grid-cols-4"
        )}
      >
        <StatCard
          title="Total Solved"
          value={stats.total}
          isLoading={isLoading}
          theme="neutral"
        />
        <StatCard
          title="Easy Solved"
          value={stats.easy}
          isLoading={isLoading}
          theme="emerald"
        />
        <StatCard
          title="Medium Solved"
          value={stats.medium}
          isLoading={isLoading}
          theme="amber"
        />
        <StatCard
          title="Hard Solved"
          value={stats.hard}
          isLoading={isLoading}
          theme="rose"
        />
      </div>

      {error && !isLoading && (
        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mb-4 px-4 py-2.5 rounded-xl border border-amber-500/15 bg-amber-500/5">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>Stats unavailable: {error}</span>
        </div>
      )}
    </>
  );
}
