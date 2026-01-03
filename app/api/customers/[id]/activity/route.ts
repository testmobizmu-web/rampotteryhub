import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !(service || anon)) {
    throw new Error("Missing Supabase env");
  }

  return createClient(url, service || anon!, { auth: { persistSession: false } });
}

function n(v: any) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const cid = Number(id);
    if (!Number.isFinite(cid) || cid <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid customer id" }, { status: 400 });
    }

    const supabase = supaAdmin();

    const { data, error } = await supabase
      .from("invoices")
      .select("total_amount, amount_paid, balance_remaining")
      .eq("customer_id", cid);

    if (error) throw error;

    const invoices = data || [];

    const activity = {
      invoices_count: invoices.length,
      total_invoiced: invoices.reduce((s, r) => s + n(r.total_amount), 0),
      total_paid: invoices.reduce((s, r) => s + n(r.amount_paid), 0),
      outstanding: invoices.reduce((s, r) => s + n(r.balance_remaining), 0),
    };

    return NextResponse.json({ ok: true, activity });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load activity" },
      { status: 500 }
    );
  }
}
