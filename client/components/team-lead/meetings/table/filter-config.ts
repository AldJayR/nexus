import type { TableFiltersConfig } from "@/components/shared/table";
import type { MeetingsTableRow } from "./columns";

/**
 * Filter configuration for Meetings table
 * Defines search, dynamic filters, and column visibility options
 */
export const meetingsTableFiltersConfig: TableFiltersConfig<MeetingsTableRow> = {
	search: {
		enabled: true,
		placeholder: "Search by title, uploader, sprint, phase...",
		ariaLabel: "Filter meeting minutes",
	},
	filters: [
		{
			id: "scope",
			columnId: "scope",
			label: "Scope",
			type: "checkbox",
			options: [
				{ value: "Sprint", label: "Sprint" },
				{ value: "Phase", label: "Phase" },
				{ value: "Unassigned", label: "Unassigned" },
			],
		},
	],
	columnVisibility: {
		enabled: true,
		label: "View",
	},
};
