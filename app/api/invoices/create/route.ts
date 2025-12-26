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
    const body = await req.json();

    const {
      customerId,
      invoiceDate,
      purchaseOrderNo,
      salesRep,

      vatPercent,
      discountPercent, // will be 0
      discountAmount, // will be 0

      previousBalance,
      amountPaid,
      subtotal,
      vatAmount,
      totalAmount,
      balanceRemaining,
      grossTotal,

      items,
    } = body;

    if (!customerId || !invoiceDate || !Array.isArray(items) || !items.length) {
      return NextResponse.json(
        { ok: false, error: "Missing required invoice data." },
        { status: 400 }
      );
    }

    // 1) Get last invoice id for invoice number
    const { data: lastInv, error: lastErr } = await supabase
      .from("invoices")
      .select("id")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastErr) throw lastErr;

    const invoiceNumber = nextInvoiceNumber(lastInv?.id ?? null);

    // 2) Insert invoice
    const { data: newInv, error: invError } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        customer_id: customerId,
        invoice_date: invoiceDate,
        purchase_order_no: purchaseOrderNo || null,
        sales_rep: salesRep || null,

        subtotal,
        vat_amount: vatAmount,
        total_amount: totalAmount,
        previous_balance: previousBalance,
        amount_paid: amountPaid,
        gross_total: grossTotal ?? totalAmount,
        balance_remaining: balanceRemaining,
        status: "UNPAID",

        vat_percent: vatPercent,
        discount_percent: discountPercent ?? 0,
        discount_amount: discountAmount ?? 0,
      })
      .select("id, invoice_number")
      .single();

    if (invError || !newInv) throw invError;

    const invoiceId = newInv.id;

    // 3) Insert invoice items
    const itemsToInsert = items.map((it: any) => ({
      invoice_id: invoiceId,
      product_id: it.product_id,
      box_qty: it.box_qty,
      units_per_box: it.units_per_box,
      total_qty: it.total_qty,
      unit_price_excl_vat: it.unit_price_excl_vat,
      unit_vat: it.unit_vat,
      unit_price_incl_vat: it.unit_price_incl_vat ?? null,
      line_total: it.line_total ?? null,
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(itemsToInsert);

    if (itemsError) {
      // rollback invoice to avoid orphan invoice
      await supabase.from("invoices").delete().eq("id", invoiceId);
      throw itemsError;
    }

    // 4) AUTO STOCK MOVEMENT (OUT) — uses your DB trigger to apply stock
    // movement_type allowed: IN / OUT / ADJUSTMENT ; quantity must be > 0
    const movementsToInsert = items
      .map((it: any) => {
        const pid = Number(it.product_id);
        const qty = Math.abs(toNumber(it.total_qty));
        if (!pid || qty <= 0) return null;

        return {
          product_id: pid,
          movement_type: "OUT",
          quantity: qty,
          reference: newInv.invoice_number, // nice reference for audit trail
          source_table: "invoices",
          source_id: invoiceId,
          notes: null,
        };
      })
      .filter(Boolean) as any[];

    if (movementsToInsert.length) {
      const { error: mvErr } = await supabase
        .from("stock_movements")
        .insert(movementsToInsert);

      if (mvErr) {
        // rollback: delete inserted invoice + items; movements are tied to invoice id anyway
        await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);
        await supabase.from("invoices").delete().eq("id", invoiceId);
        throw mvErr;
      }
    }

    return NextResponse.json({
      ok: true,
      invoiceId,
      invoiceNumber: newInv.invoice_number,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to create invoice" },
      { status: 500 }
    );
  }
}
