import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PREFIXES = [
  "/api/login",
  "/_next",
];

const PUBLIC_EXACT = [
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

function isPublicAsset(pathname: string) {
  if (PUBLIC_EXACT.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const rpSession = req.cookies.get("rp_session")?.value;
  const isLoggedIn = !!rpSession;

  // ✅ Always allow /login page, BUT redirect away if already logged in
  if (pathname === "/login") {
    if (isLoggedIn) {
      const dash = req.nextUrl.clone();
      dash.pathname = "/";
      dash.search = "";
      return NextResponse.redirect(dash);
    }
    return NextResponse.next();
  }

  // Allow public assets + login API
  if (isPublicAsset(pathname)) return NextResponse.next();

  // Protect everything else
  if (!isLoggedIn) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map)$).*)",
  ],
};

