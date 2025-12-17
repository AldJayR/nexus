/**
 * Format ISO date to user-friendly format
 * @example formatDate('2025-01-17T10:30:00Z') -> 'Jan 17, 2025'
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format ISO date/time to user-friendly format with time
 * @example formatDateTime('2025-01-17T10:30:00Z') -> 'Jan 17, 2025 at 10:30 AM'
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format ISO date/time to relative time (e.g., '2 days ago')
 * @example formatRelativeTime('2025-01-15T10:30:00Z') -> '2 days ago'
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: [number, string][] = [
    [31_536_000, "year"],
    [2_592_000, "month"],
    [604_800, "week"],
    [86_400, "day"],
    [3600, "hour"],
    [60, "minute"],
    [1, "second"],
  ];

  for (const [interval, unit] of intervals) {
    const count = Math.floor(seconds / interval);
    if (count >= 1) {
      return count === 1 ? `${count} ${unit} ago` : `${count} ${unit}s ago`;
    }
  }

  return "just now";
}
