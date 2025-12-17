"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createApiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ServerActionResponse } from "@/lib/types";

const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function loginAction(
  input: unknown
): Promise<ServerActionResponse> {
  const parsed = loginInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const client = await createApiClient();
    const response = await client.post(API_ENDPOINTS.AUTH.LOGIN, parsed.data);

    const data = response.data as { token?: string; user?: unknown };

    console.log("Login response status:", response.status);
    console.log("Login response data:", data);

    if (!data.token) {
      console.error("No token in response:", data);
      return { success: false, error: "Login failed - no token received" };
    }

    const cookieStore = await cookies();
    cookieStore.set("auth_token", data.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    redirect("/dashboard");
  } catch (error) {
    // Re-throw Next.js redirect errors so they can be handled properly
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }

    console.error("Login error:", error);
    const message =
      error instanceof Error ? error.message : "Invalid email or password";
    return {
      success: false,
      error: message,
    };
  }
}
