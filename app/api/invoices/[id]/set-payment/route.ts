// app/api/invoices/[id]/set-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const numericId = Number(id);
    const useNumeric = Number.isFinite(numericId);

    const body = await req.json().catch(() => ({}));
    const amountPaidInput = Number(body?.amountPaid ?? 0);

    if (Number.isNaN(amountPaidInput) || amountPaidInput < 0) {
      return NextResponse.json({ ok: false, error: "Invalid amountPaid" }, { status: 400 });
    }

    // 1) Load invoice totals + current status
    const { data: inv, error: invErr } = await supabase
      .from("invoices")
      .select("id, status, total_amount, gross_total, amount_paid, balance_remaining")
      .eq(useNumeric ? "id" : "invoice_number", useNumeric ? numericId : id)
      .single();

    if (invErr || !inv) {
      return NextResponse.json({ ok: false, error: "Invoice not found" }, { status: 404 });
    }

    const total = Number(inv.total_amount || 0);
    const gross = inv.gross_total != null ? Number(inv.gross_total) : total;

    // 2) Clamp paid
    const paid = Math.max(0, Math.min(gross, amountPaidInput));
    const balance = +(gross - paid).toFixed(2);

    let status: "DRAFT" | "ISSUED" | "PARTIALLY_PAID" | "PAID" | "VOID" = "ISSUED";

    if (paid <= 0) status = "ISSUED";
    else if (paid >= gross) status = "PAID";
    else status = "PARTIALLY_PAID";



    // ✅ IDEMPOTENT: if nothing changes, return without updating (prevents re-trigger)
    const currentStatus = String(inv.status || "").toUpperCase();
    const noChange =
      currentStatus === status &&
      Number(inv.amount_paid || 0) === paid &&
      Number(inv.balance_remaining || 0) === balance;

    if (noChange) {
      return NextResponse.json({
        ok: true,
        status,
        amount_paid: paid,
        balance_remaining: balance,
        gross_total: gross,
        skipped: true,
      });
    }

    // 3) Update invoice
    const { error: upErr } = await supabase
      .from("invoices")
      .update({
        status,
        amount_paid: paid,
        balance_remaining: balance,
      })
      .eq("id", inv.id);

    if (upErr) {
      return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });
    }


    if (status === "PAID") {
    const { error: stockErr } = await supabase.rpc("apply_invoice_stock_out", {
    p_invoice_id: inv.id,
  });
    if (stockErr) {
    return NextResponse.json({ ok: false, error: stockErr.message }, { status: 500 });
  }
}


    return NextResponse.json({
      ok: true,
      status,
      amount_paid: paid,
      balance_remaining: balance,
      gross_total: gross,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
