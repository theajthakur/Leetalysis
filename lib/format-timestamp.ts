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

  const isToday =
    dateYear === nowYear && dateMonth === nowMonth && dateDate === nowDate;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    dateYear === yesterday.getFullYear() &&
    dateMonth === yesterday.getMonth() &&
    dateDate === yesterday.getDate();

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = String(minutes).padStart(2, "0");

  if (isToday) {
    return `Today ${hours}:${minutesStr}${ampm}`;
  } else if (isYesterday) {
    return `Yesterday ${hours}:${minutesStr} ${ampm}`;
  } else {
    const dayStr = String(dateDate).padStart(2, "0");
    const fullMonths = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const monthStr = fullMonths[dateMonth];
    const yearStr = String(dateYear).slice(-2);
    return `${dayStr} ${monthStr}, ${yearStr} - ${hours}:${minutesStr}${ampm}`;
  }
}
