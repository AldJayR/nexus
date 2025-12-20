"use client";

import { EllipsisIcon } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/lib/types/models";

type RowActionsProps = {
  user: User;
  currentUser?: User | null;
  onSoftDelete?: (user: User) => Promise<void>;
  onRestore?: (user: User) => Promise<void>;
  isLoading?: boolean;
};

export function RowActions({
  user,
  currentUser,
  onSoftDelete,
  onRestore,
  isLoading = false,
}: RowActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isDeleted = !!user.deletedAt;
  const isSelf = currentUser?.id === user.id;

  const handleSoftDelete = async () => {
    if (onSoftDelete) {
      await onSoftDelete(user);
      setShowDeleteDialog(false);
    }
  };

  const handleRestore = async () => {
    if (onRestore) {
      await onRestore(user);
    }
  };

  return (
    <>
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
                disabled={isLoading || isSelf}
                onClick={() => setShowDeleteDialog(true)}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate {user.name}&apos;s account. They will no
              longer be able to log in, but their data will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleSoftDelete();
              }}
            >
              {isLoading ? "Deactivating..." : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
