"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Code2, ChevronDown, ChevronUp } from "lucide-react";
import { SubmissionDetail } from "@/components/submissions/submission-detail";
import { formatTimestamp } from "@/lib/format-timestamp";
import { cn } from "@/lib/utils";

interface SubmissionTableRowProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submission: any;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  isLoadingDetails: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: any | null;
}

/** Table-row variant rendered on md+ screens inside a proper <table>. */
export function SubmissionTableRow({
  submission,
  isExpanded,
  onToggle,
  isLoadingDetails,
  details,
}: SubmissionTableRowProps) {
  return (
    <React.Fragment>
      <tr
        onClick={() => onToggle(submission.id)}
        className={cn(
          "cursor-pointer transition-colors duration-150",
          isExpanded
            ? "bg-orange-500/[0.03] dark:bg-orange-500/[0.05]"
            : "hover:bg-zinc-50/80 dark:hover:bg-zinc-900/35"
        )}
      >
        {/* Title */}
        <td className="py-4 px-5 font-medium text-zinc-900 dark:text-zinc-100">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 dark:text-zinc-500 shrink-0">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </span>
            <Code2 className="h-4 w-4 text-orange-500/70 shrink-0" />
            <span className="truncate">{submission.title}</span>
          </div>
        </td>

        {/* Submitted At */}
        <td className="py-4 px-5 text-zinc-500 dark:text-zinc-400 text-xs whitespace-nowrap">
          {formatTimestamp(submission.timestamp)}
        </td>

        {/* Solve link */}
        <td className="py-4 px-5 text-right">
          <a
            href={`https://leetcode.com/problems/${submission.titleSlug}/`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg text-xs font-medium text-orange-500 hover:text-orange-600 hover:bg-orange-500/5 dark:hover:bg-orange-500/10 cursor-pointer inline-flex items-center gap-1"
            >
              <span>Solve</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
        </td>
      </tr>

      {/* Expandable detail row */}
      {isExpanded && (
        <tr className="bg-orange-500/[0.02] dark:bg-orange-500/[0.04]">
          <td
            colSpan={3}
            className="px-6 py-5 border-t border-zinc-100 dark:border-zinc-800/60"
          >
            <SubmissionDetail
              submissionId={submission.id}
              isLoading={isLoadingDetails}
              details={details}
            />
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}
