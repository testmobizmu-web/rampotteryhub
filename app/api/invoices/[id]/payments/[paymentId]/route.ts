import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { canDeletePayments, getUserFromHeader, recalcInvoicePaymentState } from "@/lib/payments";

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

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ paymentId: string }> }) {
  try {
    const { paymentId } = await ctx.params;

    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!canDeletePayments(user)) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const supabase = supaAdmin();

    // find invoice_id first
    const { data: pay, error: payErr } = await supabase
      .from("invoice_payments")
      .select("id, invoice_id")
      .eq("id", paymentId)
      .single();

    if (payErr) return NextResponse.json({ ok: false, error: payErr.message }, { status: 500 });
    if (!pay?.invoice_id) return NextResponse.json({ ok: false, error: "Payment not found" }, { status: 404 });

    // delete
    const { error: delErr } = await supabase.from("invoice_payments").delete().eq("id", paymentId);
    if (delErr) return NextResponse.json({ ok: false, error: delErr.message }, { status: 500 });

    // recalc invoice
    const state = await recalcInvoicePaymentState(pay.invoice_id);

    return NextResponse.json({ ok: true, ...state });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Unexpected error" }, { status: 500 });
  }
}
