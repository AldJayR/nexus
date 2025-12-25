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
