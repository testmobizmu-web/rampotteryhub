import { createClient } from "@supabase/supabase-js";

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

export function getUserFromHeader(xRpUser: string | null): any | null {
  if (!xRpUser) return null;
  try {
    return JSON.parse(xRpUser);
  } catch {
    return null;
  }
}

export function canRecordPayments(user: any) {
  if (!user) return false;
  if (String(user.role || "").toLowerCase() === "admin") return true;
  // allow accounting / sales to record payments if you have permissions object
  return Boolean(user?.permissions?.canEditInvoices || user?.permissions?.canEditPayments);
}

export function canDeletePayments(user: any) {
  if (!user) return false;
  return String(user.role || "").toLowerCase() === "admin";
}

function n2(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

function statusFromPaid(totalDue: number, paid: number, currentStatus: string) {
  const cur = String(currentStatus || "").toUpperCase().trim();
  if (cur === "VOID") return "VOID";

  const due = Math.max(0, totalDue);
  const p = Math.max(0, paid);

  if (p <= 0) return "ISSUED";
  if (p + 0.00001 >= due) return "PAID";
  return "PARTIALLY_PAID";
}

/**
 * Recalculate and persist invoice payment state:
 * - amount_paid
 * - balance_due
 * - balance_remaining
 * - gross_total
 * - status (ISSUED / PARTIALLY_PAID / PAID) unless VOID
 *
 * Uses:
 * - invoices.gross_total if present,
 * - else total_amount + previous_balance
 */
export async function recalcInvoicePaymentState(invoiceId: number | string) {
  const supabase = supaAdmin();

  // 1) get invoice totals + current status
  const { data: inv, error: invErr } = await supabase
    .from("invoices")
    .select("id,status,total_amount,previous_balance,gross_total")
    .eq("id", invoiceId)
    .single();

  if (invErr) throw new Error(invErr.message);

  const currentStatus = String(inv?.status || "").toUpperCase().trim();

  const totalAmount = n2(inv?.total_amount);
  const previousBalance = n2(inv?.previous_balance);

  // Prefer stored gross_total, else compute
  const grossTotal =
    inv?.gross_total != null ? n2(inv.gross_total) : totalAmount + previousBalance;

  // 2) sum payments
  const { data: pays, error: payErr } = await supabase
    .from("invoice_payments")
    .select("amount")
    .eq("invoice_id", invoiceId);

  if (payErr) throw new Error(payErr.message);

  const paid = (pays || []).reduce((sum: number, p: any) => sum + n2(p.amount), 0);

  const balance = Math.max(0, grossTotal - paid);

  // 3) compute next status
  const nextStatus = statusFromPaid(grossTotal, paid, currentStatus);

  // 4) update invoice
  const { error: upErr } = await supabase
    .from("invoices")
    .update({
      amount_paid: paid,
      balance_due: balance,
      balance_remaining: balance,
      gross_total: grossTotal,
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", invoiceId);

  if (upErr) throw new Error(upErr.message);

  return {
    invoiceId: Number(inv?.id),
    paid: +paid.toFixed(2),
    balance: +balance.toFixed(2),
    status: nextStatus,
    grossTotal: +grossTotal.toFixed(2),
    totalAmount: +totalAmount.toFixed(2),
    previousBalance: +previousBalance.toFixed(2),
  };
}
