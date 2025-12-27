// app/api/invoices/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const numericId = Number(id);
    const useNumeric = Number.isFinite(numericId) && numericId > 0;

    // 1) Load invoice
    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .select(
        `
        id,
        invoice_number,
        invoice_date,
        customer_id,
        purchase_order_no,
        sales_rep,
        sales_rep_phone,

        subtotal,
        vat_percent,
        vat_amount,
        total_amount,

        previous_balance,
        gross_total,

        amount_paid,
        balance_due,
        balance_remaining,

        discount_percent,
        discount_amount,

        status,

        customers (
          id,
          name,
          address,
          phone,
          brn,
          vat_no,
          customer_code
        )
      `
      )
      .eq(useNumeric ? "id" : "invoice_number", useNumeric ? numericId : id)
      .single();

    if (invErr || !invoice) {
      return NextResponse.json({ ok: false, error: "Invoice not found" }, { status: 404 });
    }

    // 2) Load items (join products so UI can show item_code + name)
    const { data: items, error: itemsErr } = await supabase
      .from("invoice_items")
      .select(
        `
        id,
        invoice_id,
        product_id,
        box_qty,
        units_per_box,
        total_qty,
        unit_price_excl_vat,
        unit_vat,
        unit_price_incl_vat,
        line_total,
        products (
          id,
          item_code,
          sku,
          name
        )
      `
      )
      .eq("invoice_id", invoice.id)
      .order("id", { ascending: true });

    if (itemsErr) {
      return NextResponse.json({ ok: false, error: itemsErr.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      invoice,
      items: items || [],
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
