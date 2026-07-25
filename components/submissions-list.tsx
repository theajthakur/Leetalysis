"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/stat-card";
import { useQueryState } from "nuqs";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ExternalLink,
  Search,
  Award,
  RotateCw,
  AlertCircle,
  Code2,
  Trophy,
  Zap,
  Activity,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";

/**
 * Formats epoch seconds into a custom human-readable string.
 * - Today: "Today 4:36PM" (no space before AM/PM)
 * - Yesterday: "Yesterday 2:31 AM" (has space)
 * - Other: "02 June, 26 - 08:47AM" (no space)
 */
export function formatTimestamp(timestampStr: string): string {
  const timestampMs = parseInt(timestampStr, 10) * 1000;
  const date = new Date(timestampMs);
  const now = new Date();

  const dateYear = date.getFullYear();
  const dateMonth = date.getMonth();
  const dateDate = date.getDate();

  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth();
  const nowDate = now.getDate();

  // Check if today
  const isToday = dateYear === nowYear && dateMonth === nowMonth && dateDate === nowDate;

  // Check if yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    dateYear === yesterday.getFullYear() &&
    dateMonth === yesterday.getMonth() &&
    dateDate === yesterday.getDate();

  // Generate time components: hh:mm
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour is 12
  const minutesStr = String(minutes).padStart(2, "0");

  if (isToday) {
    // Today 4:36PM (no space)
    return `Today ${hours}:${minutesStr}${ampm}`;
  } else if (isYesterday) {
    // Yesterday 2:31 AM (space)
    return `Yesterday ${hours}:${minutesStr} ${ampm}`;
  } else {
    // 02 June, 26 - 08:47AM (no space)
    const dayStr = String(dateDate).padStart(2, "0");
    const fullMonths = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthStr = fullMonths[dateMonth];
    const yearStr = String(dateYear).slice(-2);
    return `${dayStr} ${monthStr}, ${yearStr} - ${hours}:${minutesStr}${ampm}`;
  }
}

/**
 * Reusable Copy Button component with status feedback.
 */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="xs"
      onClick={handleCopy}
      className="h-7 px-2.5 rounded-lg text-[10px] font-medium bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
    >
      {copied ? "Copied!" : "Copy Code"}
    </Button>
  );
}

interface SubmissionsListProps {
  username: string;
  onBack: () => void;
}

export function SubmissionsList({ username, onBack }: SubmissionsListProps) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [solvedStats, setSolvedStats] = useState<{
    easy: number;
    medium: number;
    hard: number;
    total: number;
  }>({ easy: 0, medium: 0, hard: 0, total: 0 });

  // Independent loading/error states per data type
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [submissionsError, setSubmissionsError] = useState("");
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const [filterQuery, setFilterQuery] = useState("");

  // States for row expansion mapped to URL search query state
  const [expandedId, setExpandedId] = useQueryState("submission");
  const [detailsCache, setDetailsCache] = useState<Record<string, any>>({});
  const [detailsLoadingId, setDetailsLoadingId] = useState<string | null>(null);

  const fetchData = async () => {
    setSubmissionsLoading(true);
    setStatsLoading(true);
    setSubmissionsError("");
    setStatsError("");
    setExpandedId(null);

    // Fire both fetches independently in parallel
    const [subsRes, statsRes] = await Promise.allSettled([
      fetch(`/api/leetcode?username=${encodeURIComponent(username)}&type=submissions`),
      fetch(`/api/leetcode?username=${encodeURIComponent(username)}&type=stats`),
    ]);

    // ── Handle submissions ────────────────────────────────────────────────
    try {
      if (subsRes.status === "rejected") throw new Error(subsRes.reason?.message || "Network error");
      const res = subsRes.value;
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const result = await res.json();
      const list = result?.data?.recentAcSubmissionList;
      if (list && Array.isArray(list) && list.length > 0) {
        setSubmissions(list);
      } else if (result?.errors?.length) {
        throw new Error(result.errors.map((e: any) => e.message).join(", "));
      } else {
        throw new Error("We can't see submissions yet. Please verify the username or check your LEETCODE_COOKIE in .env.");
      }
    } catch (err: any) {
      setSubmissionsError(err.message || "Failed to load submissions.");
    } finally {
      setSubmissionsLoading(false);
    }

    // ── Handle stats ──────────────────────────────────────────────────────
    try {
      if (statsRes.status === "rejected") throw new Error(statsRes.reason?.message || "Network error");
      const res = statsRes.value;
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const result = await res.json();
      const acceptedProgress = result?.data?.userProfileUserQuestionProgressV2?.numAcceptedQuestions;
      if (acceptedProgress && Array.isArray(acceptedProgress)) {
        let easy = 0, medium = 0, hard = 0;
        acceptedProgress.forEach((item: any) => {
          if (item.difficulty === "EASY") easy = item.count;
          else if (item.difficulty === "MEDIUM") medium = item.count;
          else if (item.difficulty === "HARD") hard = item.count;
        });
        setSolvedStats({ easy, medium, hard, total: easy + medium + hard });
      } else if (result?.errors?.length) {
        throw new Error(result.errors.map((e: any) => e.message).join(", "));
      } else {
        throw new Error("Could not load profile stats.");
      }
    } catch (err: any) {
      setStatsError(err.message || "Failed to load stats.");
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [username]);

  // Fetch details automatically for expanded row if it's set in the URL but not cached
  useEffect(() => {
    if (expandedId && !detailsCache[expandedId] && detailsLoadingId !== expandedId) {
      const fetchExpandedDetails = async (id: string) => {
        setDetailsLoadingId(id);
        try {
          const res = await fetch(
            `/api/leetcode?submissionId=${id}&username=${encodeURIComponent(username)}`
          );
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || `HTTP error! status: ${res.status}`);
          }
          
          const result = await res.json();
          console.log("[Client] API response for submissionId", id, result);

          if (result?.data?.submissionDetails) {
            setDetailsCache((prev) => ({
              ...prev,
              [id]: result.data.submissionDetails,
            }));
          } else if (result?.errors && result.errors.length > 0) {
            throw new Error(result.errors[0].message);
          } else {
            throw new Error("No details returned from LeetCode.");
          }
        } catch (err: any) {
          console.error("Failed fetching submission details:", err);
          setDetailsCache((prev) => ({
            ...prev,
            [id]: { error: err.message || "Failed to load details." },
          }));
        } finally {
          setDetailsLoadingId(null);
        }
      };

      fetchExpandedDetails(expandedId);
    }
  }, [expandedId, detailsCache, detailsLoadingId]);

  // Handles clicking a submission row to expand and fetch details
  const handleRowClick = (submissionIdStr: string) => {
    if (expandedId === submissionIdStr) {
      setExpandedId(null);
    } else {
      setExpandedId(submissionIdStr);
    }
  };

  // Filter submissions by title
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) =>
      sub.title.toLowerCase().includes(filterQuery.toLowerCase())
    );
  }, [submissions, filterQuery]);

  // Renders the expanded submission detail content
  const renderDetails = (submissionIdStr: string) => {
    const isLoadingDetails = detailsLoadingId === submissionIdStr;
    const details = detailsCache[submissionIdStr];

    if (isLoadingDetails) {
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
              LeetCode's submission details (including code and metrics) are private. Please verify that your{" "}
              <code className="px-1 py-0.5 bg-red-500/10 dark:bg-red-550/20 rounded font-mono font-bold text-red-600 dark:text-red-400">
                LEETCODE_COOKIE
              </code>{" "}
              is correctly configured and active inside your local environment configuration (e.g. <code className="font-mono">.env</code>).
            </p>
          </div>
        </div>
      );
    }

    // Determine successful submission: statusCode === 10 (Accepted)
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

        {/* Notes, if present */}
        {details.notes && (
          <div className="mb-4 p-3 bg-zinc-100/70 dark:bg-zinc-800/40 rounded-xl text-xs text-zinc-655 dark:text-zinc-450 border border-zinc-200/30 dark:border-zinc-800/30">
            <span className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Notes:</span>
            <pre className="font-sans whitespace-pre-wrap leading-relaxed">{details.notes}</pre>
          </div>
        )}

        {/* Errors display */}
        {details.compileError && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-655 dark:text-red-405 font-mono overflow-x-auto max-h-36 leading-relaxed">
            <span className="font-bold block mb-1 text-red-700 dark:text-red-400">Compile Error:</span>
            <pre className="whitespace-pre">{details.compileError}</pre>
          </div>
        )}
        {details.runtimeError && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-655 dark:text-red-405 font-mono overflow-x-auto max-h-36 leading-relaxed">
            <span className="font-bold block mb-1 text-red-700 dark:text-red-400">Runtime Error:</span>
            <pre className="whitespace-pre">{details.runtimeError}</pre>
          </div>
        )}

        {/* Code Snippet Pre block */}
        {details.code && (
          <div className="relative mt-2">
            <div className="absolute right-3 top-3 z-10">
              <CopyButton text={details.code} />
            </div>
            <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto max-h-80 border border-zinc-800/60 leading-relaxed select-all">
              <code>{details.code}</code>
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative flex w-full flex-col justify-start p-6 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto w-full flex flex-col justify-start">
        
        {/* Back and Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 mb-8">
          <div className="flex items-center gap-3.5">
            <Button
              variant="outline"
              size="icon"
              onClick={onBack}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer h-10 w-10 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-500 animate-pulse" />
                <h2 className="text-xl font-bold font-heading text-zinc-900 dark:text-zinc-50">
                  {username}&apos;s Submissions
                </h2>
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Live LeetCode profile analytics feed
              </p>
            </div>
          </div>

          {/* Search bar & Refresh block */}
          <div className="flex items-center gap-2.5 max-w-sm w-full">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
              <Input
                type="text"
                placeholder="Filter by problem title..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                disabled={submissionsLoading || !!submissionsError}
                className="w-full pl-9 pr-3 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none text-xs md:text-sm"
              />
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={fetchData}
              disabled={submissionsLoading || statsLoading}
              className="h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-50"
              title="Refresh results"
            >
              <RotateCw className={`h-4 w-4 ${(submissionsLoading || statsLoading) ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Statistics Metric Dashboard — always renders; cards show skeleton individually */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Solved"
            value={solvedStats.total}
            isLoading={statsLoading}
            theme="neutral"
            icon={<Trophy className="h-5 w-5" />}
          />
          <StatCard
            title="Easy Solved"
            value={solvedStats.easy}
            isLoading={statsLoading}
            theme="emerald"
            icon={<Zap className="h-5 w-5" />}
          />
          <StatCard
            title="Medium Solved"
            value={solvedStats.medium}
            isLoading={statsLoading}
            theme="amber"
            icon={<Activity className="h-5 w-5" />}
          />
          <StatCard
            title="Hard Solved"
            value={solvedStats.hard}
            isLoading={statsLoading}
            theme="rose"
            icon={<Sparkles className="h-5 w-5" />}
          />
        </div>
        {/* Stats error banner */}
        {statsError && !statsLoading && (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mb-4 px-4 py-2.5 rounded-xl border border-amber-500/15 bg-amber-500/5">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Stats unavailable: {statsError}</span>
          </div>
        )}

        {/* Error State View for submissions */}
        {submissionsError && !submissionsLoading ? (
          <div className="w-full flex flex-col items-center justify-center py-16 px-6 border border-red-500/10 dark:border-red-500/20 bg-red-500/5 dark:bg-red-500/5 rounded-2xl text-center shadow-xs">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4 animate-bounce" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2 font-heading">
              Unable to Retrieve Submissions
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mb-6 leading-relaxed">
              {submissionsError}
            </p>
            <div className="flex items-center gap-3">
              <Button
                onClick={fetchData}
                className="px-5 h-9 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-medium text-xs cursor-pointer shadow-sm border-0 flex items-center gap-1.5"
              >
                <RotateCw className="h-3 w-3" />
                <span>Retry Request</span>
              </Button>
              <Button
                variant="outline"
                onClick={onBack}
                className="px-5 h-9 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl font-medium text-xs cursor-pointer"
              >
                Search Another Profile
              </Button>
            </div>
          </div>
        ) : (
          /* Submissions Table card */
          <div className="w-full rounded-2xl border border-zinc-200/80 dark:border-zinc-900/80 bg-white dark:bg-zinc-900/60 shadow-lg overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200/60 dark:border-zinc-800/85 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    <th className="py-4 px-5">Problem Title</th>
                    <th className="py-4 px-5">Submitted At</th>
                    <th className="py-4 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/60 text-sm text-zinc-700 dark:text-zinc-300">
                  {submissionsLoading ? (
                    // Skeleton Rows for Loading States
                    Array.from({ length: 6 }).map((_, index) => (
                      <tr key={index} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10">
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
                  ) : filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((sub) => (
                      <React.Fragment key={sub.id}>
                        {/* Main clickable row */}
                        <tr
                          onClick={() => handleRowClick(sub.id)}
                          className={cn(
                            "cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-zinc-900/35 transition-colors duration-150",
                            expandedId === sub.id && "bg-zinc-50/50 dark:bg-zinc-900/25"
                          )}
                        >
                          <td className="py-4 px-5 font-medium text-zinc-900 dark:text-zinc-100">
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-400 dark:text-zinc-650 shrink-0">
                                {expandedId === sub.id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </span>
                              <Code2 className="h-4 w-4 text-orange-500/70 shrink-0" />
                              <span className="truncate">{sub.title}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-zinc-500 dark:text-zinc-400 text-xs">
                            {formatTimestamp(sub.timestamp)}
                          </td>
                          <td className="py-4 px-5 text-right">
                            <a
                              href={`https://leetcode.com/problems/${sub.titleSlug}/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()} // Prevent toggling row expansion when clicking Solve link
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
                        {expandedId === sub.id && (
                          <tr className="bg-zinc-50/20 dark:bg-zinc-900/10 border-b border-zinc-200/40 dark:border-zinc-800/40">
                            <td colSpan={3} className="py-5 px-6">
                              {renderDetails(sub.id)}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-zinc-400 dark:text-zinc-500">
                        No matching submissions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
