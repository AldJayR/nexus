"use client";

import {
  type ColumnFiltersState,
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
  GenericTableBody,
  GenericTableHeader,
} from "@/components/shared/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table } from "@/components/ui/table";
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
  const [selfDeleteAlertOpen, setSelfDeleteAlertOpen] = useState(false);

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

  const handleAction = async (actionId: string, user: User) => {
    if (actionId === "delete") {
      // Validate: prevent deletion of current user's account
      if (currentUser?.id === user.id) {
        setSelfDeleteAlertOpen(true);
        return;
      }
      await withLoading(user.id, async () => {
        await deleteUser(user.id);
      })();
    } else if (actionId === "restore") {
      await withLoading(user.id, async () => {
        await restoreUser(user.id);
      })();
    }
  };

  const columns = createColumns({
    onAction: handleAction,
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
          <GenericTableHeader table={table} />
          <GenericTableBody
            emptyMessage="No team members found."
            table={table}
          />
        </Table>
      </div>

      <AlertDialog
        onOpenChange={setSelfDeleteAlertOpen}
        open={selfDeleteAlertOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cannot delete personal account</AlertDialogTitle>
            <AlertDialogDescription>
              Your personal team lead account cannot be deleted. If you need to
              deactivate your role, please contact an administrator.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setSelfDeleteAlertOpen(false)}>
            Understood
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
