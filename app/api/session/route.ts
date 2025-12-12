// app/api/session/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const raw = cookies().get("rp_session")?.value;
    if (!raw) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(raw);
    } catch {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    return NextResponse.json({ ok: true, session });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Unable to load session." },
      { status: 500 }
    );
  }
}
