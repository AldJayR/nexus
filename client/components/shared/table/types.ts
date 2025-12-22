import type { Row, Table } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";

/**
 * Action configuration for row actions dropdown
 */
export interface ActionConfig {
	id: string;
	label: string;
	icon?: LucideIcon;
	variant?: "default" | "destructive";
	showDividerAfter?: boolean;
}

/**
 * Row actions props
 */
export interface GenericRowActionsProps<T> {
	row: Row<T>;
	actions: ActionConfig[];
	onAction: (actionId: string, row: Row<T>) => void;
	isLoading?: boolean;
}

/**
 * Single filter option
 */
export interface FilterOption {
	value: string;
	label?: string;
	count?: number;
}

/**
 * Filter section configuration
 */
export interface FilterSectionConfig {
	id: string;
	columnId: string;
	label: string;
	options: FilterOption[];
	type: "checkbox" | "radio";
	showDividerAfter?: boolean;
}

/**
 * Search filter configuration
 */
export interface SearchFilterConfig {
	enabled: boolean;
	placeholder?: string;
	ariaLabel?: string;
}

/**
 * Column visibility toggle configuration
 */
export interface ColumnVisibilityConfig {
	enabled: boolean;
	label?: string;
}

/**
 * Complete filter configuration
 */
export interface TableFiltersConfig<T> {
	search: SearchFilterConfig;
	filters: FilterSectionConfig[];
	columnVisibility: ColumnVisibilityConfig;
	additionalActions?: React.ReactNode; // For things like upload button
}

/**
 * Table filters props
 */
export interface GenericTableFiltersProps<T> {
	table: Table<T>;
	config: TableFiltersConfig<T>;
	id: string;
}

/**
 * Table header props
 */
export interface GenericTableHeaderProps<T> {
	table: Table<T>;
}

/**
 * Table body props
 */
export interface GenericTableBodyProps<T> {
	table: Table<T>;
	emptyMessage?: string;
}
