import type { NextRequest } from "next/server";

const _PUBLIC_PATHS = new Set<string>(["/login"]);

export function proxy(_request: NextRequest) {
  // const { pathname } = request.nextUrl;
  // if (
  //   pathname.startsWith("/_next") ||
  //   pathname.startsWith("/api") ||
  //   pathname.startsWith("/favicon") ||
  //   pathname === "/robots.txt" ||
  //   pathname === "/sitemap.xml" ||
  //   pathname === "/manifest.webmanifest" ||
  //   pathname.startsWith("/icons/") ||
  //   pathname.startsWith("/images/")
  // ) {
  //   return NextResponse.next();
  // }
  // if (PUBLIC_PATHS.has(pathname)) {
  //   return NextResponse.next();
  // }
  // // TODO: Replace with real auth check (cookie/JWT).
  // const isAuthenticated = false;
  // if (!isAuthenticated) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = "/login";
  //   url.searchParams.set("next", pathname);
  //   return NextResponse.redirect(url);
  // }
  // return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\.).*)"],
};
