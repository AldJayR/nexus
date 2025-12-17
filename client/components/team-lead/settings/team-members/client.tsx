"use client";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@/lib/types/models";
import { TeamMembersTable } from "./table";

type TeamMembersClientProps = {
  data: User[];
  onDelete?: (userIds: string[]) => Promise<void>;
  onAddUser?: () => void;
};

function TeamMembersLoading() {
  return <Skeleton className="h-96" />;
}

export function TeamMembersClient({
  data,
  onDelete,
  onAddUser,
}: TeamMembersClientProps) {
  return (
    <Suspense fallback={<TeamMembersLoading />}>
      <TeamMembersTable data={data} onAddUser={onAddUser} onDelete={onDelete} />
    </Suspense>
  );
}
