/** Represents one student row stored from CSV */
export interface Student {
  name: string;
  rollNumber: string;
  handle: string;
}

const STORAGE_KEY = "leetalysis_students";

/** Read students from localStorage (safe for SSR) */
export function getStudents(): Student[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Student[];
  } catch {
    return [];
  }
}

/** Persist students to localStorage */
export function saveStudents(students: Student[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

/** Clear students from localStorage */
export function clearStudents(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/** Look up a student by handle (case-insensitive) */
export function findStudentByHandle(handle: string): Student | undefined {
  const students = getStudents();
  return students.find((s) => s.handle.toLowerCase().trim() === handle.toLowerCase().trim());
}

// ── CSV column aliases (all compared case-insensitively) ─────────────────────

const NAME_ALIASES = ["name"];
const ROLL_ALIASES = ["roll_number", "roll", "rollnumber", "roll no", "rollno"];
const HANDLE_ALIASES = ["leetcode_handle", "user_id", "userid", "handle", "leetcode_id", "leetcode"];

function findCol(headers: string[], aliases: string[]): number {
  return headers.findIndex((h) => aliases.includes(h.toLowerCase().trim()));
}

export interface ParseResult {
  ok: boolean;
  students?: Student[];
  error?: string;
}

/**
 * Parse a CSV string. Returns { ok, students } on success or { ok: false, error } on failure.
 * Validates that name, roll, and handle columns exist (case-insensitive aliases).
 */
export function parseCSV(text: string): ParseResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) {
    return { ok: false, error: "CSV must have a header row and at least one data row." };
  }

  const headers = lines[0].split(",");

  const nameIdx = findCol(headers, NAME_ALIASES);
  const rollIdx = findCol(headers, ROLL_ALIASES);
  const handleIdx = findCol(headers, HANDLE_ALIASES);

  if (nameIdx === -1) {
    return { ok: false, error: 'Missing required column: "Name".' };
  }
  if (rollIdx === -1) {
    return {
      ok: false,
      error: 'Missing required column: "Roll_Number" (or "Roll").',
    };
  }
  if (handleIdx === -1) {
    return {
      ok: false,
      error: 'Missing required column: "LeetCode_Handle" (or "User_ID" / "LeetCode_ID").',
    };
  }

  const students: Student[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const name = cols[nameIdx]?.trim();
    const rollNumber = cols[rollIdx]?.trim();
    const handle = cols[handleIdx]?.trim();

    if (!name || !rollNumber || !handle) continue; // skip blank rows

    students.push({ name, rollNumber, handle });
  }

  if (students.length === 0) {
    return { ok: false, error: "No valid data rows found in the CSV." };
  }

  return { ok: true, students };
}
