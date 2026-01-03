// app/api/invoices/[id]/mark-paid/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function PATCH(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ REQUIRED for nested route
) {
  try {
    const { id } = await context.params; // ✅ REQUIRED

    const numericId = Number(id);
    const useNumeric = Number.isFinite(numericId);

    // Load invoice to compute paid values safely
    const { data: inv, error: invErr } = await supabase
      .from("invoices")
      .select("id, total_amount, gross_total")
      .eq(useNumeric ? "id" : "invoice_number", useNumeric ? numericId : id)
      .single();

    if (invErr || !inv) {
      return NextResponse.json({ ok: false, error: "Invoice not found" }, { status: 404 });
    }

    const total = Number(inv.total_amount || 0);
    const gross = Number(inv.gross_total || total);

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

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
