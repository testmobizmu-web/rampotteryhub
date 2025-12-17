// app/api/invoices/[id]/payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

type Action = "MARK_PAID" | "MARK_UNPAID" | "ADD_PAYMENT";

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return NextResponse.json({ ok: false, error: "Invalid invoice id" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const action = body?.action as Action | undefined;
    const paymentAmount = Number(body?.paymentAmount || 0);

    if (!action) {
      return NextResponse.json({ ok: false, error: "action is required" }, { status: 400 });
    }

    // Load invoice current values
    const { data: inv, error: invErr } = await supabase
      .from("invoices")
      .select(
        "id, total_amount, previous_balance, gross_total, amount_paid, balance_remaining, status"
      )
      .eq("id", numericId)
      .single();

    if (invErr || !inv) {
      return NextResponse.json({ ok: false, error: "Invoice not found" }, { status: 404 });
    }

    const totalAmount = Number(inv.total_amount || 0);
    const previousBalance = Number(inv.previous_balance || 0);
    const grossTotal = Number(inv.gross_total || (totalAmount + previousBalance));
    const currentPaid = Number(inv.amount_paid || 0);

    let newPaid = currentPaid;

    if (action === "MARK_UNPAID") {
      newPaid = 0;
    }

    if (action === "MARK_PAID") {
      newPaid = grossTotal;
    }

    if (action === "ADD_PAYMENT") {
      if (paymentAmount <= 0) {
        return NextResponse.json(
          { ok: false, error: "paymentAmount must be > 0" },
          { status: 400 }
        );
      }
      newPaid = currentPaid + paymentAmount;
    }

    // clamp
    if (newPaid < 0) newPaid = 0;
    if (newPaid > grossTotal) newPaid = grossTotal;

    const newBalance = round2(grossTotal - newPaid);

    let newStatus: "PAID" | "UNPAID" | "PARTIAL" = "UNPAID";
    if (newPaid <= 0) newStatus = "UNPAID";
    else if (newBalance <= 0) newStatus = "PAID";
    else newStatus = "PARTIAL";

    const { error: updErr } = await supabase
      .from("invoices")
      .update({
        amount_paid: round2(newPaid),
        balance_remaining: round2(newBalance),
        status: newStatus,
      })
      .eq("id", numericId);

    if (updErr) {
      return NextResponse.json({ ok: false, error: updErr.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      invoice: {
        id: numericId,
        gross_total: grossTotal,
        amount_paid: round2(newPaid),
        balance_remaining: round2(newBalance),
        status: newStatus,
      },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Payment update failed" },
      { status: 500 }
    );
  }
}
