import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !(service || anon)) {
    throw new Error(
      "Missing Supabase env. Need NEXT_PUBLIC_SUPABASE_URL + (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY)"
    );
  }
  return createClient(url, service || anon!);
}

function isAdmin(user: any) {
  return String(user?.role || "").toLowerCase() === "admin";
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> } // ✅ REQUIRED for nested route
) {
  try {
    const { id } = await ctx.params; // ✅ REQUIRED

    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!isAdmin(user)) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const invoiceId = Number(id);
    if (!Number.isFinite(invoiceId) || invoiceId <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid invoice id" }, { status: 400 });
    }

    const supabase = supaAdmin();

    // Load current status
    const { data: inv, error: invErr } = await supabase
      .from("invoices")
      .select("id,status")
      .eq("id", invoiceId)
      .single();

    if (invErr || !inv) {
      return NextResponse.json({ ok: false, error: "Invoice not found" }, { status: 404 });
    }

    const current = String(inv.status || "").toUpperCase();
    if (current === "VOID") return NextResponse.json({ ok: true });

    // Set VOID (DB triggers will reverse stock if needed + lock record)
    const { error: upErr } = await supabase
      .from("invoices")
      .update({ status: "VOID" })
      .eq("id", invoiceId);

    if (upErr) {
      return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
