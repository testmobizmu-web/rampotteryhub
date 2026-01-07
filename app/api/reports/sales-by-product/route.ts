// app/api/reports/sales-by-product/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !service) throw new Error("Missing Supabase env");
  return createClient(url, service, { auth: { persistSession: false } });
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const from = (searchParams.get("from") || "").trim(); // yyyy-mm-dd
    const to = (searchParams.get("to") || "").trim();     // yyyy-mm-dd

    const supabase = supaAdmin();

    const { data, error } = await supabase
      .from("invoice_items")
      .select(
        `
        id,
        total_qty,
        unit_price_excl_vat,
        unit_vat,
        unit_price_incl_vat,
        line_total,
        invoice:invoice_id (
          invoice_date,
          status
        ),
        product:product_id (
          item_code,
          sku,
          name
        )
      `
      );

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    const rows = (data || [])
      .filter((r: any) => {
        const inv = r.invoice;
        if (!inv) return false;
        const status = String(inv.status || "").toUpperCase();
        if (status === "VOID") return false;

        const d = String(inv.invoice_date || "").slice(0, 10);
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      })
      .map((r: any) => {
        const p = r.product || {};
        const code = p.item_code || p.sku || "—";
        const qty = Number(r.total_qty || 0);
        const ex = Number(r.unit_price_excl_vat || 0) * qty;
        const vat = Number(r.unit_vat || 0) * qty;
        const inc = Number(r.unit_price_incl_vat || 0) * qty;
        const lineTotal = Number(r.line_total || 0);

        return { code, name: p.name || "", qty, ex, vat, inc, lineTotal };
      });

    const map = new Map<string, any>();
    for (const r of rows) {
      const cur = map.get(r.code) || {
        item_code: r.code,
        product_name: r.name,
        qty: 0,
        ex_total: 0,
        vat_total: 0,
        inc_total: 0,
        line_total: 0,
      };
      cur.qty += r.qty;
      cur.ex_total += r.ex;
      cur.vat_total += r.vat;
      cur.inc_total += r.inc;
      cur.line_total += r.lineTotal;
      if (!cur.product_name && r.name) cur.product_name = r.name;
      map.set(r.code, cur);
    }

    const out = Array.from(map.values()).sort((a, b) => String(a.item_code).localeCompare(String(b.item_code)));

    return NextResponse.json({ ok: true, rows: out });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
  }
}
