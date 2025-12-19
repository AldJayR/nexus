"use client";

import type { User } from "@/lib/types/models";
import { TeamMembersTable } from "./table";

type TeamMembersClientProps = {
  data: User[];
  onDelete?: (userIds: string[]) => Promise<void>;
  onAddUser?: () => void;
};

export function TeamMembersClient({
  data,
  onDelete,
  onAddUser,
}: TeamMembersClientProps) {
  return (
    <TeamMembersTable data={data} onAddUser={onAddUser} onDelete={onDelete} />
  );
}
