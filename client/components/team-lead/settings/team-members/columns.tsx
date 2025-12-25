"use client";

import type { ColumnDef, FilterFn } from "@tanstack/react-table";
import {
  type ActionConfig,
  GenericRowActions,
} from "@/components/shared/table";
import { formatDate } from "@/lib/helpers/format-date";
import type { User } from "@/lib/types/models";
import { UserRole } from "@/lib/types/models";

const roleDisplay: Record<UserRole, string> = {
  [UserRole.MEMBER]: "Member",
  [UserRole.TEAM_LEAD]: "Team Lead",
  [UserRole.ADVISER]: "Adviser",
};

// Multi-column filter function that searches across name, email, and role
const multiColumnFilterFn: FilterFn<User> = (row, _columnId, filterValue) => {
  const searchTerm = (filterValue ?? "").toString().toLowerCase().trim();
  if (!searchTerm) {
    return true;
  }

  const searchableContent = [
    row.original.name,
    row.original.email,
    roleDisplay[row.original.role],
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableContent.includes(searchTerm);
};

type ColumnsContextType = {
  onAction?: (actionId: string, user: User) => void;
  loadingUserIds?: Set<string>;
  currentUser?: User | null;
};

export const createColumns = (
  context: ColumnsContextType
): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
    enableHiding: false,
    filterFn: multiColumnFilterFn,
    size: 180,
  },
  {
    accessorKey: "email",
    header: "Email",
    size: 220,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as UserRole;
      return <span className="text-sm">{roleDisplay[role]}</span>;
    },
    size: 120,
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
    size: 120,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const user = row.original;
      const isDeleted = !!user.deletedAt;
      // const isSelf = context.currentUser?.id === user.id;

      const actions: ActionConfig[] = isDeleted
        ? [{ id: "restore", label: "Restore" }]
        : [
            {
              id: "delete",
              label: "Delete",
              variant: "destructive",
            },
          ];

      return (
        <GenericRowActions
          actions={actions}
          isLoading={context.loadingUserIds?.has(user.id) ?? false}
          onAction={(actionId) => context.onAction?.(actionId, user)}
          row={row}
        />
      );
    },
    enableHiding: false,
    enableSorting: false,
    size: 60,
  },
];
