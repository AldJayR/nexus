"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { formatDate } from "@/lib/helpers/format-date";
import type { User } from "@/lib/types/models";
import { UserRole } from "@/lib/types/models";
import { cn } from "@/lib/utils";
import { RowActions } from "./row-actions";

const roleDisplay: Record<UserRole, string> = {
  [UserRole.MEMBER]: "Member",
  [UserRole.TEAM_LEAD]: "Team Lead",
  [UserRole.ADVISER]: "Adviser",
};

type SortableHeaderProps = {
  children: React.ReactNode;
  onClick?: (event: React.SyntheticEvent) => void;
  sorted?: false | "asc" | "desc";
};

type ColumnsContextType = {
  onSoftDelete?: (user: User) => Promise<void>;
  onRestore?: (user: User) => Promise<void>;
  loadingUserIds?: Set<string>;
  currentUser?: User | null;
};

const SortableHeader = ({ children, onClick, sorted }: SortableHeaderProps) => (
  <button
    className={cn(
      "flex items-center justify-between gap-2",
      onClick && "cursor-pointer select-none hover:text-foreground/80"
    )}
    onClick={onClick}
    type="button"
  >
    <span>{children}</span>
    {sorted === "asc" && (
      <ChevronUpIcon aria-hidden="true" className="opacity-60" size={14} />
    )}
    {sorted === "desc" && (
      <ChevronDownIcon aria-hidden="true" className="opacity-60" size={14} />
    )}
  </button>
);

export const createColumns = (
  context: ColumnsContextType
): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableHeader
        onClick={column.getToggleSortingHandler()}
        sorted={column.getIsSorted()}
      >
        Name
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
    enableHiding: false,
    size: 180,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <SortableHeader
        onClick={column.getToggleSortingHandler()}
        sorted={column.getIsSorted()}
      >
        Email
      </SortableHeader>
    ),
    size: 220,
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <SortableHeader
        onClick={column.getToggleSortingHandler()}
        sorted={column.getIsSorted()}
      >
        Role
      </SortableHeader>
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as UserRole;
      return <span className="text-sm">{roleDisplay[role]}</span>;
    },
    size: 120,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <SortableHeader
        onClick={column.getToggleSortingHandler()}
        sorted={column.getIsSorted()}
      >
        Joined
      </SortableHeader>
    ),
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
    size: 120,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <RowActions
        currentUser={context.currentUser}
        isLoading={context.loadingUserIds?.has(row.original.id) ?? false}
        onRestore={context.onRestore}
        onSoftDelete={context.onSoftDelete}
        user={row.original}
      />
    ),
    enableHiding: false,
    enableSorting: false,
    size: 60,
  },
];
