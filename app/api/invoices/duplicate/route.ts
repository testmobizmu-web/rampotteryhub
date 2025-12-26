import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function nextInvoiceNumber(lastId: number | null): string {
  const next = (lastId ?? 0) + 1;
  return "RP-" + String(next).padStart(4, "0");
}

function toNumber(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const invoiceId = Number(body.invoiceId);

    if (!invoiceId || Number.isNaN(invoiceId)) {
      return NextResponse.json(
        { ok: false, error: "Missing or invalid invoiceId in request body." },
        { status: 400 }
      );
    }

    // 1) Load original invoice
    const { data: invoice, error: invError } = await supabase
      .from("invoices")
      .select(
        `
        id, customer_id, invoice_number, invoice_date,
        subtotal, vat_amount, total_amount,
        vat_percent, discount_percent, discount_amount
      `
      )
      .eq("id", invoiceId)
      .single();

    if (invError || !invoice) {
      return NextResponse.json(
        { ok: false, error: `Original invoice not found for id ${invoiceId}.` },
        { status: 404 }
      );
    }

    // 2) Load original items
    const { data: items, error: itemsError } = await supabase
      .from("invoice_items")
      .select(
        "product_id, box_qty, units_per_box, total_qty, unit_price_excl_vat, unit_vat, unit_price_incl_vat, line_total"
      )
      .eq("invoice_id", invoice.id);

    if (itemsError) throw itemsError;

    // 3) Find last invoice id to generate new invoice number
    const { data: lastInv, error: lastErr } = await supabase
      .from("invoices")
      .select("id")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastErr) throw lastErr;

    const invoiceNumber = nextInvoiceNumber(lastInv?.id ?? null);

    const previous_balance = 0;
    const amount_paid = 0;
    const balance_remaining = invoice.total_amount;

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
        previous_balance,
        amount_paid,
        balance_remaining,
        status: "UNPAID",
        vat_percent: invoice.vat_percent,
        discount_percent: invoice.discount_percent,
        discount_amount: invoice.discount_amount,
      })
      .select("id, invoice_number")
      .single();

    if (newInvError || !newInv) throw newInvError;

    const newId = newInv.id;

    // 5) Clone items to new invoice
    if (items && items.length) {
      const clonedItems = items.map((it: any) => ({
        ...it,
        invoice_id: newId,
      }));
      const { error: insItemsErr } = await supabase
        .from("invoice_items")
        .insert(clonedItems);
      if (insItemsErr) {
        await supabase.from("invoices").delete().eq("id", newId);
        throw insItemsErr;
      }

      // 6) AUTO STOCK MOVEMENT (OUT) for duplicated invoice
      const movementsToInsert = items
        .map((it: any) => {
          const pid = Number(it.product_id);
          const qty = Math.abs(toNumber(it.total_qty));
          if (!pid || qty <= 0) return null;

          return {
            product_id: pid,
            movement_type: "OUT",
            quantity: qty,
            reference: newInv.invoice_number,
            source_table: "invoices",
            source_id: newId,
            notes: "Duplicated invoice",
          };
        })
        .filter(Boolean) as any[];

      if (movementsToInsert.length) {
        const { error: mvErr } = await supabase
          .from("stock_movements")
          .insert(movementsToInsert);

        if (mvErr) {
          // rollback everything for safety
          await supabase.from("invoice_items").delete().eq("invoice_id", newId);
          await supabase.from("invoices").delete().eq("id", newId);
          throw mvErr;
        }
      }
    }

    return NextResponse.json({ ok: true, invoiceId: newId });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
