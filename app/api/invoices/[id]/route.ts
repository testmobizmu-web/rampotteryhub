// app/api/invoices/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

export const dynamic = "force-dynamic";

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, service);
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ FINAL FIX
) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params; // ✅ FINAL FIX

    const numericId = Number(id);
    const useNumeric = Number.isFinite(numericId) && numericId > 0;

    const supabase = supaAdmin();

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

    // 2) Load items
    const { data: items, error: itemsErr } = await supabase
      .from("invoice_items")
      .select(
        `
        id,
        invoice_id,
        product_id,
        uom,
        box_qty,
        pcs_qty,
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
