import { NextRequest, NextResponse } from "next/server";
import { queryLeetCode } from "@/lib/api";

/**
 * GET Handler for LeetCode proxy API.
 * Route: /api/leetcode?username=xxx                    → submissions list
 * Route: /api/leetcode?username=xxx&type=submissions   → submissions list (explicit)
 * Route: /api/leetcode?username=xxx&type=stats         → profile stats only
 * Route: /api/leetcode?submissionId=xxx               → submission code details
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");
  const submissionIdStr = searchParams.get("submissionId");
  const type = searchParams.get("type"); // "submissions" | "stats"

  if (!username && !submissionIdStr) {
    return NextResponse.json(
      { error: "Either 'username' or 'submissionId' query parameter is required." },
      { status: 400 }
    );
  }

  // ── Submission details ────────────────────────────────────────────────────
  if (submissionIdStr) {
    const submissionId = parseInt(submissionIdStr, 10);
    if (isNaN(submissionId)) {
      return NextResponse.json(
        { error: "Invalid 'submissionId' parameter. Must be an integer." },
        { status: 400 }
      );
    }

    try {
      const query = `
        query submissionDetails($submissionId: Int!) {
          submissionDetails(submissionId: $submissionId) {
            runtime
            runtimeDisplay
            runtimePercentile
            memory
            memoryDisplay
            memoryPercentile
            code
            timestamp
            statusCode
            totalCorrect
            totalTestcases
            compileError
            runtimeError
            lang {
              name
              verboseName
            }
          }
        }
      `;

      const result = await queryLeetCode(query, { submissionId }, username || undefined);
      console.log(`[API] Submission details for id ${submissionId}:`, JSON.stringify(result));
      return NextResponse.json(result);
    } catch (err: any) {
      console.error("[API] submissionDetails error:", err);
      return NextResponse.json(
        { error: err.message || "Failed to fetch submission details from LeetCode." },
        { status: 500 }
      );
    }
  }

  // ── Submissions list ──────────────────────────────────────────────────────
  if (!type || type === "submissions") {
    try {
      const query = `
        query recentSubmissions($username: String!, $limit: Int!) {
          recentAcSubmissionList(username: $username, limit: $limit) {
            id
            title
            titleSlug
            timestamp
          }
        }
      `;
      const result = await queryLeetCode(
        query,
        { username: username!, limit: 20 },
        username!
      );
      return NextResponse.json(result);
    } catch (err: any) {
      console.error("[API] submissions error:", err);
      return NextResponse.json(
        { error: err.message || "Failed to fetch submissions from LeetCode." },
        { status: 500 }
      );
    }
  }

  // ── Profile stats ─────────────────────────────────────────────────────────
  if (type === "stats") {
    try {
      const query = `
        query userStats($username: String!) {
          userProfileUserQuestionProgressV2(userSlug: $username) {
            numAcceptedQuestions {
              count
              difficulty
            }
          }
        }
      `;
      const result = await queryLeetCode(query, { username: username! }, username!);
      return NextResponse.json(result);
    } catch (err: any) {
      console.error("[API] stats error:", err);
      return NextResponse.json(
        { error: err.message || "Failed to fetch profile stats from LeetCode." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Unknown request type." }, { status: 400 });
}
