"use client";

import { Eye, type LucideIcon, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { GenericRowActionsProps } from "./types";

const defaultActionIcons: Record<string, LucideIcon> = {
  view: Eye,
  open: Eye,
  delete: Eye,
  restore: Eye,
  approve: Eye,
  reject: Eye,
};

/**
 * Generic Row Actions Component
 * Renders a dropdown menu with configurable actions
 *
 * @example
 * ```tsx
 * <GenericRowActions
 *   row={row}
 *   actions={[
 *     { id: 'edit', label: 'Edit', icon: EditIcon },
 *     { id: 'delete', label: 'Delete', icon: TrashIcon, variant: 'destructive' }
 *   ]}
 *   onAction={(actionId, row) => handleAction(actionId, row)}
 * />
 * ```
 */
export function GenericRowActions<T>({
  row,
  actions,
  onAction,
  isLoading = false,
}: GenericRowActionsProps<T>) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Row actions"
          className="h-8 w-8 p-0"
          disabled={isLoading}
          size="icon"
          variant="ghost"
        >
          <MoreVertical aria-hidden="true" className="opacity-60" size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" suppressHydrationWarning>
        {actions.map((action, index) => {
          const Icon = action.icon || defaultActionIcons[action.id] || Eye;

          return (
            <div key={action.id}>
              <DropdownMenuItem
                className={`cursor-pointer gap-2 ${
                  action.variant === "destructive" ? "text-red-600" : ""
                }`}
                disabled={isLoading}
                onClick={() => onAction(action.id, row)}
              >
                <Icon aria-hidden="true" className="opacity-60" size={16} />
                <span>{action.label}</span>
              </DropdownMenuItem>
              {action.showDividerAfter && index < actions.length - 1 && (
                <DropdownMenuSeparator aria-hidden="true" />
              )}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
