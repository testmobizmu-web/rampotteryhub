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
  const due = Math.max(0, totalDue);
  const p = Math.max(0, paid);

  if (p <= 0) return "ISSUED";
  if (p + 0.00001 >= due) return "PAID";
  return "PARTIALLY_PAID";
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;

    // ✅ enforce numeric invoice id
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
    const payment_date = String(body.payment_date || "").trim() || null; // optional yyyy-mm-dd

    if (!amount || amount <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid amount" }, { status: 400 });
    }
    if (!method) {
      return NextResponse.json({ ok: false, error: "Payment method required" }, { status: 400 });
    }

    const supabase = supaAdmin();

    // 1) Insert payment
    const insertPayload: any = {
      invoice_id: invoiceId,
      amount,
      method,
      reference,
      notes,
    };
    if (payment_date) insertPayload.payment_date = payment_date;

    const { error: insErr } = await supabase.from("invoice_payments").insert(insertPayload);
    if (insErr) return NextResponse.json({ ok: false, error: insErr.message }, { status: 500 });

    // 2) Load invoice totals (authoritative)
    const { data: inv, error: invErr } = await supabase
      .from("invoices")
      .select("id,total_amount,previous_balance,gross_total,amount_paid,balance_due,balance_remaining,status")
      .eq("id", invoiceId)
      .single();

    if (invErr || !inv) {
      return NextResponse.json(
        { ok: false, error: invErr?.message || "Invoice not found" },
        { status: 404 }
      );
    }

    const totalAmount = n2(inv.total_amount);
    const previousBalance = n2(inv.previous_balance);

    // if gross_total already stored, use it; else compute
    const grossTotal = inv.gross_total != null ? n2(inv.gross_total) : totalAmount + previousBalance;

    // 3) Sum payments for this invoice
    const { data: payRows, error: payErr } = await supabase
      .from("invoice_payments")
      .select("amount")
      .eq("invoice_id", invoiceId);

    if (payErr) {
      return NextResponse.json({ ok: false, error: payErr.message }, { status: 500 });
    }

    const paidTotal = (payRows || []).reduce((s: number, r: any) => s + n2(r.amount), 0);
    const balanceDue = Math.max(0, grossTotal - paidTotal);
    const newStatus = statusFromPaid(grossTotal, paidTotal);

    // 4) Update invoice state
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

    // 5) Return updated state (your UI can use it if needed)
    return NextResponse.json({
      ok: true,
      invoiceId,
      totals: {
        grossTotal: +grossTotal.toFixed(2),
        amountPaid: +paidTotal.toFixed(2),
        balanceDue: +balanceDue.toFixed(2),
      },
      status: newStatus,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
