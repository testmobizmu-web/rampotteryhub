// app/api/credit-notes/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function nextCN(lastId: number | null) {
  const next = (lastId ?? 0) + 1;
  return "CN-" + String(next).padStart(4, "0");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      customerId,
      creditNoteDate,
      invoiceId,
      reason,
      subtotal,
      vatAmount,
      totalAmount,
      items,
    } = body;

    if (!customerId || !creditNoteDate || !Array.isArray(items) || !items.length) {
      return NextResponse.json(
        { ok: false, error: "Missing required credit note data." },
        { status: 400 }
      );
    }

    const { data: last, error: lastErr } = await supabase
      .from("credit_notes")
      .select("id")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastErr) throw lastErr;

    const creditNoteNumber = nextCN(last?.id ?? null);

    const { data: cn, error: cnErr } = await supabase
      .from("credit_notes")
      .insert({
        credit_note_number: creditNoteNumber,
        credit_note_date: creditNoteDate,
        customer_id: customerId,
        invoice_id: invoiceId || null,
        reason: reason || null,
        subtotal,
        vat_amount: vatAmount,
        total_amount: totalAmount,
        status: "ISSUED",
      })
      .select("id")
      .single();

    if (cnErr || !cn) throw cnErr;

    const creditNoteId = cn.id;

    const itemsToInsert = items.map((it: any) => ({
      credit_note_id: creditNoteId,
      product_id: it.product_id ?? null,
      total_qty: it.total_qty,
      unit_price_excl_vat: it.unit_price_excl_vat,
      unit_vat: it.unit_vat,
      unit_price_incl_vat: it.unit_price_incl_vat,
      line_total: it.line_total,
    }));

    const { error: itErr } = await supabase
      .from("credit_note_items")
      .insert(itemsToInsert);

    if (itErr) throw itErr;

    return NextResponse.json({ ok: true, creditNoteId });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to create credit note" },
      { status: 500 }
    );
  }
}
