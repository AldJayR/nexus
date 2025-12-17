import { unauthorized } from "next/navigation";
import type { ReactNode } from "react";
import { type AppRole, auth } from "@/auth";

type UserRole = AppRole;

export default async function AuthLayout({
  children: _children,
  member,
  "team-lead": teamLead,
  adviser,
}: {
  children: ReactNode;
  member: ReactNode;
  "team-lead": ReactNode;
  adviser: ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    unauthorized();
  }

  const currentRole: UserRole = session.user.role;

  switch (currentRole) {
    case "member":
      return <>{member}</>;
    case "teamLead":
      return <>{teamLead}</>;
    case "adviser":
      return <>{adviser}</>;
    default: {
      const _exhaustive: never = currentRole;
      return _exhaustive;
    }
  }
}
