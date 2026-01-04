import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

export const runtime = "nodejs";

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !(service || anon)) throw new Error("Missing Supabase env");
  return createClient(url, service || anon!, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    const rows = (body?.rows || []) as Array<{ item_code?: string; sku?: string; selling_price: number }>;
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ ok: false, error: "No rows provided" }, { status: 400 });
    }

    const supabase = supaAdmin();
    let updated = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const item_code = String(r.item_code || "").trim();
      const sku = String(r.sku || "").trim();
      const selling_price = Number(r.selling_price);

      if (!Number.isFinite(selling_price)) {
        errors.push(`Row ${i + 1}: invalid selling_price`);
        continue;
      }
      if (!item_code && !sku) {
        errors.push(`Row ${i + 1}: missing item_code/sku`);
        continue;
      }

      let q = supabase.from("products").update({ selling_price }).select("id").limit(1);

      q = item_code ? q.eq("item_code", item_code) : q.eq("sku", sku);

      const { data, error } = await q;

      if (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
        continue;
      }
      if (!data || data.length === 0) {
        errors.push(`Row ${i + 1}: product not found (${item_code || sku})`);
        continue;
      }

      updated++;
    }

    return NextResponse.json({ ok: true, updated, errors });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
  }
}
