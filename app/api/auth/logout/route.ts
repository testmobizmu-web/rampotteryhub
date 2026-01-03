// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });

  const isProd = process.env.NODE_ENV === "production";

  res.cookies.set("rp_session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 0,
  });

  return res;
}
