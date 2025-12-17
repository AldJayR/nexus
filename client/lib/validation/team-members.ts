import { z } from "zod";

/**
 * Team Members Validation Schemas
 * Centralized schemas for team member management forms
 */

// Invite member form
export const inviteMemberSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  role: z.enum(["MEMBER", "TEAM_LEAD", "ADVISER"]),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

// Edit member form
export const editMemberSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .optional(),
  role: z.enum(["MEMBER", "TEAM_LEAD", "ADVISER"]).optional(),
});

export type EditMemberInput = z.infer<typeof editMemberSchema>;

// Update member role (quick action)
export const updateMemberRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(["MEMBER", "TEAM_LEAD", "ADVISER"]),
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

// Bulk member actions
export const bulkMemberActionsSchema = z.object({
  userIds: z
    .array(z.string().min(1))
    .min(1, "At least one member must be selected"),
  action: z.enum(["DELETE", "DEACTIVATE", "RESTORE"]),
});

export type BulkMemberActionsInput = z.infer<typeof bulkMemberActionsSchema>;

// Search/filter members
export const memberSearchSchema = z.object({
  query: z.string().optional(),
  role: z.enum(["MEMBER", "TEAM_LEAD", "ADVISER"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  page: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(100).optional(),
});

export type MemberSearchInput = z.infer<typeof memberSearchSchema>;
