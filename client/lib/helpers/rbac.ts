/**
 * Role-Based Access Control Helpers
 *
 * Server-side security validation for role-based operations.
 * These functions provide the actual security enforcement layer.
 *
 * Usage:
 * - Call in every server action that modifies data
 * - Always check user session before resource operations
 * - Combine role checks with resource ownership verification
 *
 * @module lib/helpers/rbac
 */

import type { AppRole } from "@/auth";
import { auth } from "@/auth";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Ensures user has a valid session
 * @throws {UnauthorizedError} if no session exists
 * @returns {Promise<{ id: string; role: AppRole; email?: string }>} Current user
 */
export async function requireUser() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthorizedError("No active session");
  }

  return {
    id: session.user.id,
    role: session.user.role,
    email: session.user.email,
  };
}

/**
 * Ensures user has one of the specified roles
 * @throws {ForbiddenError} if user role is not in allowedRoles
 * @returns {Promise<{id: string; role: AppRole}>} Current user
 */
export async function requireRole(...allowedRoles: AppRole[]) {
  const user = await requireUser();

  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError(
      `This action requires one of these roles: ${allowedRoles.join(", ")}`
    );
  }

  return user;
}

/**
 * Ensures user is a Team Lead
 * @throws {ForbiddenError} if user is not a teamLead
 * @returns {Promise<{id: string; role: "teamLead"}>} Current user
 */
export async function requireTeamLead() {
  const user = await requireRole("teamLead");
  return { id: user.id, role: user.role as "teamLead" };
}

/**
 * Ensures user is a Team Member
 * @throws {ForbiddenError} if user is not a member
 * @returns {Promise<{id: string; role: "member"}>} Current user
 */
export async function requireMember() {
  const user = await requireRole("member");
  return { id: user.id, role: user.role as "member" };
}

/**
 * Ensures user is an Adviser
 * @throws {ForbiddenError} if user is not an adviser
 * @returns {Promise<{id: string; role: "adviser"}>} Current user
 */
export async function requireAdviser() {
  const user = await requireRole("adviser");
  return { id: user.id, role: user.role as "adviser" };
}

/**
 * Ensures user is either a Team Lead or Member
 * (Cannot be Adviser - used for contributors)
 * @throws {ForbiddenError} if user is an adviser
 * @returns {Promise<{id: string; role: "teamLead" | "member"}>} Current user
 */
export async function requireContributor() {
  const user = await requireRole("teamLead", "member");
  return { id: user.id, role: user.role as "teamLead" | "member" };
}

/**
 * Ensures user can access a resource they're assigned to
 * @throws {ForbiddenError} if user is not assigned to the resource
 */
export async function requireResourceAssignment(
  resourceAssigneeId: string | null | undefined
) {
  const user = await requireUser();

  if (resourceAssigneeId !== user.id) {
    throw new ForbiddenError("You are not assigned to this resource");
  }
}

/**
 * Checks if user has permission for an action based on role
 * Used for conditional rendering guidance (not security enforcement)
 * @returns {boolean} Whether user can perform the action
 */
export async function canUserPerformAction(action: string, role: AppRole) {
  const rolePermissions: Record<string, AppRole[]> = {
    approve_deliverable: ["teamLead"],
    request_changes: ["teamLead"],
    upload_deliverable_evidence: ["member"],
    upload_meeting_minutes: ["teamLead", "member"],
    update_own_task: ["member", "teamLead"],
    update_any_task: ["teamLead"],
    manage_team: ["teamLead"],
  };

  const allowedRoles = rolePermissions[action] || [];
  return allowedRoles.includes(role);
}
