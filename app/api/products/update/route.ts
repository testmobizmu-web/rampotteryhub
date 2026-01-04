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

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });

    const id = Number(body.id);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
    }

    const patch: any = {};
    const allow = [
      "item_code",
      "sku",
      "name",
      "description",
      "units_per_box",
      "selling_price",
      "image_url",
      "is_active",
    ] as const;

    for (const k of allow) {
      if (k in body) patch[k] = body[k];
    }

    // normalize
    if ("item_code" in patch) patch.item_code = String(patch.item_code || "").trim() || null;
    if ("sku" in patch) patch.sku = String(patch.sku || "").trim() || null;
    if ("name" in patch) patch.name = String(patch.name || "").trim() || null;
    if ("description" in patch) patch.description = String(patch.description || "").trim() || null;
    if ("image_url" in patch) patch.image_url = String(patch.image_url || "").trim() || null;

    if ("units_per_box" in patch) {
      const n = Number(patch.units_per_box);
      patch.units_per_box = Number.isFinite(n) ? n : null;
    }
    if ("selling_price" in patch) {
      const n = Number(patch.selling_price);
      patch.selling_price = Number.isFinite(n) ? n : null;
    }
    if ("is_active" in patch) patch.is_active = !!patch.is_active;

    const supabase = supaAdmin();

    const { error } = await supabase.from("products").update(patch).eq("id", id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
  }
}
