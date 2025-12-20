"use client";

import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";
import { deleteUser, restoreUser } from "@/actions/team-members";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { User } from "@/lib/types/models";
import { createColumns } from "./columns";
import { TeamMembersFilters } from "./filters";
import { InviteMemberModal } from "./invite-modal";

type TeamMembersTableProps = {
  data: User[];
  currentUser: User | null;
};

export function TeamMembersTable({ data, currentUser }: TeamMembersTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [loadingUserIds, setLoadingUserIds] = useState<Set<string>>(new Set());

  const withLoading =
    (userId: string, callback: () => Promise<void>) => async () => {
      setLoadingUserIds((prev) => new Set(prev).add(userId));
      try {
        await callback();
      } finally {
        setLoadingUserIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    };

  const handleSoftDelete = async (user: User) => {
    await withLoading(user.id, async () => {
      await deleteUser(user.id);
    })();
  };

  const handleRestore = async (user: User) => {
    await withLoading(user.id, async () => {
      await restoreUser(user.id);
    })();
  };

  const columns = createColumns({
    onSoftDelete: handleSoftDelete,
    onRestore: handleRestore,
    loadingUserIds,
    currentUser,
  });

  const table = useReactTable({
    columns,
    data,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: { columnFilters, columnVisibility, sorting, pagination },
  });

  const multiColumnFilterFn = (value: string) => {
    table.getColumn("name")?.setFilterValue(value);
  };

  return (
    <div className="space-y-4">
      <TeamMembersFilters
        onAddUser={() => {
          setInviteModalOpen(true);
        }}
        onSearch={multiColumnFilterFn}
      />

      <InviteMemberModal
        onOpenChange={setInviteModalOpen}
        onSuccess={(_user) => {
          // Table will be automatically refreshed by revalidatePath from the server action wupwup
        }}
        open={inviteModalOpen}
      />

      <div className="overflow-hidden rounded-md border bg-background">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="hover:bg-transparent" key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: `${header.getSize()}px` }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  data-state={row.getIsSelected() && "selected"}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="last:py-0" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  No members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
