"use client";

import {
  CircleXIcon,
  Columns3Icon,
  FilterIcon,
  ListFilterIcon,
} from "lucide-react";
import { useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { GenericTableFiltersProps } from "./types";

/**
 * Generic Table Filters Component
 * Renders search input, dynamic filter popover, and column visibility toggle
 * Uses configuration to define available filters
 *
 * @example
 * ```tsx
 * <GenericTableFilters
 *   table={table}
 *   id="meetings-table"
 *   config={{
 *     search: { enabled: true, placeholder: "Search..." },
 *     filters: [
 *       { id: 'scope', columnId: 'scope', label: 'Scope', options: [...] }
 *     ],
 *     columnVisibility: { enabled: true }
 *   }}
 * />
 * ```
 */
export function GenericTableFilters<T>({
  table,
  config,
}: GenericTableFiltersProps<T>) {
  const filterId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const searchValue = (table.getState().globalFilter ?? "") as string;

  // Build filter state from first filter config (handles main filter logic)
  const primaryFilter = config.filters[0];
  const primaryFilterValue = primaryFilter
    ? ((table
        .getColumn(primaryFilter.columnId)
        ?.getFilterValue() as string[]) ?? [])
    : [];
  const primaryFilterCount = primaryFilterValue.length;

  const handleToggleFilter = (
    checked: boolean,
    value: string,
    columnId: string
  ) => {
    const current =
      (table.getColumn(columnId)?.getFilterValue() as string[]) ?? [];
    const next = checked
      ? [...current, value]
      : current.filter((s) => s !== value);
    table.getColumn(columnId)?.setFilterValue(next.length ? next : undefined);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Filter */}
        {config.search.enabled ? (
          <div className="relative">
            <Input
              aria-label={config.search.ariaLabel || "Filter table"}
              className={`peer min-w-80 ps-9 ${searchValue ? "pe-9" : ""}`}
              id={`${filterId}-search`}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
              placeholder={config.search.placeholder || "Search..."}
              ref={inputRef}
              type="text"
              value={searchValue}
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
              <ListFilterIcon aria-hidden="true" size={16} />
            </div>
            {searchValue ? (
              <button
                aria-label="Clear search filter"
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => {
                  table.setGlobalFilter("");
                  inputRef.current?.focus();
                }}
                type="button"
              >
                <CircleXIcon aria-hidden="true" size={16} />
              </button>
            ) : null}
          </div>
        ) : null}

        {/* Dynamic Filter Popovers */}
        {config.filters.map((filterConfig, filterIndex) => (
          <Popover key={filterConfig.id}>
            <PopoverTrigger asChild>
              <Button
                aria-haspopup="dialog"
                aria-label={`Filter by ${filterConfig.label}`}
                variant="outline"
              >
                <FilterIcon
                  aria-hidden="true"
                  className="-ms-1 opacity-60"
                  size={16}
                />
                {filterConfig.label}
                {filterIndex === 0 && primaryFilterCount > 0 && (
                  <span
                    className="-me-1 inline-flex h-5 max-h-full items-center rounded border bg-background px-1 font-[inherit] font-medium text-[0.625rem] text-muted-foreground/70"
                    title={`${primaryFilterCount} filters active`}
                  >
                    {primaryFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              aria-label={`${filterConfig.label} filter options`}
              className="w-auto min-w-36 p-3"
              role="dialog"
              suppressHydrationWarning
            >
              <div className="space-y-3">
                <div className="font-medium text-muted-foreground text-xs">
                  {filterConfig.label}
                </div>
                <fieldset className="space-y-3">
                  {filterConfig.options.map((option, optionIndex) => (
                    <div className="flex items-center gap-2" key={option.value}>
                      <Checkbox
                        aria-label={`Filter by ${option.label || option.value}`}
                        checked={
                          filterIndex === 0
                            ? primaryFilterValue.includes(option.value)
                            : false
                        }
                        id={`${filterId}-${filterConfig.id}-${optionIndex}`}
                        onCheckedChange={(checked) =>
                          handleToggleFilter(
                            checked === true,
                            option.value,
                            filterConfig.columnId
                          )
                        }
                      />
                      <Label
                        className="flex grow cursor-pointer justify-between gap-2 font-normal"
                        htmlFor={`${filterId}-${filterConfig.id}-${optionIndex}`}
                      >
                        {option.label || option.value}{" "}
                        {option.count !== undefined && (
                          <span className="ms-2 text-muted-foreground text-xs">
                            ({option.count})
                          </span>
                        )}
                      </Label>
                    </div>
                  ))}
                </fieldset>
              </div>
            </PopoverContent>
          </Popover>
        ))}

        {/* Column Visibility Toggle */}
        {config.columnVisibility.enabled ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Columns3Icon
                  aria-hidden="true"
                  className="-ms-1 opacity-60"
                  size={16}
                />
                {config.columnVisibility.label || "View"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    checked={column.getIsVisible()}
                    className="capitalize"
                    key={column.id}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                    onSelect={(event) => event.preventDefault()}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      {/* Additional Actions Slot */}
      {config.additionalActions}
    </div>
  );
}
