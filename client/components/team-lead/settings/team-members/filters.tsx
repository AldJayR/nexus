"use client";

import { CircleXIcon, ListFilterIcon, PlusIcon } from "lucide-react";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TeamMembersFiltersProps = {
  onSearch: (value: string) => void;
  onAddUser: () => void;
};

export function TeamMembersFilters({
  onSearch,
  onAddUser,
}: TeamMembersFiltersProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState("");

  const handleClear = () => {
    setSearchValue("");
    onSearch("");
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="relative">
        <Input
          aria-label="Filter by name or email"
          className={cn("peer min-w-60 ps-9", searchValue && "pe-9")}
          id={`${id}-input`}
          onChange={(e) => {
            setSearchValue(e.target.value);
            onSearch(e.target.value);
          }}
          placeholder="Filter by name or email..."
          ref={inputRef}
          type="text"
          value={searchValue}
        />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          <ListFilterIcon aria-hidden="true" size={16} />
        </div>
        {searchValue && (
          <button
            aria-label="Clear filter"
            className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            onClick={handleClear}
            type="button"
          >
            <CircleXIcon aria-hidden="true" size={16} />
          </button>
        )}
      </div>
      <Button onClick={onAddUser}>
        <PlusIcon aria-hidden="true" className="-ms-1 opacity-60" size={16} />
        Invite Member
      </Button>
    </div>
  );
}
