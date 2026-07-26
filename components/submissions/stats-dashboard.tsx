"use client";

import React from "react";
import { StatCard } from "@/components/stat-card";
import { AlertCircle, Trophy, Zap, Activity, Sparkles } from "lucide-react";

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
}

export function StatsDashboard({ stats, isLoading, error }: StatsDashboardProps) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Solved"
          value={stats.total}
          isLoading={isLoading}
          theme="neutral"
          icon={<Trophy className="h-5 w-5" />}
        />
        <StatCard
          title="Easy Solved"
          value={stats.easy}
          isLoading={isLoading}
          theme="emerald"
          icon={<Zap className="h-5 w-5" />}
        />
        <StatCard
          title="Medium Solved"
          value={stats.medium}
          isLoading={isLoading}
          theme="amber"
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard
          title="Hard Solved"
          value={stats.hard}
          isLoading={isLoading}
          theme="rose"
          icon={<Sparkles className="h-5 w-5" />}
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
