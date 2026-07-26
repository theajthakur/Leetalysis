"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { CopyButton } from "@/components/submissions/copy-button";
import { cn } from "@/lib/utils";

interface SubmissionDetailProps {
  submissionId: string;
  isLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: any | null;
}

export function SubmissionDetail({
  isLoading,
  details,
}: SubmissionDetailProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse p-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800" />
          <Skeleton className="h-5 w-28 bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Skeleton className="h-10 w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          <Skeleton className="h-10 w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        </div>
        <Skeleton className="h-28 w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
      </div>
    );
  }

  if (!details) return null;

  if (details.error) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/10 dark:border-red-500/20 bg-red-500/5 text-xs text-red-650 dark:text-red-400">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-zinc-900 dark:text-zinc-100 font-heading">
            Could Not Retrieve Submission Details
          </p>
          <p className="leading-relaxed">
            LeetCode&apos;s submission details (including code and metrics) are private. Please verify that your{" "}
            <code className="px-1 py-0.5 bg-red-500/10 dark:bg-red-550/20 rounded font-mono font-bold text-red-600 dark:text-red-400">
              LEETCODE_COOKIE
            </code>{" "}
            is correctly configured and active inside your local environment configuration (e.g. <code className="font-mono">.env</code>).
          </p>
        </div>
      </div>
    );
  }

  const isSuccess =
    details.statusCode === 10 &&
    (!details.totalTestcases || details.totalCorrect === details.totalTestcases) &&
    !details.compileError &&
    !details.runtimeError;

  return (
    <div
      className={cn(
        "p-4 rounded-xl border transition-all duration-300 text-left",
        isSuccess
          ? "border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/10 text-emerald-850 dark:text-emerald-300"
          : "border-red-500/20 bg-red-500/5 dark:bg-red-950/10 text-red-850 dark:text-red-300"
      )}
    >
      {/* Status header & badges */}
      <div className="flex flex-wrap items-center gap-3.5 mb-4">
        <span
          className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs",
            isSuccess
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-450"
              : "bg-red-500/15 text-red-650 dark:text-red-400"
          )}
        >
          {isSuccess ? "Success" : "Failed / Wrong Answer"}
        </span>

        <span className="text-[11px] bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 px-2.5 py-1 rounded-full font-semibold">
          Lang: {details.lang?.verboseName || details.lang?.name || "Unknown"}
        </span>

        {details.totalTestcases !== undefined && details.totalTestcases > 0 && (
          <span
            className={cn(
              "text-[11px] px-2.5 py-1 rounded-full font-semibold",
              isSuccess
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-450"
                : "bg-red-500/15 text-red-650 dark:text-red-400"
            )}
          >
            Testcases Passed: {details.totalCorrect || 0} / {details.totalTestcases || 0}
          </span>
        )}
      </div>

      {/* Runtime and Memory Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="flex items-center justify-between p-3 bg-white/40 dark:bg-zinc-900/40 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 text-xs">
          <span className="text-zinc-400 dark:text-zinc-500 font-medium">Runtime:</span>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-zinc-800 dark:text-zinc-100">
              {details.runtimeDisplay || `${details.runtime} ms`}
            </span>
            {details.runtimePercentile !== undefined && details.runtimePercentile !== null && (
              <span className="text-emerald-500 dark:text-emerald-400 text-[10px] font-medium ml-1">
                (Beats {details.runtimePercentile.toFixed(1)}%)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-white/40 dark:bg-zinc-900/40 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 text-xs">
          <span className="text-zinc-400 dark:text-zinc-500 font-medium">Memory:</span>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-zinc-800 dark:text-zinc-100">
              {details.memoryDisplay || `${(details.memory / 1000000).toFixed(1)} MB`}
            </span>
            {details.memoryPercentile !== undefined && details.memoryPercentile !== null && (
              <span className="text-emerald-500 dark:text-emerald-400 text-[10px] font-medium ml-1">
                (Beats {details.memoryPercentile.toFixed(1)}%)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {details.notes && (
        <div className="mb-4 p-3 bg-zinc-100/70 dark:bg-zinc-800/40 rounded-xl text-xs text-zinc-655 dark:text-zinc-450 border border-zinc-200/30 dark:border-zinc-800/30">
          <span className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Notes:</span>
          <pre className="font-sans whitespace-pre-wrap leading-relaxed">{details.notes}</pre>
        </div>
      )}

      {/* Compile Error */}
      {details.compileError && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-655 dark:text-red-405 font-mono max-h-36 leading-relaxed">
          <span className="font-bold block mb-1 text-red-700 dark:text-red-400">Compile Error:</span>
          <pre className="whitespace-pre-wrap break-all">{details.compileError}</pre>
        </div>
      )}

      {/* Runtime Error */}
      {details.runtimeError && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-655 dark:text-red-405 font-mono max-h-36 leading-relaxed">
          <span className="font-bold block mb-1 text-red-700 dark:text-red-400">Runtime Error:</span>
          <pre className="whitespace-pre-wrap break-all">{details.runtimeError}</pre>
        </div>
      )}

      {/* Code Snippet */}
      {details.code && (
        <div className="relative mt-2">
          <div className="absolute right-3 top-3 z-10">
            <CopyButton text={details.code} />
          </div>
          <div className="overflow-auto max-h-80 rounded-xl border border-zinc-800/60 bg-zinc-950">
            <pre className="p-4 bg-zinc-950 text-zinc-100 font-mono text-xs leading-relaxed select-all w-max min-w-full">
              <code>{details.code}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
