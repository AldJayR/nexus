/**
 * Date Helper Functions
 * Centralized utilities for date transformations and formatting
 */

/**
 * Convert date string (YYYY-MM-DD) to ISO datetime format (YYYY-MM-DDTHH:MM:SSZ)
 * Server expects full ISO datetime with timezone
 *
 * @param dateString - Date in YYYY-MM-DD format or empty string
 * @returns ISO datetime string or undefined if input is empty/undefined
 *
 * @example
 * toISODateTime("2025-01-17") // "2025-01-17T00:00:00Z"
 * toISODateTime("") // undefined
 * toISODateTime(undefined) // undefined
 */
export function toISODateTime(
  dateString: string | undefined | null
): string | undefined {
  if (!dateString || dateString === "") {
    return;
  }

  // If already in ISO format, return as is
  if (dateString.includes("T")) {
    return dateString;
  }

  // Convert YYYY-MM-DD to YYYY-MM-DDT00:00:00Z
  return `${dateString}T00:00:00Z`;
}

/**
 * Convert date string to ISO datetime or null for database storage
 * Use this when the API expects null for empty dates
 *
 * @param dateString - Date in YYYY-MM-DD format or empty string
 * @returns ISO datetime string or null if input is empty/undefined
 */
export function toISODateTimeOrNull(
  dateString: string | undefined | null
): string | null {
  return toISODateTime(dateString) ?? null;
}

/**
 * Extract date-only portion from ISO datetime or date string
 *
 * @param value - ISO datetime or date string
 * @returns Date in YYYY-MM-DD format or empty string
 *
 * @example
 * toDateOnly("2025-01-17T10:30:00Z") // "2025-01-17"
 * toDateOnly("2025-01-17") // "2025-01-17"
 * toDateOnly(null) // ""
 */
export function toDateOnly(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  // Accept either YYYY-MM-DD or full ISO datetime, normalize to YYYY-MM-DD
  return value.length >= 10 ? value.slice(0, 10) : value;
}

/**
 * Clean date input for form submission
 * Converts empty strings to undefined to avoid sending empty values to the server
 *
 * @param dateString - Date string from form input
 * @returns Cleaned date string or undefined
 */
export function cleanDateInput(
  dateString: string | undefined
): string | undefined {
  if (!dateString || dateString.trim() === "") {
    return;
  }
  return dateString;
}
