import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function nextInvoiceNumber(lastId: number | null): string {
  const next = (lastId ?? 0) + 1;
  return "RP-" + String(next).padStart(4, "0");
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
      discountAmount,  // will be 0

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

    const { data: lastInv, error: lastErr } = await supabase
      .from("invoices")
      .select("id")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastErr) throw lastErr;

    const invoiceNumber = nextInvoiceNumber(lastInv?.id ?? null);

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

    if (itemsError) throw itemsError;

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

