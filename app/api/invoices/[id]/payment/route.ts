import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { canRecordPayments, getUserFromHeader } from "@/lib/payments";

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !(service || anon)) {
    throw new Error(
      "Missing Supabase env. Need NEXT_PUBLIC_SUPABASE_URL + (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY)"
    );
  }
  return createClient(url, service || anon!);
}

function n2(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

function statusFromPaid(totalDue: number, paid: number) {
  if (paid <= 0) return "ISSUED";
  if (paid + 0.00001 >= totalDue) return "PAID";
  return "PARTIALLY_PAID";
}

/**
 * Deduct stock ONCE when invoice becomes PAID
 */
async function deductStockOnce(
  supabase: any,
  invoiceId: number,
  invoiceNumber: string,
  alreadyDeducted: boolean
) {
  if (alreadyDeducted) return;

  // 1) Load invoice items
  const { data: items, error: itErr } = await supabase
    .from("invoice_items")
    .select("product_id, total_qty")
    .eq("invoice_id", invoiceId);

  if (itErr) throw itErr;

  const movements = (items || [])
    .map((it: any) => {
      const pid = Number(it.product_id);
      const qty = Number(it.total_qty);
      if (!pid || qty <= 0) return null;

      return {
        product_id: pid,
        movement_type: "OUT",
        quantity: qty,
        reference: invoiceNumber,
        source_table: "invoices",
        source_id: invoiceId,
        notes: "Invoice PAID – stock deducted",
      };
    })
    .filter(Boolean) as any[];

  if (!movements.length) return;

  // 2) Insert stock movements (audit log)
  const { error: mvErr } = await supabase
    .from("stock_movements")
    .insert(movements);

  if (mvErr) throw mvErr;

  // 3) Decrement live product stock via RPC (safe)
  for (const m of movements) {
    await supabase.rpc("decrement_product_stock", {
      p_product_id: m.product_id,
      p_qty: m.quantity,
    });
  }

  // 4) Lock deduction so it never happens again
  const { error: lockErr } = await supabase
    .from("invoices")
    .update({ stock_deducted_at: new Date().toISOString() })
    .eq("id", invoiceId);

  if (lockErr) throw lockErr;
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;

    const invoiceId = Number(id);
    if (!Number.isFinite(invoiceId) || invoiceId <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid invoice id" }, { status: 400 });
    }

    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!canRecordPayments(user)) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));

    const amount = n2(body.amount);
    const method = String(body.method || "").trim();
    const reference = String(body.reference || "").trim() || null;
    const notes = String(body.notes || "").trim() || null;
    const payment_date = String(body.payment_date || "").trim() || null;

    if (!amount || amount <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid amount" }, { status: 400 });
    }
    if (!method) {
      return NextResponse.json({ ok: false, error: "Payment method required" }, { status: 400 });
    }

    const supabase = supaAdmin();

    // 1) Insert payment
    const { error: insErr } = await supabase.from("invoice_payments").insert({
      invoice_id: invoiceId,
      amount,
      method,
      reference,
      notes,
      ...(payment_date ? { payment_date } : {}),
    });

    if (insErr) {
      return NextResponse.json({ ok: false, error: insErr.message }, { status: 500 });
    }

    // 2) Load invoice (with stock lock info)
    const { data: inv, error: invErr } = await supabase
      .from("invoices")
      .select(
        "id, invoice_number, total_amount, previous_balance, gross_total, status, stock_deducted_at"
      )
      .eq("id", invoiceId)
      .single();

    if (invErr || !inv) {
      return NextResponse.json(
        { ok: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    const totalAmount = n2(inv.total_amount);
    const previousBalance = n2(inv.previous_balance);
    const grossTotal =
      inv.gross_total != null ? n2(inv.gross_total) : totalAmount + previousBalance;

    // 3) Sum all payments
    const { data: pays, error: payErr } = await supabase
      .from("invoice_payments")
      .select("amount")
      .eq("invoice_id", invoiceId);

    if (payErr) {
      return NextResponse.json({ ok: false, error: payErr.message }, { status: 500 });
    }

    const paidTotal = (pays || []).reduce((s: number, r: any) => s + n2(r.amount), 0);
    const balanceDue = Math.max(0, grossTotal - paidTotal);
    const newStatus = statusFromPaid(grossTotal, paidTotal);

    // 4) Update invoice totals + status
    const { error: updErr } = await supabase
      .from("invoices")
      .update({
        amount_paid: paidTotal,
        balance_due: balanceDue,
        balance_remaining: balanceDue,
        gross_total: grossTotal,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invoiceId);

    if (updErr) {
      return NextResponse.json({ ok: false, error: updErr.message }, { status: 500 });
    }

    // 5) STOCK DEDUCTION (ONLY WHEN STATUS BECOMES PAID)
    if (newStatus === "PAID") {
      await deductStockOnce(
        supabase,
        invoiceId,
        inv.invoice_number,
        Boolean(inv.stock_deducted_at)
      );
    }

    return NextResponse.json({
      ok: true,
      invoiceId,
      status: newStatus,
      totals: {
        grossTotal: +grossTotal.toFixed(2),
        amountPaid: +paidTotal.toFixed(2),
        balanceDue: +balanceDue.toFixed(2),
      },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
