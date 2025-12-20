"use client";

import type { User } from "@/lib/types/models";
import { TeamMembersTable } from "./table";

type TeamMembersClientProps = {
  data: User[];
  currentUser: User | null;
};

export function TeamMembersClient({
  data,
  currentUser,
}: TeamMembersClientProps) {
  return <TeamMembersTable currentUser={currentUser} data={data} />;
}
