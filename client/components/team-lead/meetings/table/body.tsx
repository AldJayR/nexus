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
import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useCallback, useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { deleteMeetingLog } from "@/actions/meetings";
import {
  GenericTableBody,
  GenericTableHeader,
} from "@/components/shared/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import type { MeetingLog, Phase, Sprint } from "@/lib/types";
import { createMeetingColumns, type MeetingsTableRow } from ".";
import { MeetingsTableControls } from "./controls";

type MeetingsTableProps = {
  initialLogs: MeetingLog[];
  sprints: Sprint[];
  phases: Phase[];
};

export function MeetingsTable({
  initialLogs,
  phases,
  sprints,
}: MeetingsTableProps) {
  const id = useId();
  const [data, setData] = useState<MeetingLog[]>(initialLogs);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const withLoading = useCallback(async (ids: string[], callback: () => Promise<void>) => {
    setDeletingIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        next.add(id);
      }
      return next;
    });
    try {
      await callback();
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        for (const id of ids) {
          next.delete(id);
        }
        return next;
      });
    }
  }, []);

  const handleAction = useCallback(
    async (actionId: string, row: MeetingLog) => {
      if (actionId === "delete") {
        try {
          await withLoading([row.id], async () => {
            await deleteMeetingLog(row.id);
          });
          toast.success("Meeting minutes deleted");
          setData((prev) => prev.filter((l) => l.id !== row.id));
        } catch {
          toast.error("Failed to delete meeting minutes");
        }
      }
    },
    [withLoading]
  );

  const { columns, toRows } = useMemo(
    () =>
      createMeetingColumns({
        phases,
        sprints,
        loadingIds: deletingIds,
        onAction: handleAction,
      }),
    [deletingIds, phases, sprints, handleAction]
  );

  const tableData: MeetingsTableRow[] = useMemo(
    () => toRows(data),
    [data, toRows]
  );

  const table = useReactTable({
    columns,
    data: tableData,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      columnVisibility,
      pagination,
      sorting,
    },
  });

  // Calculate scope counts directly from filtered data instead of using expensive faceting
  // Using columnFilters and data as dependencies instead of table.getFilteredRowModel().rows
  // to ensure stable memoization
  const scopeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    
    // Get current filter state
    const scopeFilter = columnFilters.find(f => f.id === "scope")?.value as string[] | undefined;
    
    // Filter data based on current filters
    let filteredData = data;
    
    // Apply scope filter if active
    if (scopeFilter && scopeFilter.length > 0) {
      filteredData = data.filter(log => {
        const scope = log.sprintId ? "Sprint" : log.phaseId ? "Phase" : "Unassigned";
        return scopeFilter.includes(scope);
      });
    }
    
    // Count scopes
    for (const log of filteredData) {
      const scope = log.sprintId ? "Sprint" : log.phaseId ? "Phase" : "Unassigned";
      counts.set(scope, (counts.get(scope) || 0) + 1);
    }
    
    return counts;
  }, [data, columnFilters]);

  const uniqueScopeValues = useMemo(() => {
    return Array.from(scopeCounts.keys()).sort();
  }, [scopeCounts]);

  return (
    <div className="space-y-8">
      <MeetingsTableControls
        phases={phases}
        scopeCounts={scopeCounts}
        sprints={sprints}
        table={table}
        uniqueScopeValues={uniqueScopeValues}
      />

      <div className="overflow-hidden rounded-md border bg-background">
        <Table className="table-fixed">
          <GenericTableHeader table={table} />
          <GenericTableBody
            emptyMessage="No meeting minutes found."
            table={table}
          />
        </Table>
      </div>

      <div className="flex items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <Label className="max-sm:sr-only" htmlFor={id}>
            Rows per page
          </Label>
          <Select
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
            value={table.getState().pagination.pageSize.toString()}
          >
            <SelectTrigger className="w-fit whitespace-nowrap" id={id}>
              <SelectValue placeholder="Select number of results" />
            </SelectTrigger>
            <SelectContent className="[&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8">
              {[5, 10, 25, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex grow justify-end whitespace-nowrap text-muted-foreground text-sm">
          <p
            aria-live="polite"
            className="whitespace-nowrap text-muted-foreground text-sm"
          >
            <span className="text-foreground">
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}
              -
              {Math.min(
                Math.max(
                  table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    table.getState().pagination.pageSize,
                  0
                ),
                table.getRowCount()
              )}
            </span>{" "}
            of{" "}
            <span className="text-foreground">
              {table.getRowCount().toString()}
            </span>
          </p>
        </div>
        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  aria-label="Go to first page"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.firstPage()}
                  size="icon"
                  variant="outline"
                >
                  <ChevronFirstIcon aria-hidden="true" size={16} />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  aria-label="Go to previous page"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.previousPage()}
                  size="icon"
                  variant="outline"
                >
                  <ChevronLeftIcon aria-hidden="true" size={16} />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  aria-label="Go to next page"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.nextPage()}
                  size="icon"
                  variant="outline"
                >
                  <ChevronRightIcon aria-hidden="true" size={16} />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  aria-label="Go to last page"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.lastPage()}
                  size="icon"
                  variant="outline"
                >
                  <ChevronLastIcon aria-hidden="true" size={16} />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
