"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, RotateCw, User, Award } from "lucide-react";
import { findStudentByHandle } from "@/lib/local-students";

interface SubmissionsHeaderProps {
  username: string;
  onBack: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  filterQuery: string;
  onFilterChange: (value: string) => void;
  isFilterDisabled: boolean;
  rollNumber?: string;
}

export function SubmissionsHeader({
  username,
  onBack,
  onRefresh,
  isLoading,
  filterQuery,
  onFilterChange,
  isFilterDisabled,
  rollNumber: propRollNumber,
}: SubmissionsHeaderProps) {
  // Check if student exists in localStorage
  const localStudent = useMemo(() => findStudentByHandle(username), [username]);

  const name = localStudent?.name;
  const rollNumber = propRollNumber || localStudent?.rollNumber;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 mb-8">
      {/* Back button + identity */}
      <div className="flex items-center gap-3.5">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer h-10 w-10 shrink-0 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Identity block */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center shrink-0">
            {name ? <User className="h-5 w-5" /> : <Award className="h-5 w-5" />}
          </div>

          <div className="flex flex-col leading-tight">
            <h2 className="text-base font-bold font-heading text-zinc-900 dark:text-zinc-50 leading-snug">
              {name || `@${username}`}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {name ? `@${username}` : "Live LeetCode profile analytics feed"}
              </span>
              {rollNumber && (
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-500/20">
                  {rollNumber}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search bar & Refresh */}
      <div className="flex items-center gap-2.5 max-w-sm w-full">
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
          <Input
            type="text"
            placeholder="Filter by problem title..."
            value={filterQuery}
            onChange={(e) => onFilterChange(e.target.value)}
            disabled={isFilterDisabled}
            className="w-full pl-9 pr-3 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none text-xs md:text-sm"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-50"
          title="Refresh results"
        >
          <RotateCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </div>
  );
}
