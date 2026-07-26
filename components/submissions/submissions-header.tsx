"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search, RotateCw } from "lucide-react";

interface SubmissionsHeaderProps {
  username: string;
  realName: string;
  avatar: string;
  profileLoading: boolean;
  onBack: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  filterQuery: string;
  onFilterChange: (value: string) => void;
  isFilterDisabled: boolean;
}

export function SubmissionsHeader({
  username,
  realName,
  avatar,
  profileLoading,
  onBack,
  onRefresh,
  isLoading,
  filterQuery,
  onFilterChange,
  isFilterDisabled,
}: SubmissionsHeaderProps) {
  const [imgError, setImgError] = useState(false);

  const displayName = realName || username;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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

        {/* Avatar + name block */}
        {profileLoading ? (
          // Skeleton while profile loads
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <Skeleton className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="h-10 w-10 rounded-full shrink-0 overflow-hidden ring-2 ring-orange-400/30 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-500 dark:text-zinc-400">
              {!imgError && avatar ? (
                <Image
                  src={avatar}
                  alt={displayName}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                  onError={() => setImgError(true)}
                  unoptimized
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            {/* Name + username */}
            <div className="flex flex-col leading-tight">
              <h2 className="text-base font-bold font-heading text-zinc-900 dark:text-zinc-50 leading-snug">
                {displayName}
              </h2>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                @{username}
              </span>
            </div>
          </div>
        )}
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
