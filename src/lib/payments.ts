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

/**
 * Recalculate:
 * - amount_paid
 * - balance_due
 * - status (ISSUED / PARTIALLY_PAID / PAID) unless VOID
 *
 * Uses invoices.total_incl_vat (or total_amount if your schema uses it).
 */
export async function recalcInvoicePaymentState(invoiceId: number | string) {
  const supabase = supaAdmin();

  // 1) get invoice total + current status
  const { data: inv, error: invErr } = await supabase
    .from("invoices")
    .select("id,status,total_incl_vat,total_amount")
    .eq("id", invoiceId)
    .single();

  if (invErr) throw new Error(invErr.message);

  const currentStatus = String(inv?.status || "").toUpperCase();
  if (currentStatus === "VOID") {
    // still compute paid/balance but keep VOID
  }

  const total = inv?.total_incl_vat ?? inv?.total_amount ?? 0;
  const totalNum = n2(total);

  // 2) sum payments
  const { data: pays, error: payErr } = await supabase
    .from("invoice_payments")
    .select("amount")
    .eq("invoice_id", invoiceId);

  if (payErr) throw new Error(payErr.message);

  const paid = (pays || []).reduce((sum: number, p: any) => sum + n2(p.amount), 0);
  const balance = Math.max(0, totalNum - paid);

  // 3) compute next status
  let nextStatus = currentStatus || "ISSUED";
  if (currentStatus !== "VOID") {
    if (paid <= 0) nextStatus = "ISSUED";
    else if (paid > 0 && paid + 0.0001 < totalNum) nextStatus = "PARTIALLY_PAID";
    else nextStatus = "PAID";
  }

  // 4) update invoice
  const { error: upErr } = await supabase
    .from("invoices")
    .update({
      amount_paid: paid,
      balance_due: balance,
      status: nextStatus,
    })
    .eq("id", invoiceId);

  if (upErr) throw new Error(upErr.message);

  return { paid, balance, status: nextStatus, total: totalNum };
}
