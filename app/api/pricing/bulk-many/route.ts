import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type IncomingRow = {
  customer_code: string;
  item_code: string;
  priceExclVat: number;
};

type NormalizedRow = {
  customer_code: string;
  item_code: string;
  price_excl_vat: number;
};

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
    const u = JSON.parse(raw || "{}") as any;
    const role = String(u?.role || "").toLowerCase();
    return role === "admin" || Boolean(u?.permissions?.canEditStock);
  } catch {
    return false;
  }
}

function up(s: unknown) {
  return String(s ?? "").trim().toUpperCase();
}

export async function POST(req: Request) {
  try {
    if (!isAllowed(req)) {
      return NextResponse.json({ ok: false, error: "Access denied" }, { status: 403 });
    }

    const body = (await req.json().catch(() => null)) as { rows?: IncomingRow[] } | null;
    const rows = Array.isArray(body?.rows) ? body!.rows : [];

    if (rows.length === 0) {
      return NextResponse.json({ ok: false, error: "No rows to import" }, { status: 400 });
    }

    // Normalize + validate
    const normalized: NormalizedRow[] = rows
      .map((r) => ({
        customer_code: up(r?.customer_code),
        item_code: up(r?.item_code),
        price_excl_vat: Number(r?.priceExclVat),
      }))
      .filter(
        (r) =>
          r.customer_code.length > 0 &&
          r.item_code.length > 0 &&
          Number.isFinite(r.price_excl_vat) &&
          r.price_excl_vat > 0
      );

    if (normalized.length === 0) {
      return NextResponse.json({ ok: false, error: "No valid rows after validation" }, { status: 400 });
    }

    const supabase = getServerSupabase();

    // Collect unique codes (typed, no implicit any)
    const customerCodes = Array.from(new Set(normalized.map((r: NormalizedRow) => r.customer_code)));
    const itemCodes = Array.from(new Set(normalized.map((r: NormalizedRow) => r.item_code)));

    // Fetch matching customers
    const { data: customers, error: cErr } = await supabase
      .from("customers")
      .select("id, customer_code")
      .in("customer_code", customerCodes);

    if (cErr) return NextResponse.json({ ok: false, error: cErr.message }, { status: 500 });

    const customerMap = new Map<string, number>();
    for (const c of customers || []) {
      const code = up((c as any).customer_code);
      if (code) customerMap.set(code, Number((c as any).id));
    }

    // Fetch matching products
    const { data: products, error: pErr } = await supabase
      .from("products")
      .select("id, item_code")
      .in("item_code", itemCodes);

    if (pErr) return NextResponse.json({ ok: false, error: pErr.message }, { status: 500 });

    const productMap = new Map<string, number>();
    for (const p of products || []) {
      const code = up((p as any).item_code);
      if (code) productMap.set(code, Number((p as any).id));
    }

    // Build upsert payload
    let unknownCustomers = 0;
    let unknownItems = 0;
    let skipped = 0;

    const payload: Array<{ customer_id: number; product_id: number; price_excl_vat: number }> = [];

    for (const r of normalized) {
      const cid = customerMap.get(r.customer_code);
      if (!cid) {
        unknownCustomers += 1;
        skipped += 1;
        continue;
      }
      const pid = productMap.get(r.item_code);
      if (!pid) {
        unknownItems += 1;
        skipped += 1;
        continue;
      }

      payload.push({ customer_id: cid, product_id: pid, price_excl_vat: r.price_excl_vat });
    }

    if (payload.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "All rows were skipped (unknown customers/items).",
          imported: 0,
          skipped,
          unknownCustomers,
          unknownItems,
        },
        { status: 400 }
      );
    }

    const { error: upErr } = await supabase
      .from("customer_product_prices")
      .upsert(payload, { onConflict: "customer_id,product_id" });

    if (upErr) return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });

    return NextResponse.json({
      ok: true,
      imported: payload.length,
      skipped,
      unknownCustomers,
      unknownItems,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
  }
}
