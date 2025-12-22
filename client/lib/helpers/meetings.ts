/**
 * Meeting Log Helper Functions
 * Centralized utilities for aggregating and analyzing meeting data
 */

import type { MeetingLog } from "@/lib/types";

/**
 * Chart data entry for meeting frequency visualization
 */
export type MeetingFrequencyChartEntry = {
  month: string;
  meetingCount: number;
};

/**
 * Chart data entry for meeting duration analysis
 */
export type MeetingDurationChartEntry = {
  month: string;
  duration: number;
};

/**
 * Aggregate meeting logs by month and count them
 * Useful for tracking how many meetings were documented each month
 *
 * @param logs - Array of meeting logs to aggregate
 * @returns Array of chart data with month names and meeting counts
 *
 * @example
 * const logs = [
 *   { date: "2025-01-15", ... },
 *   { date: "2025-01-20", ... },
 *   { date: "2025-02-10", ... }
 * ]
 * aggregateMeetingsByMonth(logs)
 * // Returns: [
 * //   { month: "January", meetingCount: 2 },
 * //   { month: "February", meetingCount: 1 }
 * // ]
 */
export function aggregateMeetingsByMonth(
  logs: MeetingLog[]
): MeetingFrequencyChartEntry[] {
  const monthMap = new Map<string, number>();
  const monthNames = [
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

  // Aggregate meetings by month
  for (const log of logs) {
    const date = new Date(log.date);
    const monthKey = monthNames[date.getUTCMonth()];

    monthMap.set(monthKey, (monthMap.get(monthKey) ?? 0) + 1);
  }

  // Convert to chart data format, maintaining month order
  return monthNames
    .filter((month) => monthMap.has(month))
    .map((month) => ({
      month,
      meetingCount: monthMap.get(month) ?? 0,
    }));
}

/**
 * Calculate average meeting duration by month
 * Useful for identifying inefficiency trends in meeting length
 *
 * @param logs - Array of meeting logs to analyze
 * @returns Array of chart data with month names and average durations in minutes
 *
 * Note: Meeting duration should be calculated from meeting metadata
 * Current implementation uses mock duration; real data would come from
 * meeting log metadata or calculated fields
 *
 * @example
 * const logs = [...]
 * calculateAverageDurationByMonth(logs)
 * // Returns: [
 * //   { month: "January", duration: 45 },
 * //   { month: "February", duration: 52 }
 * // ]
 */
export function calculateAverageDurationByMonth(
  logs: MeetingLog[]
): MeetingDurationChartEntry[] {
  if (logs.length === 0) {
    return [];
  }

  const monthMap = new Map<string, { totalDuration: number; count: number }>();
  const monthNames = [
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

  // Aggregate durations by month
  // TODO: When meeting logs include duration metadata, use actual values
  // For now, using mock duration based on logs
  for (const log of logs) {
    const date = new Date(log.date);
    const monthKey = monthNames[date.getUTCMonth()];

    const current = monthMap.get(monthKey) ?? { totalDuration: 0, count: 0 };
    // Mock duration: 45-60 minutes range
    const mockDuration = Math.floor(Math.random() * 15) + 45;

    monthMap.set(monthKey, {
      totalDuration: current.totalDuration + mockDuration,
      count: current.count + 1,
    });
  }

  // Calculate averages and convert to chart data
  return monthNames
    .filter((month) => monthMap.has(month))
    .map((month) => {
      const data = monthMap.get(month);
      if (!data) {
        return null;
      }
      return {
        month,
        duration: Math.round(data.totalDuration / data.count),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}
