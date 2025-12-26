import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { canRecordPayments, getUserFromHeader, recalcInvoicePaymentState } from "@/lib/payments";

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

function n2(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;

    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!canRecordPayments(user)) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));

    const amount = n2(body.amount);
    const method = String(body.method || "").trim();
    const reference = String(body.reference || "").trim() || null;
    const notes = String(body.notes || "").trim() || null;
    const payment_date = String(body.payment_date || "").trim() || null; // optional yyyy-mm-dd

    if (!amount || amount <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid amount" }, { status: 400 });
    }
    if (!method) {
      return NextResponse.json({ ok: false, error: "Payment method required" }, { status: 400 });
    }

    const supabase = supaAdmin();

    // insert payment
    const insertPayload: any = {
      invoice_id: id,
      amount,
      method,
      reference,
      notes,
    };
    if (payment_date) insertPayload.payment_date = payment_date;

    const { error: insErr } = await supabase.from("invoice_payments").insert(insertPayload);
    if (insErr) return NextResponse.json({ ok: false, error: insErr.message }, { status: 500 });

    // recalc invoice
    const state = await recalcInvoicePaymentState(id);

    return NextResponse.json({ ok: true, ...state });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Unexpected error" }, { status: 500 });
  }
}
