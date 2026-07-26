"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useQueryState } from "nuqs";
import { AlertCircle, RotateCw } from "lucide-react";
import { SubmissionsHeader } from "@/components/submissions/submissions-header";
import { StatsDashboard } from "@/components/submissions/stats-dashboard";
import { SubmissionsTable } from "@/components/submissions/submissions-table";

// Re-export utility so existing external imports keep working
export { formatTimestamp } from "@/lib/format-timestamp";

interface SubmissionsListProps {
  username: string;
  onBack: () => void;
}

export function SubmissionsList({ username, onBack }: SubmissionsListProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [solvedStats, setSolvedStats] = useState({ easy: 0, medium: 0, hard: 0, total: 0 });
  const [profile, setProfile] = useState<{ realName: string; avatar: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [submissionsError, setSubmissionsError] = useState("");
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const [filterQuery, setFilterQuery] = useState("");

  const [expandedId, setExpandedId] = useQueryState("submission");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [detailsCache, setDetailsCache] = useState<Record<string, any>>({});
  const [detailsLoadingId, setDetailsLoadingId] = useState<string | null>(null);

  const fetchData = async () => {
    setSubmissionsLoading(true);
    setStatsLoading(true);
    setProfileLoading(true);
    setSubmissionsError("");
    setStatsError("");
    setExpandedId(null);

    const [subsRes, statsRes, profileRes] = await Promise.allSettled([
      fetch(`/api/leetcode?username=${encodeURIComponent(username)}&type=submissions`),
      fetch(`/api/leetcode?username=${encodeURIComponent(username)}&type=stats`),
      fetch(`/api/leetcode?username=${encodeURIComponent(username)}&type=profile`),
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
        throw new Error(result.errors.map((e: { message: string }) => e.message).join(", "));
      } else {
        throw new Error("We can't see submissions yet. Please verify the username or check your LEETCODE_COOKIE in .env.");
      }
    } catch (err: unknown) {
      setSubmissionsError(err instanceof Error ? err.message : "Failed to load submissions.");
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
        acceptedProgress.forEach((item: { difficulty: string; count: number }) => {
          if (item.difficulty === "EASY") easy = item.count;
          else if (item.difficulty === "MEDIUM") medium = item.count;
          else if (item.difficulty === "HARD") hard = item.count;
        });
        setSolvedStats({ easy, medium, hard, total: easy + medium + hard });
      } else if (result?.errors?.length) {
        throw new Error(result.errors.map((e: { message: string }) => e.message).join(", "));
      } else {
        throw new Error("Could not load profile stats.");
      }
    } catch (err: unknown) {
      setStatsError(err instanceof Error ? err.message : "Failed to load stats.");
    } finally {
      setStatsLoading(false);
    }

    // ── Handle profile ────────────────────────────────────────────────────
    try {
      if (profileRes.status === "rejected") throw new Error("Network error");
      const res = profileRes.value;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      const status = result?.data?.userStatus;
      if (status) {
        setProfile({ realName: status.realName || "", avatar: status.avatar || "" });
      }
    } catch {
      // silently ignore — profile is decorative, not critical
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  // Auto-fetch details when a row is expanded but not yet cached
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
          if (result?.data?.submissionDetails) {
            setDetailsCache((prev) => ({ ...prev, [id]: result.data.submissionDetails }));
          } else if (result?.errors?.length > 0) {
            throw new Error(result.errors[0].message);
          } else {
            throw new Error("No details returned from LeetCode.");
          }
        } catch (err: unknown) {
          setDetailsCache((prev) => ({
            ...prev,
            [id]: { error: err instanceof Error ? err.message : "Failed to load details." },
          }));
        } finally {
          setDetailsLoadingId(null);
        }
      };
      fetchExpandedDetails(expandedId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedId, detailsCache, detailsLoadingId]);

  const handleRowToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredSubmissions = useMemo(
    () => submissions.filter((sub) => sub.title.toLowerCase().includes(filterQuery.toLowerCase())),
    [submissions, filterQuery]
  );

  return (
    <div className="relative flex w-full flex-col justify-start p-6 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto w-full flex flex-col justify-start">

        <SubmissionsHeader
          username={username}
          realName={profile?.realName ?? ""}
          avatar={profile?.avatar ?? ""}
          profileLoading={profileLoading}
          onBack={onBack}
          onRefresh={fetchData}
          isLoading={submissionsLoading || statsLoading}
          filterQuery={filterQuery}
          onFilterChange={setFilterQuery}
          isFilterDisabled={submissionsLoading || !!submissionsError}
        />

        <StatsDashboard
          stats={solvedStats}
          isLoading={statsLoading}
          error={statsError}
        />

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
          <SubmissionsTable
            isLoading={submissionsLoading}
            submissions={filteredSubmissions}
            expandedId={expandedId}
            onRowToggle={handleRowToggle}
            detailsLoadingId={detailsLoadingId}
            detailsCache={detailsCache}
          />
        )}

      </div>
    </div>
  );
}
