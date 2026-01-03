// app/api/invoices/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

export const dynamic = "force-dynamic";

type RawInvoiceItem = {
  product_id?: number | string;
  productId?: number | string;

  uom?: "BOX" | "PCS" | string;

  box_qty?: number | string;
  boxQty?: number | string;

  pcs_qty?: number | string;
  pcsQty?: number | string;

  units_per_box?: number | string;
  unitsPerBox?: number | string;

  unit_price_excl_vat?: number | string;
  unitPriceExclVat?: number | string;

  vat_rate?: number | string;
  vatRate?: number | string;

  line_total?: number | string;

  description?: string | null;
};

type NormalizedItem = {
  product_id: number;
  description: string | null;

  uom: "BOX" | "PCS";
  box_qty: number | null;
  pcs_qty: number | null;
  units_per_box: number; // always >= 1
  total_qty: number; // integer

  unit_price_excl_vat: number;
  vat_rate: number; // %
  unit_vat: number;
  unit_price_incl_vat: number;
  line_total: number;
};

function n2(v: any): number {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !service) {
    throw new Error(
      "Missing Supabase env. Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return createClient(url, service);
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body: any = await req.json().catch(() => ({}));

    const customerId = body.customerId ?? body.customer_id;
    const invoiceDate = body.invoiceDate ?? body.invoice_date;
    const purchaseOrderNo = body.purchaseOrderNo ?? body.purchase_order_no ?? null;

    const salesRep = body.salesRep ?? body.sales_rep ?? null;
    const salesRepPhone = body.salesRepPhone ?? body.sales_rep_phone ?? null;

    const previousBalance = n2(body.previousBalance ?? body.previous_balance ?? 0);
    const amountPaid = n2(body.amountPaid ?? body.amount_paid ?? 0);

    const items: RawInvoiceItem[] = (Array.isArray(body.items) ? body.items : []) as RawInvoiceItem[];
    if (!customerId || !invoiceDate || items.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Missing required invoice data." },
        { status: 400 }
      );
    }

    const supabase = supaAdmin();

    // Normalize items:
    // - uom: BOX or PCS
    // - if PCS: store pcs_qty, box_qty = null, units_per_box = 1, total_qty = pcs_qty
    // - if BOX: store box_qty, pcs_qty = null, units_per_box required, total_qty = box_qty * units_per_box
    const normalizedItems: NormalizedItem[] = items.map((it, idx) => {
      const pid = Number(it.product_id ?? it.productId);
      if (!Number.isFinite(pid)) throw new Error(`Item #${idx + 1}: Missing product_id`);

      const uom: "BOX" | "PCS" = (it.uom ?? "BOX") === "PCS" ? "PCS" : "BOX";

      const boxQtyRaw = n2(it.box_qty ?? it.boxQty ?? 0);
      const pcsQtyRaw = n2(it.pcs_qty ?? it.pcsQty ?? 0);

      // qty is integer count of selected UOM
      const qty =
        uom === "PCS" ? Math.trunc(pcsQtyRaw || boxQtyRaw) : Math.trunc(boxQtyRaw);

      const upb =
        uom === "PCS"
          ? 1
          : Math.max(1, Math.trunc(n2(it.units_per_box ?? it.unitsPerBox ?? 1)));

      const totalQty = uom === "PCS" ? qty : qty * upb;

      const unitEx = n2(it.unit_price_excl_vat ?? it.unitPriceExclVat ?? 0);
      const vatPercent = clamp(n2(it.vat_rate ?? it.vatRate ?? 15), 0, 100);
      const unitVat = unitEx * (vatPercent / 100);
      const unitIncl = unitEx + unitVat;

      const lineTotal = n2(it.line_total ?? unitIncl * totalQty);

      return {
        product_id: pid,
        description: (it.description ?? null) as string | null,

        uom,
        box_qty: uom === "BOX" ? qty : null,
        pcs_qty: uom === "PCS" ? qty : null,
        units_per_box: upb,
        total_qty: totalQty,

        unit_price_excl_vat: unitEx,
        vat_rate: vatPercent,
        unit_vat: unitVat,
        unit_price_incl_vat: unitIncl,
        line_total: lineTotal,
      };
    });

    // Totals (NO generic type args; typed accumulator)
    const subtotal = normalizedItems.reduce(
      (sum: number, it: NormalizedItem) =>
        sum + n2(it.total_qty) * n2(it.unit_price_excl_vat),
      0
    );

    const vatAmount = normalizedItems.reduce(
      (sum: number, it: NormalizedItem) => sum + n2(it.total_qty) * n2(it.unit_vat),
      0
    );

    const totalAmount = subtotal + vatAmount;

    const grossTotal = totalAmount + previousBalance;
    const balanceRemaining = Math.max(0, grossTotal - amountPaid);

    // Create invoice
    const { data: newInv, error: invError } = await supabase
      .from("invoices")
      .insert({
        customer_id: customerId,
        invoice_date: invoiceDate,
        due_date: null,

        purchase_order_no: purchaseOrderNo,
        sales_rep: salesRep,
        sales_rep_phone: salesRepPhone,

        subtotal,
        vat_percent: null, // per-line vat is stored in items
        vat_amount: vatAmount,
        total_amount: totalAmount,

        total_excl_vat: subtotal,
        total_incl_vat: totalAmount,
        gross_total: grossTotal,

        previous_balance: previousBalance,
        amount_paid: amountPaid,
        balance_remaining: balanceRemaining,
        balance_due: balanceRemaining,

        discount_percent: 0,
        discount_amount: 0,

        status: "ISSUED",
      })
      .select("id, invoice_number")
      .single();

    if (invError || !newInv) throw invError;

    const invoiceId = newInv.id;

    // Insert items
    const itemsToInsert = normalizedItems.map((it) => ({
      invoice_id: invoiceId,
      ...it,
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(itemsToInsert);

    if (itemsError) {
      await supabase.from("invoices").delete().eq("id", invoiceId);
      throw itemsError;
    }

    // STOCK UPDATE:
    // - decrement products.current_stock by total_qty per item
    // - best effort insert stock_movements (if table exists)
    for (const it of normalizedItems) {
      const pid = it.product_id;
      const qty = Math.trunc(n2(it.total_qty));

      if (qty <= 0) continue;

      const { data: pRow, error: pErr } = await supabase
        .from("products")
        .select("id, current_stock")
        .eq("id", pid)
        .single();

      if (pErr || !pRow) {
        // rollback invoice to prevent inconsistent state
        await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);
        await supabase.from("invoices").delete().eq("id", invoiceId);
        throw new Error(`Stock update failed (product ${pid} not found)`);
      }

      const current = Math.trunc(n2(pRow.current_stock));
      const next = Math.max(0, current - qty);

      const { error: upErr } = await supabase
        .from("products")
        .update({ current_stock: next })
        .eq("id", pid);

      if (upErr) {
        await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);
        await supabase.from("invoices").delete().eq("id", invoiceId);
        throw new Error(`Stock update failed (product ${pid})`);
      }

      // optional movement log (ignore if table missing)
      try {
        await supabase.from("stock_movements").insert({
          product_id: pid,
          movement_date: invoiceDate,
          movement_type: "SALE",
          quantity_change: -qty,
          reference: `INV:${newInv.invoice_number}`,
          notes: it.uom === "PCS" ? `PCS sale` : `BOX sale`,
        });
      } catch {
        // ignore if table not present
      }
    }

    return NextResponse.json({
      ok: true,
      invoiceId,
      invoiceNumber: newInv.invoice_number,
    });
  } catch (err: any) {
    console.error("Create invoice error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to create invoice" },
      { status: 500 }
    );
  }
}
