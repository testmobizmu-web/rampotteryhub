// app/api/invoices/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      customerId,
      invoiceDate,
      purchaseOrderNo,
      salesRep,
      subtotal,
      discountPercent,
      discountAmount,
      vatAmount,
      totalAmount,
      previousBalance,
      amountPaid,
      grossTotal,
      balanceRemaining,
      items,
    } = body;

    // --- basic validation ---
    if (!customerId || !invoiceDate) {
      return NextResponse.json(
        { error: "customerId and invoiceDate are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "At least one invoice item is required" },
        { status: 400 }
      );
    }

    // --- generate next invoice number: RP-0001, RP-0002, ... ---
    const { data: lastList, error: lastErr } = await supabase
      .from("invoices")
      .select("invoice_number")
      .order("id", { ascending: false })
      .limit(1);

    if (lastErr) {
      console.error("Error loading last invoice:", lastErr);
    }

    let nextNumber = 1;
    if (lastList && lastList.length && lastList[0].invoice_number) {
      const match = String(lastList[0].invoice_number).match(/(\d+)$/);
      if (match) {
        nextNumber = Number(match[1]) + 1;
      }
    }
    const invoiceNumber = `RP-${String(nextNumber).padStart(4, "0")}`;

    const status = balanceRemaining <= 0 ? "PAID" : "UNPAID";

    // --- insert into invoices table ---
    const { data: createdInvoice, error: invError } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        customer_id: customerId,

        // OPTIONAL METADATA – make sure these columns exist in your table
        purchase_order_no: purchaseOrderNo || null,
        sales_rep: salesRep || null,

        subtotal,
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        vat_amount: vatAmount,
        total_amount: totalAmount,
        previous_balance: previousBalance,
        amount_paid: amountPaid,
        gross_total: grossTotal,
        balance_remaining: balanceRemaining,
        status,
      })
      .select("id, invoice_number")
      .single();

    if (invError || !createdInvoice) {
      console.error("Invoice insert error:", invError);
      return NextResponse.json(
        { error: invError?.message || "Failed to create invoice" },
        { status: 500 }
      );
    }

    const invoiceId = createdInvoice.id;

    // --- format invoice_items insert ---
    const itemsToInsert = items.map((item: any) => ({
      invoice_id: invoiceId,
      product_id: item.product_id ?? null,
      box_qty: item.box_qty ?? 0,
      units_per_box: item.units_per_box ?? 0,
      total_qty: item.total_qty ?? 0,
      unit_price_excl_vat: item.unit_price_excl_vat ?? 0,
      unit_vat: item.unit_vat ?? 0,
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("Invoice items insert error:", itemsError);
      return NextResponse.json(
        {
          error:
            itemsError.message ||
            "Invoice created but items failed. Please contact support.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invoiceId,
      invoiceNumber,
    });
  } catch (err: any) {
    console.error("Unexpected create invoice error:", err);
    return NextResponse.json(
      { error: err?.message || "Unexpected error while creating invoice" },
      { status: 500 }
    );
  }
}
