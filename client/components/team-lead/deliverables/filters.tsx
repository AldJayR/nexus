"use client";

import { CircleXIcon, LayoutGrid, List, Search } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatTitleCase } from "@/lib/helpers";
import type { Phase } from "@/lib/types";
import { DeliverableStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { PhaseFilter, StatusFilter, ViewMode } from "./deliverables-types";

type DeliverablesFiltersProps = {
  phases: Phase[];

  query: string;
  onQueryChange: (value: string) => void;

  phaseFilter: PhaseFilter;
  onPhaseFilterChange: (value: PhaseFilter) => void;

  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;

  viewMode: ViewMode;
  onViewModeChange: (value: ViewMode) => void;
};

export function DeliverablesFilters({
  phases,
  query,
  onQueryChange,
  phaseFilter,
  onPhaseFilterChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
}: DeliverablesFiltersProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState(query);

  const statusItems = useMemo(() => Object.values(DeliverableStatus), []);

  const handleClear = () => {
    setSearchValue("");
    onQueryChange("");
    inputRef.current?.focus();
  };

  return (
    <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-md">
        <Input
          aria-label="Search deliverables"
          className={cn("peer pl-9", searchValue && "pe-9")}
          id={`${id}-input`}
          onChange={(e) => {
            setSearchValue(e.target.value);
            onQueryChange(e.target.value);
          }}
          placeholder="Search deliverables"
          ref={inputRef}
          type="text"
          value={searchValue}
        />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground peer-disabled:opacity-50">
          <Search aria-hidden="true" className="h-4 w-4" />
        </div>
        {!!searchValue && (
          <button
            aria-label="Clear search"
            className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            onClick={handleClear}
            type="button"
          >
            <CircleXIcon aria-hidden="true" size={16} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          onValueChange={(value) => onPhaseFilterChange(value)}
          value={phaseFilter}
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="All phases" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All phases</SelectItem>
            {phases.map((phase) => (
              <SelectItem key={phase.id} value={phase.id}>
                {phase.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) =>
            onStatusFilterChange(
              value === "ALL" ? "ALL" : (value as DeliverableStatus)
            )
          }
          value={statusFilter}
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {statusItems.map((status) => (
              <SelectItem key={status} value={status}>
                {formatTitleCase(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center rounded-lg border bg-background p-1">
          <Button
            aria-label="Grid view"
            className={cn("h-8 w-8", viewMode === "grid" ? "bg-muted" : "")}
            onClick={() => onViewModeChange("grid")}
            size="icon"
            type="button"
            variant="ghost"
          >
            <LayoutGrid aria-hidden="true" className="h-4 w-4" />
          </Button>
          <Button
            aria-label="List view"
            className={cn("h-8 w-8", viewMode === "list" ? "bg-muted" : "")}
            onClick={() => onViewModeChange("list")}
            size="icon"
            type="button"
            variant="ghost"
          >
            <List aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
