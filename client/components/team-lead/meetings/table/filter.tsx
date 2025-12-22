"use client";

import type { Table } from "@tanstack/react-table";
import { GenericTableFilters } from "@/components/shared/table";
import { meetingsTableFiltersConfig } from "./filter-config";
import type { MeetingsTableRow } from "./columns";

type MeetingsFiltersProps = {
	table: Table<MeetingsTableRow>;
	uniqueScopeValues: string[];
	scopeCounts: Map<string, number>;
};

/**
 * Meetings Table Filters
 * Wrapper around GenericTableFilters with meetings-specific configuration
 */
export function MeetingsFilters({
	table,
	uniqueScopeValues,
	scopeCounts,
}: MeetingsFiltersProps) {
	// Update filter config with dynamic counts
	const config = {
		...meetingsTableFiltersConfig,
		filters: meetingsTableFiltersConfig.filters.map((filter) => ({
			...filter,
			options: filter.options.map((option) => ({
				...option,
				count: scopeCounts.get(option.value),
			})),
		})),
	};

	return (
		<GenericTableFilters table={table} id="meetings-table" config={config} />
	);
}
