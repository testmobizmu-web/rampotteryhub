import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function nextInvoiceNumber(lastId: number | null): string {
  const next = (lastId ?? 0) + 1;
  return "RP-" + String(next).padStart(4, "0");
}

function n2(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Accept both old & new payload keys
    const customerId = body.customer_id ?? body.customerId;
    const invoiceDate = body.invoice_date ?? body.invoiceDate;
    const purchaseOrderNo = body.purchase_order_no ?? body.purchaseOrderNo ?? null;
    const salesRep = body.sales_rep ?? body.salesRep ?? null;
    const salesRepPhone = body.sales_rep_phone ?? body.salesRepPhone ?? null;

    const vatPercent = n2(body.vat_percent ?? body.vatPercent ?? 15);
    const previousBalance = n2(body.previous_balance ?? body.previousBalance ?? 0);
    const amountPaid = n2(body.amount_paid ?? body.amountPaid ?? 0);

    const items = body.items;

    if (!customerId || !invoiceDate || !Array.isArray(items) || !items.length) {
      return NextResponse.json(
        { ok: false, error: "Missing required invoice data" },
        { status: 400 }
      );
    }

    // Normalize & validate items
    const normalizedItems = items.map((it: any) => ({
      product_id: Number(it.product_id ?? it.productId),
      box_qty: n2(it.box_qty),
      units_per_box: n2(it.units_per_box),
      total_qty: n2(it.total_qty),
      unit_price_excl_vat: n2(it.unit_price_excl_vat),
      unit_vat: n2(it.unit_vat),
      unit_price_incl_vat: n2(it.unit_price_incl_vat),
      line_total: n2(it.line_total),
    }));

    // ---- Compute totals (authoritative)
    const subtotal = normalizedItems.reduce(
      (sum, r) => sum + r.total_qty * r.unit_price_excl_vat,
      0
    );

    const vatAmount = subtotal * (vatPercent / 100);
    const totalAmount = subtotal + vatAmount;
    const grossTotal = totalAmount + previousBalance;

    // prevent negative balance if someone enters overpayment
    const balanceRemaining = Math.max(0, grossTotal - amountPaid);

    // Generate invoice number
    const { data: lastInv, error: lastErr } = await supabase
      .from("invoices")
      .select("id")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastErr) throw lastErr;

    const invoiceNumber = nextInvoiceNumber(lastInv?.id ?? null);

    // Insert invoice
    const { data: newInv, error: invError } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        customer_id: customerId,
        invoice_date: invoiceDate,
        due_date: null,

        subtotal,
        vat_amount: vatAmount,
        total_amount: totalAmount,

        total_excl_vat: subtotal,
        total_incl_vat: totalAmount,
        gross_total: grossTotal,

        previous_balance: previousBalance,
        amount_paid: amountPaid,
        balance_remaining: balanceRemaining,
        balance_due: balanceRemaining,

        vat_percent: vatPercent,

        // discount logically removed (kept for schema compatibility)
        discount_percent: 0,
        discount_amount: 0,

        // ✅ FIX: must match invoices_status_check constraint
        // New invoices should be ISSUED (or DRAFT if you prefer)
        status: "ISSUED",

        sales_rep: salesRep,
        sales_rep_phone: salesRepPhone,
        purchase_order_no: purchaseOrderNo,
      })
      .select("id")
      .single();

    if (invError || !newInv) throw invError;

    const invoiceId = newInv.id;

    // Insert invoice items
    const itemsToInsert = normalizedItems.map((it) => ({
      invoice_id: invoiceId,
      product_id: it.product_id,
      box_qty: it.box_qty,
      units_per_box: it.units_per_box,
      total_qty: it.total_qty,
      unit_price_excl_vat: it.unit_price_excl_vat,
      unit_vat: it.unit_vat,
      unit_price_incl_vat: it.unit_price_incl_vat,
      line_total: it.line_total,
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    return NextResponse.json({ ok: true, invoiceId });
  } catch (err: any) {
    console.error("Create invoice error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to create invoice" },
      { status: 500 }
    );
  }
}
