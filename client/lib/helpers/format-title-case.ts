/**
 * Convert UPPER_SNAKE_CASE strings to Title Case format
 * Useful for formatting enum values for user display
 *
 * @example
 * formatTitleCase("IN_PROGRESS") // "In Progress"
 * formatTitleCase("TEAM_LEAD") // "Team Lead"
 * formatTitleCase("NOT_STARTED") // "Not Started"
 */
export const formatTitleCase = (text: string): string =>
  text
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
