import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

export const runtime = "nodejs";

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !(service || anon)) throw new Error("Missing Supabase env");
  return createClient(url, service || anon!, { auth: { persistSession: false } });
}

function isLocked(status: any, stock_reversed_at: any) {
  const s = String(status || "").toUpperCase();
  // ✅ lock anything not DRAFT, and also lock if stock already reversed
  return s !== "DRAFT" || !!stock_reversed_at;
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    const id = Number(body?.id);
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const supabase = supaAdmin();

    // ✅ Read current status
    const { data: cn, error: cnErr } = await supabase
      .from("credit_notes")
      .select("id, status, stock_reversed_at")
      .eq("id", id)
      .maybeSingle();

    if (cnErr) return NextResponse.json({ ok: false, error: cnErr.message }, { status: 500 });
    if (!cn) return NextResponse.json({ ok: false, error: "Credit note not found" }, { status: 404 });

    if (isLocked(cn.status, cn.stock_reversed_at)) {
      return NextResponse.json(
        { ok: false, error: "Credit note is locked after issuance." },
        { status: 409 }
      );
    }

    // ✅ Allow only safe draft edits (keep minimal on purpose)
    const patch: any = {};
    if (typeof body.reason === "string") patch.reason = body.reason;

    // If you allow draft date edits:
    if (typeof body.credit_note_date === "string") patch.credit_note_date = body.credit_note_date;

    // If you allow draft customer swap (optional):
    if (body.customer_id != null) patch.customer_id = Number(body.customer_id);

    const { error: upErr } = await supabase.from("credit_notes").update(patch).eq("id", id);
    if (upErr) return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
  }
}

