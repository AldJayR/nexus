"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/format-date";
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

const SortableHeader = ({ children, onClick, sorted }: SortableHeaderProps) => (
  <div
    aria-sort={
      sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none"
    }
    className={cn(
      "flex items-center justify-between gap-2",
      onClick && "cursor-pointer select-none hover:text-foreground/80"
    )}
    onClick={onClick}
    onKeyDown={(event) => {
      if (onClick && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        onClick(event);
      }
    }}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
  >
    <span>{children}</span>
    {sorted === "asc" && (
      <ChevronUpIcon aria-hidden="true" className="opacity-60" size={14} />
    )}
    {sorted === "desc" && (
      <ChevronDownIcon aria-hidden="true" className="opacity-60" size={14} />
    )}
  </div>
);

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableHiding: false,
    enableSorting: false,
    size: 28,
  },
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
    cell: ({ row }) => <RowActions user={row.original} />,
    enableHiding: false,
    enableSorting: false,
    size: 60,
  },
];
