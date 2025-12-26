import { NextRequest, NextResponse } from "next/server";

/* ---------------- PUBLIC PATHS ---------------- */

function isPublicPath(pathname: string) {
  // Login page
  if (pathname === "/login") return true;

  // Auth / session APIs
  if (pathname === "/api/auth/login") return true;
  if (pathname === "/api/login") return true;
  if (pathname === "/api/session") return true;

  // Next internals & static
  if (pathname.startsWith("/_next/")) return true;
  if (pathname === "/favicon.ico") return true;
  if (pathname === "/robots.txt") return true;
  if (pathname.startsWith("/sitemap")) return true;

  // Public assets
  if (pathname.startsWith("/images/")) return true;

  return false;
}

/* ---------------- SESSION CHECK ---------------- */

function hasValidSession(req: NextRequest) {
  const raw = req.cookies.get("rp_session")?.value;
  if (!raw) return false;

  try {
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.id && parsed?.username);
  } catch {
    return false;
  }
}

/* ---------------- MIDDLEWARE ---------------- */

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Allow if logged in
  if (hasValidSession(req)) {
    return NextResponse.next();
  }

  // API calls → 401 JSON
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Page request → redirect to login
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("returnTo", pathname);

  return NextResponse.redirect(loginUrl);
}

/* ---------------- CONFIG ---------------- */

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};
