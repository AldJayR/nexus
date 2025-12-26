"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();

  // Overwrite with an expired date to force the browser to trash it
  cookieStore.set("auth_token", "", {
    expires: new Date(0),
    path: "/",
  });

  // Then perform the standard delete
  cookieStore.delete("auth_token");

  redirect("/login");
}
