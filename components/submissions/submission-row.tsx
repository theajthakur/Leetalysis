"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Code2, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { SubmissionDetail } from "@/components/submissions/submission-detail";
import { formatTimestamp } from "@/lib/format-timestamp";
import { cn } from "@/lib/utils";

interface SubmissionRowProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submission: any;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  isLoadingDetails: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: any | null;
}

export function SubmissionRow({
  submission,
  isExpanded,
  onToggle,
  isLoadingDetails,
  details,
}: SubmissionRowProps) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border bg-white dark:bg-zinc-900/60 transition-all duration-200",
        isExpanded
          ? "border-orange-300/60 dark:border-orange-500/25 shadow-md shadow-orange-500/5"
          : "border-zinc-200/70 dark:border-zinc-800/60 hover:border-zinc-300/80 dark:hover:border-zinc-700/60 hover:shadow-sm"
      )}
    >
      {/* Clickable card header — div avoids nested <button> HTML violation */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onToggle(submission.id)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle(submission.id)}
        className="w-full text-left px-5 py-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/50 rounded-t-2xl"
      >
        {/* Row 1 — Title */}
        <div className="flex items-center gap-2 mb-2.5">
          <Code2 className="h-4 w-4 text-orange-500/80 shrink-0" />
          <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
            {submission.title}
          </span>
          <span className="ml-auto shrink-0 text-zinc-400 dark:text-zinc-500">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </span>
        </div>

        {/* Row 2 — Time badge + Solve link */}
        <div className="flex items-center gap-2.5">
          {/* Time badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 text-[11px] font-medium">
            <Clock className="h-3 w-3 shrink-0" />
            {formatTimestamp(submission.timestamp)}
          </span>

          {/* Solve link — stopPropagation so it doesn't toggle the row */}
          <a
            href={`https://leetcode.com/problems/${submission.titleSlug}/`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-3 rounded-lg text-[11px] font-semibold text-orange-500 hover:text-orange-600 hover:bg-orange-500/8 dark:hover:bg-orange-500/10 cursor-pointer inline-flex items-center gap-1 border border-orange-200/60 dark:border-orange-500/15"
            >
              <span>Solve</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
        </div>
      </div>

      {/* Expandable detail panel */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
          <SubmissionDetail
            submissionId={submission.id}
            isLoading={isLoadingDetails}
            details={details}
          />
        </div>
      )}
    </div>
  );
}
