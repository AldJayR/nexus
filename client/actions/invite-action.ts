"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authApi } from "@/lib/api/auth";
import type { ServerActionResponse } from "@/lib/types/auth";
import type { User } from "@/lib/types/models";
import { inviteMemberSchema } from "@/lib/validation/team-members";

export async function inviteMember(
  input: unknown
): Promise<ServerActionResponse<User>> {
  try {
    // Validate input using centralized schema
    const validated = inviteMemberSchema.parse(input);

    // Call API
    const user = await authApi.inviteUser(
      validated.email,
      validated.name,
      validated.role
    );

    // Revalidate the team members page to refresh the table
    revalidatePath("/settings/team-members");

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Please check your input and try again",
        fieldErrors: error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    console.error("Failed to invite member:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to invite member. Please try again.",
    };
  }
}
