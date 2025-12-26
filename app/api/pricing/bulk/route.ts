import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) throw new Error("Missing Supabase env for server client.");
  return createClient(url, key, { auth: { persistSession: false } });
}

function isAllowed(req: Request) {
  const raw = req.headers.get("x-rp-user") || "";
  try {
    const u = JSON.parse(raw || "{}");
    const role = String(u?.role || "").toLowerCase();
    const ok = role === "admin" || Boolean(u?.permissions?.canEditStock);
    return ok;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    if (!isAllowed(req)) {
      return NextResponse.json({ ok: false, error: "Access denied" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const customerId = Number(body?.customerId);
    const rows = Array.isArray(body?.rows) ? body.rows : [];

    if (!customerId || !Number.isFinite(customerId)) {
      return NextResponse.json({ ok: false, error: "Missing/invalid customerId" }, { status: 400 });
    }
    if (rows.length === 0) {
      return NextResponse.json({ ok: false, error: "No rows to import" }, { status: 400 });
    }

    const payload = rows
      .map((r: any) => ({
        customer_id: customerId,
        product_id: Number(r?.productId),
        price_excl_vat: Number(r?.priceExclVat),
      }))
      .filter((r: any) => Number.isFinite(r.product_id) && r.product_id > 0 && Number.isFinite(r.price_excl_vat) && r.price_excl_vat > 0);

    if (payload.length === 0) {
      return NextResponse.json({ ok: false, error: "No valid rows after validation" }, { status: 400 });
    }

    const supabase = getServerSupabase();

    // IMPORTANT: Requires unique constraint on (customer_id, product_id)
    // If you named it, it's fine — Postgres will still accept onConflict columns.
    const { error } = await supabase
      .from("customer_product_prices")
      .upsert(payload, { onConflict: "customer_id,product_id" });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, imported: payload.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
  }
}
