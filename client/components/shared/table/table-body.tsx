"use client";

import { flexRender } from "@tanstack/react-table";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { GenericTableBodyProps } from "./types";

/**
 * Generic Table Body Component
 * Renders table rows and cells with flexRender for column customization
 *
 * @example
 * ```tsx
 * <Table>
 *   <TableHeader>...</TableHeader>
 *   <GenericTableBody table={table} emptyMessage="No data found" />
 * </Table>
 * ```
 */
export function GenericTableBody<T>({
  table,
  emptyMessage = "No data found",
}: GenericTableBodyProps<T>) {
  return (
    <TableBody>
      {table.getRowModel().rows.length ? (
        table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell className="last:py-0" key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell
            className="h-24 text-center text-muted-foreground"
            colSpan={table.getAllColumns().length}
          >
            {emptyMessage}
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}
