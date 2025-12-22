/**
 * Meeting Analytics Helper Functions
 *
 * Calculates key metrics for the meetings dashboard:
 * - Total meetings documented
 * - Coverage percentage (sprints/phases with meetings)
 * - On-time percentage (meetings documented before sprint/phase end date)
 * - Missing meetings count
 *
 * Filtering Rules:
 * - Exclude sprints/phases with null startDate or endDate
 * - Exclude soft-deleted sprints/phases (where deletedAt is not null)
 * - Valid meetings: all logs regardless of their associated sprint/phase validity
 *
 * @module lib/helpers/meeting-analytics
 */

import type { MeetingLog, Phase, Sprint } from "@/lib/types";

/**
 * Filters sprints to include only valid ones
 * Valid = not soft-deleted AND has both startDate and endDate
 * Note: Sprints have a deletedAt field for soft deletes
 */
function getValidSprints(sprints: Sprint[] | undefined): Sprint[] {
  if (!(sprints && Array.isArray(sprints))) {
    return [];
  }
  return sprints.filter((s) => !s.deletedAt && s.startDate && s.endDate);
}

/**
 * Filters phases to include only valid ones
 * Valid = has both startDate and endDate
 * Note: Phases do NOT have soft delete (no deletedAt field in schema)
 */
function getValidPhases(phases: Phase[] | undefined): Phase[] {
  if (!(phases && Array.isArray(phases))) {
    return [];
  }
  return phases.filter((p) => p.startDate && p.endDate);
}

/**
 * Calculates total number of meeting logs
 */
export function calculateTotalMeetings(logs: MeetingLog[]): number {
  return logs.length;
}

/**
 * Calculates coverage percentage
 * Coverage = (sprints with meetings + phases with meetings) / (total valid sprints + total valid phases) * 100
 *
 * @returns Object with percentage, covered count, and total count
 */
export function calculateCoveragePercentage(
  logs: MeetingLog[],
  sprints: Sprint[],
  phases: Phase[]
): {
  percentage: number;
  covered: number;
  total: number;
} {
  const validSprints = getValidSprints(sprints);
  const validPhases = getValidPhases(phases);
  const total = validSprints.length + validPhases.length;

  if (total === 0) {
    return { percentage: 0, covered: 0, total: 0 };
  }

  // Find unique sprint IDs in logs that belong to valid sprints
  const sprintsWithMeetings = new Set<string>();
  const phasesWithMeetings = new Set<string>();

  for (const log of logs) {
    if (log.sprintId && validSprints.some((s) => s.id === log.sprintId)) {
      sprintsWithMeetings.add(log.sprintId);
    }
    if (log.phaseId && validPhases.some((p) => p.id === log.phaseId)) {
      phasesWithMeetings.add(log.phaseId);
    }
  }

  const covered = sprintsWithMeetings.size + phasesWithMeetings.size;
  const percentage = Math.round((covered / total) * 100);

  return { percentage, covered, total };
}

/**
 * Calculates on-time percentage
 * A meeting is on-time if it was documented (createdAt) on or before the sprint/phase end date
 *
 * @returns Object with percentage, on-time count, and total meetings
 */
export function calculateOnTimePercentage(
  logs: MeetingLog[],
  sprints: Sprint[],
  phases: Phase[]
): {
  percentage: number;
  onTime: number;
  total: number;
} {
  const validSprints = getValidSprints(sprints);
  const validPhases = getValidPhases(phases);
  const total = logs.length;

  if (total === 0) {
    return { percentage: 0, onTime: 0, total: 0 };
  }

  let onTimeCount = 0;

  for (const log of logs) {
    const uploadedAt = new Date(log.createdAt).getTime();

    // Check if linked to a valid sprint
    if (log.sprintId) {
      const sprint = validSprints.find((s) => s.id === log.sprintId);
      if (sprint?.endDate) {
        const sprintEndDate = new Date(sprint.endDate).getTime();
        if (uploadedAt <= sprintEndDate) {
          onTimeCount += 1;
          continue;
        }
      }
    }

    // Check if linked to a valid phase
    if (log.phaseId) {
      const phase = validPhases.find((p) => p.id === log.phaseId);
      if (phase?.endDate) {
        const phaseEndDate = new Date(phase.endDate).getTime();
        if (uploadedAt <= phaseEndDate) {
          onTimeCount += 1;
        }
      }
    }

    // If no valid sprint/phase found, count as not on-time
  }

  const percentage = Math.round((onTimeCount / total) * 100);

  return { percentage, onTime: onTimeCount, total };
}

/**
 * Calculates missing meetings
 * Returns count of valid sprints/phases without any associated meeting logs
 *
 * @returns Object with missing count and lists of missing sprints/phases
 */
export function calculateMissingMeetings(
  logs: MeetingLog[],
  sprints: Sprint[],
  phases: Phase[]
): {
  count: number;
  sprints: Sprint[];
  phases: Phase[];
} {
  const validSprints = getValidSprints(sprints);
  const validPhases = getValidPhases(phases);

  // Get unique sprint/phase IDs that have meetings
  const sprintsWithMeetings = new Set(
    logs.map((log) => log.sprintId).filter(Boolean)
  );
  const phasesWithMeetings = new Set(
    logs.map((log) => log.phaseId).filter(Boolean)
  );

  // Find which valid sprints/phases are missing meetings
  const missingSprintsArray = validSprints.filter(
    (s) => !sprintsWithMeetings.has(s.id)
  );
  const missingPhasesArray = validPhases.filter(
    (p) => !phasesWithMeetings.has(p.id)
  );

  const count = missingSprintsArray.length + missingPhasesArray.length;

  return { count, sprints: missingSprintsArray, phases: missingPhasesArray };
}

/**
 * Gets all analytics in one call
 * Useful for passing to multiple card components at once
 *
 * @returns Aggregated analytics object
 */
export function getMeetingAnalytics(
  logs: MeetingLog[],
  sprints: Sprint[],
  phases: Phase[]
) {
  return {
    totalMeetings: calculateTotalMeetings(logs),
    coverage: calculateCoveragePercentage(logs, sprints, phases),
    onTime: calculateOnTimePercentage(logs, sprints, phases),
    missing: calculateMissingMeetings(logs, sprints, phases),
  };
}
