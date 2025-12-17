import { type NextRequest, NextResponse } from "next/server";

// Temporary: disable route protection so the client can be used
// while the server is not available. Revert this change when ready.
export async function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
