"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type StatCardTheme = "neutral" | "emerald" | "amber" | "rose";

interface StatCardProps {
  title: string;
  value: number | string | null;
  isLoading: boolean;
  icon?: React.ReactNode;
  theme?: StatCardTheme;
  className?: string;
}

export function StatCard({
  title,
  value,
  isLoading,
  icon,
  theme = "neutral",
  className,
}: StatCardProps) {
  // Theme definitions for borders, backgrounds, and texts
  const themeClasses = {
    neutral: {
      card: "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60",
      iconContainer: "bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400",
      value: "text-zinc-900 dark:text-zinc-50",
    },
    emerald: {
      card: "border-emerald-100/80 dark:border-emerald-950/30 bg-white dark:bg-zinc-900/60",
      iconContainer: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400",
      value: "text-emerald-600 dark:text-emerald-400",
    },
    amber: {
      card: "border-amber-100/80 dark:border-amber-950/30 bg-white dark:bg-zinc-900/60",
      iconContainer: "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400",
      value: "text-amber-600 dark:text-amber-400",
    },
    rose: {
      card: "border-rose-100/80 dark:border-rose-950/30 bg-white dark:bg-zinc-900/60",
      iconContainer: "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400",
      value: "text-rose-600 dark:text-rose-400",
    },
  };

  const activeTheme = themeClasses[theme];

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4.5 rounded-2xl border shadow-sm transition-all duration-300 backdrop-blur-md",
        activeTheme.card,
        className
      )}
    >
      <div className="space-y-1.5 flex-1 min-w-0">
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

      {icon && (
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", activeTheme.iconContainer)}>
          {icon}
        </div>
      )}
    </div>
  );
}
