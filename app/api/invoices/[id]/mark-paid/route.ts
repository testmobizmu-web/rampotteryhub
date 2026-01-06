// app/api/invoices/[id]/mark-paid/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function PATCH(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const numericId = Number(id);
    const useNumeric = Number.isFinite(numericId);

    // Load invoice first (include status + amounts)
    const { data: inv, error: invErr } = await supabase
      .from("invoices")
      .select("id, status, total_amount, gross_total, amount_paid, balance_remaining")
      .eq(useNumeric ? "id" : "invoice_number", useNumeric ? numericId : id)
      .single();

    if (invErr || !inv) {
      return NextResponse.json({ ok: false, error: "Invoice not found" }, { status: 404 });
    }

    const total = Number(inv.total_amount || 0);
    const gross = Number(inv.gross_total || total);


    // ✅ apply stock OUT movements (idempotent)
          const { error: stockErr } = await supabase.rpc("apply_invoice_stock_out", {
          p_invoice_id: inv.id,
      });

          if (stockErr) {
          return NextResponse.json({ ok: false, error: stockErr.message }, { status: 500 });
        }


    // ✅ IDEMPOTENT: if already PAID with correct numbers, do nothing (prevents duplicate stock trigger)
    const alreadyPaid =
      String(inv.status || "").toUpperCase() === "PAID" &&
      Number(inv.amount_paid || 0) >= gross &&
      Number(inv.balance_remaining || 0) <= 0;

    if (alreadyPaid) {
      return NextResponse.json({ ok: true, status: "PAID", skipped: true });
    }

    const { error: upErr } = await supabase
      .from("invoices")
      .update({
        status: "PAID",
        amount_paid: gross,
        balance_remaining: 0,
      })
      .eq("id", inv.id);

    if (upErr) {
      return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, status: "PAID" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
