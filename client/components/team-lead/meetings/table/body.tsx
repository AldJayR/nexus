"use client";

import {
	type ColumnFiltersState,
	getCoreRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import {
	ChevronDownIcon,
	ChevronFirstIcon,
	ChevronLastIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronUpIcon,
} from "lucide-react";
import { useId, useMemo, useState } from "react";

import { deleteMeetingLog } from "@/actions/meetings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table } from "@/components/ui/table";
import { GenericTableBody, GenericTableHeader } from "@/components/shared/table";
import type { MeetingLog, Phase, Sprint } from "@/lib/types";
import { toast } from "sonner";

import {
	Pagination,
	PaginationContent,
	PaginationItem,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { createMeetingColumns, type MeetingsTableRow } from ".";
import { MeetingsTableControls } from "./controls";

type MeetingsTableProps = {
	initialLogs: MeetingLog[];
	sprints: Sprint[];
	phases: Phase[];
};

export function MeetingsTable({ initialLogs, phases, sprints }: MeetingsTableProps) {
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
	const [globalFilter, setGlobalFilter] = useState("");
	const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

	const withLoading = async (ids: string[], callback: () => Promise<void>) => {
		setDeletingIds((prev) => {
			const next = new Set(prev);
			for (const id of ids) next.add(id);
			return next;
		});
		try {
			await callback();
		} finally {
			setDeletingIds((prev) => {
				const next = new Set(prev);
				for (const id of ids) next.delete(id);
				return next;
			});
		}
	};

	const { columns, toRows } = useMemo(
		() =>
			createMeetingColumns({
				phases,
				sprints,
				loadingIds: deletingIds,
				onAction: async (actionId, row) => {
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
			}),
		[deletingIds, phases, sprints]
	);

	const tableData: MeetingsTableRow[] = useMemo(() => toRows(data), [data, toRows]);

	const table = useReactTable({
		columns,
		data: tableData,
		enableSortingRemoval: false,
		getCoreRowModel: getCoreRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onGlobalFilterChange: setGlobalFilter,
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		state: {
			columnFilters,
			columnVisibility,
			globalFilter,
			pagination,
			sorting,
		},
	});

	const uniqueScopeValues = useMemo(() => {
		const column = table.getColumn("scope");
		if (!column) return [];
		const values = Array.from(column.getFacetedUniqueValues().keys());
		return values.sort();
	}, [table]);

	const scopeCounts = useMemo(() => {
		const column = table.getColumn("scope");
		if (!column) return new Map<string, number>();
		return column.getFacetedUniqueValues() as Map<string, number>;
	}, [table]);

	return (
		<div className="space-y-4">
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
					<GenericTableBody table={table} emptyMessage="No meeting minutes found." />
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
					<p aria-live="polite" className="whitespace-nowrap text-muted-foreground text-sm">
						<span className="text-foreground">
							{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
							{Math.min(
								Math.max(
									table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
										table.getState().pagination.pageSize,
									0
								),
								table.getRowCount()
							)}
						</span>{" "}
						of <span className="text-foreground">{table.getRowCount().toString()}</span>
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
