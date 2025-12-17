"use client";

import { EllipsisIcon } from "lucide-react";
import { useState } from "react";
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
  onResendInvite?: (user: User) => Promise<void>;
  onDeactivate?: (user: User) => Promise<void>;
  onRestore?: (user: User) => Promise<void>;
  onDelete?: (user: User) => Promise<void>;
};

export function RowActions({
  user,
  onEdit,
  onResendInvite,
  onDeactivate,
  onRestore,
  onDelete,
}: RowActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const isDeleted = !!user.deletedAt;

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    try {
      if (onDeactivate) {
        await onDeactivate(user);
      }
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(user);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-end">
          <Button
            aria-label="Member actions"
            className="shadow-none"
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
              <DropdownMenuItem onClick={() => onResendInvite?.(user)}>
                Resend Invitation
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        {isDeleted ? (
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onRestore?.(user)}>
              Restore
            </DropdownMenuItem>
          </DropdownMenuGroup>
        ) : (
          <DropdownMenuGroup>
            <DropdownMenuItem
              disabled={isDeactivating}
              onClick={handleDeactivate}
            >
              {isDeactivating ? "Deactivating..." : "Deactivate"}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            disabled={isDeleting}
            onClick={handleDelete}
            variant="destructive"
          >
            {isDeleting ? "Deleting..." : "Delete Permanently"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
