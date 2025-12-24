import type { Row, Table } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";

/**
 * Action configuration for row actions dropdown
 */
export type ActionConfig = {
  id: string;
  label: string;
  icon?: LucideIcon;
  variant?: "default" | "destructive";
  showDividerAfter?: boolean;
};

/**
 * Row actions props
 */
export type GenericRowActionsProps<T> = {
  row: Row<T>;
  actions: ActionConfig[];
  onAction: (actionId: string, row: Row<T>) => void;
  isLoading?: boolean;
};

/**
 * Single filter option
 */
export type FilterOption = {
  value: string;
  label?: string;
  count?: number;
};

/**
 * Filter section configuration
 */
export type FilterSectionConfig = {
  id: string;
  columnId: string;
  label: string;
  options: FilterOption[];
  type: "checkbox" | "radio";
  showDividerAfter?: boolean;
};

/**
 * Search filter configuration
 */
export type SearchFilterConfig = {
  enabled: boolean;
  columnId: string; // Column to apply the filter to (e.g., "title", "name")
  placeholder?: string;
  ariaLabel?: string;
};

/**
 * Column visibility toggle configuration
 */
export type ColumnVisibilityConfig = {
  enabled: boolean;
  label?: string;
};

/**
 * Complete filter configuration
 */
export type TableFiltersConfig<_T> = {
  search: SearchFilterConfig;
  filters: FilterSectionConfig[];
  columnVisibility: ColumnVisibilityConfig;
  additionalActions?: React.ReactNode; // For things like upload button
};

/**
 * Table filters props
 */
export type GenericTableFiltersProps<T> = {
  table: Table<T>;
  config: TableFiltersConfig<T>;
  id: string;
};

/**
 * Table header props
 */
export type GenericTableHeaderProps<T> = {
  table: Table<T>;
};

/**
 * Table body props
 */
export type GenericTableBodyProps<T> = {
  table: Table<T>;
  emptyMessage?: string;
};
