// app/api/credit-notes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const numericId = Number(id);
    const useNumeric = !Number.isNaN(numericId);

    const { data: creditNote, error: cnErr } = await supabase
      .from("credit_notes")
      .select(
        `
        id,
        credit_note_number,
        credit_note_date,
        customer_id,
        invoice_id,
        reason,
        subtotal,
        vat_amount,
        total_amount,
        status,
        customers ( name, address, phone, brn, vat_no, customer_code )
      `
      )
      .eq(useNumeric ? "id" : "credit_note_number", useNumeric ? numericId : id)
      .single();

    if (cnErr || !creditNote) {
      return NextResponse.json({ ok: false, error: "Credit note not found" }, { status: 404 });
    }

    const { data: items, error: itErr } = await supabase
      .from("credit_note_items")
      .select("*, products ( sku, name )")
      .eq("credit_note_id", creditNote.id)
      .order("id", { ascending: true });

    if (itErr) {
      return NextResponse.json({ ok: false, error: itErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, creditNote, items: items || [] });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
