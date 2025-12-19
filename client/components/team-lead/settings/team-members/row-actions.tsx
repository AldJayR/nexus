"use client";

import { EllipsisIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/lib/types/models";

type RowActionsProps = {
  user: User;
  onEdit?: (user: User) => void;
  onSoftDelete?: (user: User) => Promise<void>;
  onRestore?: (user: User) => Promise<void>;
  isLoading?: boolean;
};

export function RowActions({
  user,
  onEdit,
  onSoftDelete,
  onRestore,
  isLoading = false,
}: RowActionsProps) {
  const isDeleted = !!user.deletedAt;

  const handleSoftDelete = async () => {
    if (onSoftDelete) {
      await onSoftDelete(user);
    }
  };

  const handleRestore = async () => {
    if (onRestore) {
      await onRestore(user);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-end">
          <Button
            aria-label="Member actions"
            className="shadow-none"
            disabled={isLoading}
            size="icon"
            variant="ghost"
          >
            <EllipsisIcon aria-hidden="true" size={16} />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!isDeleted && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onEdit?.(user)}>
                Edit
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        {isDeleted ? (
          <DropdownMenuGroup>
            <DropdownMenuItem disabled={isLoading} onClick={handleRestore}>
              {isLoading ? "Restoring..." : "Restore"}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        ) : (
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="text-amber-600"
              disabled={isLoading}
              onClick={handleSoftDelete}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
