// app/api/credit-notes/[id]/route.ts
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
        { error: "Invalid credit note id" },
        { status: 400 }
      );
    }

    // Main credit note (similar fields as invoice)
    const { data: note, error: noteError } = await supabase
      .from("rp_credit_notes")
      .select(
        `
        id,
        note_number,
        note_date,
        customer_id,
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

    if (noteError || !note) {
      return NextResponse.json(
        { error: noteError?.message || "Credit note not found" },
        { status: 404 }
      );
    }

    // Items
    const { data: items, error: itemsError } = await supabase
      .from("rp_credit_note_items")
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
      .eq("credit_note_id", id)
      .order("id", { ascending: true });

    if (itemsError) {
      return NextResponse.json(
        { error: itemsError.message || "Failed to load credit note items" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      note,
      items: items || [],
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message || "Unexpected error loading credit note" },
      { status: 500 }
    );
  }
}
