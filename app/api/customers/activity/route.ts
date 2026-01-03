import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

export const dynamic = "force-dynamic";

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !(service || anon)) throw new Error("Missing Supabase env");
  return createClient(url, service || anon!, { auth: { persistSession: false } });
}

function n(v: any, fallback = 0) {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const supabase = supaAdmin();

    // Assumes invoices has customer_id + total_amount + balance_remaining (common in your project)
    const { data, error } = await supabase
      .from("invoices")
      .select("customer_id, total_amount, balance_remaining");

    if (error) throw error;

    const activityByCustomerId: Record<
      string,
      { invoiceCount: number; totalSales: number; outstanding: number }
    > = {};

    (data || []).forEach((row: any) => {
      const cid = row.customer_id;
      if (cid === null || cid === undefined) return;

      const key = String(cid);
      if (!activityByCustomerId[key]) {
        activityByCustomerId[key] = { invoiceCount: 0, totalSales: 0, outstanding: 0 };
      }
      activityByCustomerId[key].invoiceCount += 1;
      activityByCustomerId[key].totalSales += n(row.total_amount, 0);
      activityByCustomerId[key].outstanding += n(row.balance_remaining, 0);
    });

    return NextResponse.json({ ok: true, activityByCustomerId });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed" }, { status: 500 });
  }
}
