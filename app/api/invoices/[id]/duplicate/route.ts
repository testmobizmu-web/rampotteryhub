import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function nextInvoiceNumber(lastId: number | null): string {
  const next = (lastId ?? 0) + 1;
  return "RP-" + String(next).padStart(4, "0");
}

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ REQUIRED for this route
) {
  try {
    const { id: rawId } = await context.params; // ✅ REQUIRED for this route

    const numericId = Number(rawId);
    const useNumeric = Number.isFinite(numericId);

    // 1) Load original invoice
    const { data: invoice, error: invError } = await supabase
      .from("invoices")
      .select(
        `
        id,
        customer_id,
        invoice_number,
        invoice_date,
        subtotal,
        vat_amount,
        total_amount,
        vat_percent,
        discount_percent,
        discount_amount
      `
      )
      .eq(useNumeric ? "id" : "invoice_number", useNumeric ? numericId : rawId)
      .single();

    if (invError || !invoice) {
      return NextResponse.json(
        { ok: false, error: `Original invoice not found for "${rawId}"` },
        { status: 404 }
      );
    }

    // 2) Load items (include UOM + pcs_qty)
    const { data: items, error: itemsError } = await supabase
      .from("invoice_items")
      .select(
        `
        product_id,
        uom,
        box_qty,
        pcs_qty,
        units_per_box,
        total_qty,
        unit_price_excl_vat,
        unit_vat,
        unit_price_incl_vat,
        line_total
      `
      )
      .eq("invoice_id", invoice.id);

    if (itemsError) throw itemsError;

    // 3) Generate new invoice number
    const { data: lastInv } = await supabase
      .from("invoices")
      .select("id")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    const invoiceNumber = nextInvoiceNumber(lastInv?.id ?? null);

    // 4) Insert new invoice
    const { data: newInv, error: newInvError } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        customer_id: invoice.customer_id,
        invoice_date: new Date().toISOString().slice(0, 10),
        subtotal: invoice.subtotal,
        vat_amount: invoice.vat_amount,
        total_amount: invoice.total_amount,
        previous_balance: 0,
        amount_paid: 0,
        balance_remaining: invoice.total_amount,
        status: "UNPAID",
        vat_percent: invoice.vat_percent,
        discount_percent: invoice.discount_percent,
        discount_amount: invoice.discount_amount,
      })
      .select("id")
      .single();

    if (newInvError || !newInv) throw newInvError;

    // 5) Clone items (NO stock movement)
    if (items?.length) {
      const clonedItems = items.map((it) => ({
        ...it,
        invoice_id: newInv.id,
      }));

      const { error: insErr } = await supabase
        .from("invoice_items")
        .insert(clonedItems);

      if (insErr) throw insErr;
    }

    return NextResponse.json({ ok: true, invoiceId: newInv.id });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
