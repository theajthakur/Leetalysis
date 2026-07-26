"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SubmissionRow } from "@/components/submissions/submission-row";
import { SubmissionTableRow } from "@/components/submissions/submission-table-row";

interface SubmissionsTableProps {
  isLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submissions: any[];
  expandedId: string | null;
  onRowToggle: (id: string) => void;
  detailsLoadingId: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  detailsCache: Record<string, any>;
}

export function SubmissionsTable({
  isLoading,
  submissions,
  expandedId,
  onRowToggle,
  detailsLoadingId,
  detailsCache,
}: SubmissionsTableProps) {
  const sharedRowProps = (sub: any) => ({
    submission: sub,
    isExpanded: expandedId === sub.id,
    onToggle: onRowToggle,
    isLoadingDetails: detailsLoadingId === sub.id,
    details: detailsCache[sub.id] ?? null,
  });

  /* ── MOBILE card list (< md) ───────────────────────────────────────────── */
  const mobileView = (
    <div className="flex md:hidden flex-col gap-2">
      {isLoading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="w-full rounded-2xl border border-zinc-200/70 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 px-5 py-4 flex flex-col gap-2.5"
          >
            <Skeleton className="h-4 w-56 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              <Skeleton className="h-7 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            </div>
          </div>
        ))
      ) : submissions.length > 0 ? (
        submissions.map((sub) => (
          <SubmissionRow key={sub.id} {...sharedRowProps(sub)} />
        ))
      ) : (
        <div className="w-full rounded-2xl border border-zinc-200/70 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 py-14 text-center text-sm text-zinc-400 dark:text-zinc-500">
          No matching submissions found.
        </div>
      )}
    </div>
  );

  /* ── DESKTOP table (≥ md) ──────────────────────────────────────────────── */
  const desktopView = (
    <div className="hidden md:block w-full rounded-2xl border border-zinc-200/80 dark:border-zinc-900/80 bg-white dark:bg-zinc-900/60 shadow-lg overflow-hidden backdrop-blur-md">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-200/60 dark:border-zinc-800/85 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            <th className="py-4 px-5">Problem Title</th>
            <th className="py-4 px-5 whitespace-nowrap">Submitted At</th>
            <th className="py-4 px-5 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/60 text-sm text-zinc-700 dark:text-zinc-300">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>
                <td className="py-5 px-5">
                  <Skeleton className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800" />
                </td>
                <td className="py-5 px-5">
                  <Skeleton className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800" />
                </td>
                <td className="py-5 px-5 text-right">
                  <Skeleton className="h-8 w-16 ml-auto bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                </td>
              </tr>
            ))
          ) : submissions.length > 0 ? (
            submissions.map((sub) => (
              <SubmissionTableRow key={sub.id} {...sharedRowProps(sub)} />
            ))
          ) : (
            <tr>
              <td
                colSpan={3}
                className="py-12 text-center text-zinc-400 dark:text-zinc-500"
              >
                No matching submissions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      {mobileView}
      {desktopView}
    </>
  );
}
