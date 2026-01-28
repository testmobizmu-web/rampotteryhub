// app/api/customers/broadcast/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

export const dynamic = "force-dynamic";

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !(service || anon)) {
    throw new Error(
      "Missing Supabase env. Need NEXT_PUBLIC_SUPABASE_URL + (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY)"
    );
  }
  return createClient(url, service || anon!, { auth: { persistSession: false } });
}

function digitsOnly(v: any) {
  return String(v ?? "").replace(/[^\d]/g, "");
}

// Mauritius only: returns "230XXXXXXXX" or ""
function normalizeMuPhone(raw: any) {
  const d = digitsOnly(raw);
  if (!d) return "";
  if (d.length === 8) return "230" + d;
  if (d.startsWith("230") && d.length === 11) return d;
  return "";
}

function money(v: any) {
  const x = Number(v ?? 0);
  const n = Number.isFinite(x) ? x : 0;
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function yyyyMmDd(d: Date) {
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

type BroadcastType = "OVERDUE" | "STATEMENT";

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const body: any = await req.json().catch(() => ({}));
    const type = String(body?.type || "OVERDUE").toUpperCase() as BroadcastType;

    const supabase = supaAdmin();

    // -------- logic --------
    // You said: no due date in invoices => overdue = invoice_date older than 30 days AND balance > 0
    const today = new Date();
    const overdueCutoff = new Date(today);
    overdueCutoff.setDate(overdueCutoff.getDate() - 30);

    const dateFrom = body?.dateFrom ? String(body.dateFrom) : null; // "YYYY-MM-DD"
    const dateTo = body?.dateTo ? String(body.dateTo) : null;       // "YYYY-MM-DD"

    // Fetch invoices with customers (only what we need)
    let query = supabase
      .from("invoices")
      .select(
        `
        id,
        invoice_number,
        invoice_date,
        total_amount,
        amount_paid,
        balance_remaining,
        customers (
          id,
          name,
          whatsapp,
          phone
        )
      `
      )
      .gt("balance_remaining", 0)
      .neq("status", "VOID");

    if (type === "OVERDUE") {
      query = query.lte("invoice_date", yyyyMmDd(overdueCutoff));
    } else {
      // STATEMENT: user chooses dates
      if (dateFrom) query = query.gte("invoice_date", dateFrom);
      if (dateTo) query = query.lte("invoice_date", dateTo);
    }

    const { data, error } = await query.order("invoice_date", { ascending: true });

    if (error) throw error;

    // Group by customer
    const map = new Map<
      string,
      { customerName: string; whatsapp: string; invoices: any[] }
    >();

    for (const inv of data || []) {
      const c = (inv as any)?.customers;
      if (!c?.id) continue;

      const wa = normalizeMuPhone(c.whatsapp || c.phone || "");
      if (!wa) continue; // skip customers with no valid MU WhatsApp

      const key = String(c.id);
      if (!map.has(key)) {
        map.set(key, { customerName: String(c.name || "Customer"), whatsapp: wa, invoices: [] });
      }
      map.get(key)!.invoices.push(inv);
    }

    // Build messages
    const list = Array.from(map.values()).map((x) => {
      const lines: string[] = [];

      if (type === "OVERDUE") {
        lines.push(`Reminder: Overdue invoices (30+ days) ⚠️`);
      } else {
        lines.push(`Statement of account`);
        if (dateFrom || dateTo) lines.push(`Period: ${dateFrom || "—"} to ${dateTo || "—"}`);
      }

      lines.push(`Customer: ${x.customerName}`);
      lines.push("");

      let totalOutstanding = 0;

      for (const inv of x.invoices) {
        const invNo = String(inv.invoice_number || `#${inv.id}`);
        const bal = Number(inv.balance_remaining ?? 0) || 0;
        totalOutstanding += bal;

        lines.push(
          `• ${invNo} (${inv.invoice_date || "—"}) — Balance Rs ${money(bal)}`
        );
      }

      lines.push("");
      lines.push(`Total outstanding: Rs ${money(totalOutstanding)}`);
      lines.push(`Reply to confirm payment / send proof.`);

      return {
        customerName: x.customerName,
        whatsapp: x.whatsapp,
        message: lines.join("\n"),
      };
    });

    return NextResponse.json({ ok: true, type, count: list.length, list });
  } catch (err: any) {
    console.error("Broadcast customers error:", err);
    return NextResponse.json({ ok: false, error: err?.message || "Failed" }, { status: 500 });
  }
}

