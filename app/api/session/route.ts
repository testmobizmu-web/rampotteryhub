// app/api/session/route.ts
import { NextRequest, NextResponse } from "next/server";

type SessionUser = {
  id: number | string;
  username: string;
  role?: string;
};

function isSessionUser(x: any): x is SessionUser {
  return x && (typeof x.id === "number" || typeof x.id === "string") && typeof x.username === "string";
}

export async function GET(req: NextRequest) {
  try {
    const raw = req.cookies.get("rp_session")?.value;
    if (!raw) return NextResponse.json({ ok: false }, { status: 401 });

    let session: any = null;
    try {
      session = JSON.parse(raw);
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 401 });
    }

    if (!isSessionUser(session)) {
      return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 401 });
    }

    return NextResponse.json({ ok: true, session });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Invalid session" },
      { status: 401 }
    );
  }
}
