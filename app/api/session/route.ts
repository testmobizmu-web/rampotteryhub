// app/api/session/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const raw = req.cookies.get("rp_session")?.value;

    if (!raw) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const session = JSON.parse(raw);
    return NextResponse.json({ ok: true, session });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Invalid session" },
      { status: 401 }
    );
  }
}
