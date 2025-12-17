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
    const useNumeric = !Number.isNaN(numericId);

    const body = await req.json().catch(() => ({}));
    const amountPaidInput = Number(body?.amountPaid ?? 0);

    if (Number.isNaN(amountPaidInput) || amountPaidInput < 0) {
      return NextResponse.json(
        { ok: false, error: "Invalid amountPaid" },
        { status: 400 }
      );
    }

    // Load invoice totals
    const { data: inv, error: invErr } = await supabase
      .from("invoices")
      .select("id, total_amount, gross_total, previous_balance")
      .eq(useNumeric ? "id" : "invoice_number", useNumeric ? numericId : id)
      .single();

    if (invErr || !inv) {
      return NextResponse.json(
        { ok: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    const total = Number(inv.total_amount || 0);
    const gross = Number(inv.gross_total || total);

    // clamp paid between 0 and gross
    const paid = Math.max(0, Math.min(gross, amountPaidInput));
    const balance = +(gross - paid).toFixed(2);

    let status: "UNPAID" | "PARTIAL" | "PAID" = "UNPAID";
    if (paid <= 0) status = "UNPAID";
    else if (paid >= gross) status = "PAID";
    else status = "PARTIAL";

    const { error: upErr } = await supabase
      .from("invoices")
      .update({
        status,
        amount_paid: paid,
        balance_remaining: balance,
      })
      .eq("id", inv.id);

    if (upErr) {
      return NextResponse.json(
        { ok: false, error: upErr.message },
        { status: 500 }
      );
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
