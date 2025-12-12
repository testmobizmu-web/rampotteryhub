// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/login", "/favicon.ico"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths and static files
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/public/")
  ) {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get("rp_session")?.value;

  if (!sessionCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Later we can parse JSON and check role/permissions.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/public|_next/static|_next/image|favicon.ico).*)"],
};
