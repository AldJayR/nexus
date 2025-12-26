/**
 * Shared Meetings Components
 *
 * Core, role-agnostic components for displaying meeting logs and analytics.
 * Used across Team Lead, Member, and Adviser roles.
 *
 * - SummaryCardsRow: Meeting statistics (total, coverage, on-time, missing)
 * - MeetingsTable: Display table of meeting logs
 * - Analytics Cards: Individual stat cards for meetings metrics
 */

export * from "./analytics";
export { default as SummaryCardsRow } from "./summary-cards";
export { MeetingsTable } from "./table";
