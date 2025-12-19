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

/**
 * Calculate the number of days between two dates
 * @param startDate - Start date as string or Date object
 * @param endDate - End date as string or Date object
 * @returns Number of days between dates, rounded up
 *
 * @example
 * calculateDaysBetween('2025-01-17', '2025-01-24') // 7
 * calculateDaysBetween(new Date('2025-01-17'), new Date('2025-01-24')) // 7
 */
export function calculateDaysBetween(
  startDate: string | Date,
  endDate: string | Date
): number {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  const timeDifference = end.getTime() - start.getTime();
  const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

  return Math.ceil(daysDifference);
}

/**
 * Format due date relative to today (e.g., 'due in 3 days', 'overdue by 5 days')
 * @param dueDateString - Due date as ISO string
 * @returns Relative due date string
 *
 * @example
 * formatRelativeDueDate('2025-01-20T00:00:00Z') // "due in 1 day" or "overdue by 2 days"
 * formatRelativeDueDate('2025-12-19T00:00:00Z') // "due today"
 */
export function formatRelativeDueDate(dueDateString: string): string {
  const dueDate = new Date(dueDateString);
  const today = new Date();

  // Reset times to midnight for accurate day comparison
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const timeDifference = dueDate.getTime() - today.getTime();
  const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  if (daysDifference === 0) {
    return "due today";
  }

  if (daysDifference > 0) {
    return daysDifference === 1 ? "due in 1 day" : `due in ${daysDifference} days`;
  }

  // Overdue (negative days)
  const overdueBy = Math.abs(daysDifference);
  return overdueBy === 1 ? "overdue by 1 day" : `overdue by ${overdueBy} days`;
}

/**
 * Check if a date is in the past (overdue)
 * @param dateString - Date as ISO string or Date object
 * @returns True if date is in the past
 *
 * @example
 * isDateInPast('2025-01-15T00:00:00Z') // true (if today is 2025-01-17)
 */
export function isDateInPast(dateString: string | Date): boolean {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  const today = new Date();

  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return date.getTime() < today.getTime();
}

/**
 * Check if an end date has less than a week remaining
 * @param endDateString - End date as ISO string or Date object
 * @returns True if less than 7 days remain
 *
 * @example
 * isLessThanWeekRemaining('2025-01-25T00:00:00Z') // true (if today is 2025-01-20)
 */
export function isLessThanWeekRemaining(endDateString: string | Date): boolean {
  const endDate = typeof endDateString === "string" ? new Date(endDateString) : endDateString;
  const today = new Date();

  endDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const daysRemaining = calculateDaysBetween(today, endDate);
  return daysRemaining < 7;
}

