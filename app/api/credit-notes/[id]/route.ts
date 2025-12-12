import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // 1) Load credit note
    const { data: note, error: noteErr } = await supabase
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
        customers ( name, address, phone, brn, vat_no, customer_code )
      `
      )
      .eq("id", id)
      .single();

    if (noteErr) {
      return NextResponse.json(
        { error: noteErr.message || "Credit note not found" },
        { status: 404 }
      );
    }

    // 2) Load items (if you have items table)
    const { data: items, error: itemsErr } = await supabase
      .from("rp_credit_note_items")
      .select("*")
      .eq("credit_note_id", id)
      .order("id", { ascending: true });

    if (itemsErr) {
      return NextResponse.json(
        { error: itemsErr.message || "Failed to load items" },
        { status: 500 }
      );
    }

    return NextResponse.json({ note, items: items || [] });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

