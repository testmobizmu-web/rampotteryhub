// app/api/invoices/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

type RouteContext = {
  params: { id: string };
};

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const id = Number(context.params.id);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid invoice id" },
        { status: 400 }
      );
    }

    // --- load invoice + customer ---
    const { data: invoice, error: invError } = await supabase
      .from("invoices")
      .select(
        `
        id,
        invoice_number,
        invoice_date,
        customer_id,
        purchase_order_no,
        sales_rep,
        subtotal,
        discount_percent,
        discount_amount,
        vat_amount,
        total_amount,
        previous_balance,
        amount_paid,
        gross_total,
        balance_remaining,
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
      .eq("id", id)
      .single();

    if (invError || !invoice) {
      console.error("Invoice load error:", invError);
      return NextResponse.json(
        { error: invError?.message || "Invoice not found" },
        { status: 404 }
      );
    }

    // --- load items + product info ---
    const { data: items, error: itemsError } = await supabase
      .from("invoice_items")
      .select(
        `
        id,
        product_id,
        box_qty,
        units_per_box,
        total_qty,
        unit_price_excl_vat,
        unit_vat,
        products (
          id,
          item_code,
          name
        )
      `
      )
      .eq("invoice_id", id)
      .order("id", { ascending: true });

    if (itemsError) {
      console.error("Invoice items load error:", itemsError);
      return NextResponse.json(
        { error: itemsError.message || "Failed to load invoice items" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      invoice,
      items: items || [],
    });
  } catch (err: any) {
    console.error("Unexpected invoice load error:", err);
    return NextResponse.json(
      { error: err?.message || "Unexpected error loading invoice" },
      { status: 500 }
    );
  }
}
