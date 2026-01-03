// app/api/products/list/route.ts
import { NextRequest, NextResponse } from "next/server";
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
  return createClient(url, service || anon!, { auth: { persistSession: false } });
}

function toNum(v: any) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = supaAdmin();

    // Optional filters
    const q = (req.nextUrl.searchParams.get("q") || "").trim();
    const activeOnly = (req.nextUrl.searchParams.get("activeOnly") || "1") === "1";
    const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get("limit") || 500), 1), 2000);

    let query = supabase
      .from("products")
      .select(
        [
          "id",
          "item_code",
          "name",
          "price_excl_vat",
          "vat_rate",
          "unit",
          "category",
          "is_active",
          "image_url",
          "created_at",
          "updated_at",
        ].join(",")
      )
      .order("item_code", { ascending: true })
      .limit(limit);

    if (activeOnly) query = query.eq("is_active", true);

    // Search by item_code or name
    if (q) {
      // Supabase "or" supports ilike
      // Note: commas separate conditions, so we keep it simple.
      query = query.or(`item_code.ilike.%${q}%,name.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Normalize output for UI (invoice page)
    const products = (data || []).map((p: any) => {
      const vatRate = toNum(p.vat_rate ?? 15);
      return {
        id: Number(p.id),
        item_code: String(p.item_code || "").trim(),
        name: String(p.name || "").trim(),
        // invoice page uses selling_price; map it from price_excl_vat
        selling_price: toNum(p.price_excl_vat),
        vat_rate: vatRate,
        unit: p.unit ?? null,
        category: p.category ?? null,
        is_active: Boolean(p.is_active),
        image_url: p.image_url ?? null,
      };
    });

    return NextResponse.json({ ok: true, products });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load products" },
      { status: 500 }
    );
  }
}
