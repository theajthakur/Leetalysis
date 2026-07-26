"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type StatCardTheme = "neutral" | "emerald" | "amber" | "rose";

interface StatCardProps {
  title: string;
  value: number | string | null;
  isLoading: boolean;
  theme?: StatCardTheme;
  className?: string;
}

export function StatCard({
  title,
  value,
  isLoading,
  theme = "neutral",
  className,
}: StatCardProps) {
  const themeClasses = {
    neutral: {
      card: "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60",
      value: "text-zinc-900 dark:text-zinc-50",
      circleContainer: "bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200/60 dark:border-zinc-700/50",
      circleDot: "bg-zinc-400 dark:bg-zinc-500",
    },
    emerald: {
      card: "border-emerald-100 dark:border-emerald-950/40 bg-white dark:bg-zinc-900/60",
      value: "text-emerald-600 dark:text-emerald-400",
      circleContainer: "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/20",
      circleDot: "bg-emerald-500",
    },
    amber: {
      card: "border-amber-100 dark:border-amber-950/40 bg-white dark:bg-zinc-900/60",
      value: "text-amber-600 dark:text-amber-400",
      circleContainer: "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/20",
      circleDot: "bg-amber-500",
    },
    rose: {
      card: "border-rose-100 dark:border-rose-950/40 bg-white dark:bg-zinc-900/60",
      value: "text-rose-600 dark:text-rose-400",
      circleContainer: "bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/20",
      circleDot: "bg-rose-500",
    },
  };

  const activeTheme = themeClasses[theme];

  return (
    <div
      className={cn(
        "relative overflow-hidden flex items-center justify-between p-4.5 rounded-2xl border shadow-sm transition-all duration-300 backdrop-blur-md",
        activeTheme.card,
        className
      )}
    >
      <div className="space-y-1.5 flex-1 min-w-0 z-10">
        <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 truncate uppercase tracking-wider">
          {title}
        </p>

        {isLoading ? (
          <Skeleton className="h-7 w-16 bg-zinc-200 dark:bg-zinc-800" />
        ) : (
          <h3 className={cn("text-2xl font-bold font-heading truncate", activeTheme.value)}>
            {value ?? 0}
          </h3>
        )}
      </div>

      {/* Styled low-opacity circle accent portion */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-transform duration-300 group-hover:scale-105",
          activeTheme.circleContainer
        )}
      >
        <div className={cn("h-2.5 w-2.5 rounded-full opacity-60", activeTheme.circleDot)} />
      </div>
    </div>
  );
}
