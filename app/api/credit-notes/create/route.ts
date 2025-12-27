// app/api/credit-notes/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function nextCN(lastId: number | null) {
  const next = (lastId ?? 0) + 1;
  return "CN-" + String(next).padStart(4, "0");
}

function n2(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const customerId = body.customerId ?? body.customer_id;
    const creditNoteDate = body.creditNoteDate ?? body.credit_note_date;
    const invoiceId = body.invoiceId ?? body.invoice_id ?? null;
    const reason = body.reason ?? null;

    const items = body.items;

    if (!customerId || !creditNoteDate || !Array.isArray(items) || !items.length) {
      return NextResponse.json(
        { ok: false, error: "Missing required credit note data." },
        { status: 400 }
      );
    }

    // Normalize items + compute totals (authoritative)
    const normalizedItems = items
      .map((it: any) => {
        const product_id = it.product_id != null ? Number(it.product_id) : null;
        const total_qty = n2(it.total_qty);
        const unit_price_excl_vat = n2(it.unit_price_excl_vat);
        const unit_vat = n2(it.unit_vat);
        const unit_price_incl_vat = round2(unit_price_excl_vat + unit_vat);
        const line_total = round2(unit_price_incl_vat * total_qty);

        if (!total_qty || total_qty <= 0) return null;

        return {
          product_id,
          total_qty,
          unit_price_excl_vat,
          unit_vat,
          unit_price_incl_vat,
          line_total,
        };
      })
      .filter(Boolean) as any[];

    if (!normalizedItems.length) {
      return NextResponse.json(
        { ok: false, error: "Credit note items invalid (qty must be > 0)." },
        { status: 400 }
      );
    }

    const subtotal = round2(
      normalizedItems.reduce((s, r) => s + r.total_qty * r.unit_price_excl_vat, 0)
    );
    const vatAmount = round2(
      normalizedItems.reduce((s, r) => s + r.total_qty * r.unit_vat, 0)
    );
    const totalAmount = round2(subtotal + vatAmount);

    // 1) Generate CN number + insert CN with retry to avoid duplicates
    let cnRow: any = null;

    for (let attempt = 0; attempt < 5; attempt++) {
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
        .select("id, credit_note_number")
        .single();

      if (!cnErr && cn) {
        cnRow = cn;
        break;
      }

      // If duplicate number, retry
      const msg = String((cnErr as any)?.message || "");
      if (msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("unique")) {
        continue;
      }
      throw cnErr;
    }

    if (!cnRow) {
      return NextResponse.json(
        { ok: false, error: "Failed to generate credit note number. Try again." },
        { status: 500 }
      );
    }

    const creditNoteId = cnRow.id;

    // 2) Insert credit note items
    const itemsToInsert = normalizedItems.map((it) => ({
      credit_note_id: creditNoteId,
      product_id: it.product_id,
      total_qty: it.total_qty,
      unit_price_excl_vat: it.unit_price_excl_vat,
      unit_vat: it.unit_vat,
      unit_price_incl_vat: it.unit_price_incl_vat,
      line_total: it.line_total,
    }));

    const { error: itErr } = await supabase
      .from("credit_note_items")
      .insert(itemsToInsert);

    if (itErr) {
      await supabase.from("credit_notes").delete().eq("id", creditNoteId);
      throw itErr;
    }

    // 3) AUTO STOCK MOVEMENTS (IN) — credit note returns stock
    const movementsToInsert = normalizedItems
      .map((it) => {
        const pid = Number(it.product_id);
        const qty = Math.abs(n2(it.total_qty));
        if (!pid || qty <= 0) return null;

        return {
          product_id: pid,
          movement_type: "IN",
          quantity: qty,
          reference: cnRow.credit_note_number,
          source_table: "credit_notes",
          source_id: creditNoteId,
          notes: reason || "Credit note issued",
        };
      })
      .filter(Boolean) as any[];

    if (movementsToInsert.length) {
      const { error: mvErr } = await supabase.from("stock_movements").insert(movementsToInsert);
      if (mvErr) {
        // rollback safety
        await supabase.from("credit_note_items").delete().eq("credit_note_id", creditNoteId);
        await supabase.from("credit_notes").delete().eq("id", creditNoteId);
        throw mvErr;
      }
    }

    return NextResponse.json({ ok: true, creditNoteId, creditNoteNumber: cnRow.credit_note_number });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to create credit note" },
      { status: 500 }
    );
  }
}
