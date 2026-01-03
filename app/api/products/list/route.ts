// app/api/products/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

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

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const supabase = supaAdmin();

    const activeOnly = (req.nextUrl.searchParams.get("activeOnly") || "1") === "1";
    const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get("limit") || 5000), 1), 5000);

    let q = supabase
      .from("products")
      .select("id, item_code, sku, name, description, units_per_box, selling_price, is_active, image_url")
      .order("item_code", { ascending: true })
      .order("name", { ascending: true })
      .limit(limit);

    if (activeOnly) q = q.eq("is_active", true);

    const { data, error } = await q;

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, products: data || [] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
  }
}


