import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

export const dynamic = "force-dynamic";

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !(service || anon)) {
    throw new Error(
      "Missing Supabase env. Need NEXT_PUBLIC_SUPABASE_URL + (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY)"
    );
  }

  return createClient(url, service || anon!, { auth: { persistSession: false } });
}

function ymKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function labelForYM(ym: string) {
  const [y, m] = ym.split("-").map((x) => Number(x));
  const d = new Date(y, (m || 1) - 1, 1);
  const mon = d.toLocaleString("en-GB", { month: "short" });
  return `${mon} ${String(y).slice(-2)}`;
}

function normStatus(s: any) {
  return String(s || "").toLowerCase().trim();
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const supabase = supaAdmin();

    // Last 6 months window: from start of (currentMonth - 5) to end of today
    const now = new Date();
    const fromMonth = addMonths(startOfMonth(now), -5);
    const fromISO = fromMonth.toISOString();
    const toISO = endOfDay(now).toISOString();

    // Fetch invoices (keep this aligned with your schema)
    // Common fields in your project: invoice_date, total_amount, status
    const { data, error } = await supabase
      .from("invoices")
      .select("invoice_date, total_amount, status")
      .gte("invoice_date", fromISO)
      .lte("invoice_date", toISO);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Prepare month buckets in correct order (6 months)
    const months: string[] = [];
    for (let i = 0; i < 6; i++) {
      const d = addMonths(fromMonth, i);
      months.push(ymKey(d));
    }

    const sums = new Map<string, number>();
    for (const ym of months) sums.set(ym, 0);

    // Aggregate
    for (const inv of data || []) {
      const st = normStatus(inv.status);
      // Exclude void/cancel (executive chart should reflect real sales)
      if (st.includes("void") || st.includes("cancel")) continue;

      const dt = inv.invoice_date ? new Date(inv.invoice_date) : null;
      if (!dt || isNaN(dt.getTime())) continue;

      const ym = ymKey(dt);
      if (!sums.has(ym)) continue;

      const amt = Number(inv.total_amount || 0);
      sums.set(ym, (sums.get(ym) || 0) + (Number.isFinite(amt) ? amt : 0));
    }

    const series = months.map((ym) => ({
      ym,
      label: labelForYM(ym),
      total: Number((sums.get(ym) || 0).toFixed(2)),
    }));

    return NextResponse.json({ ok: true, series });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
  }
}
