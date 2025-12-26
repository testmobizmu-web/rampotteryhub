import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
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

export async function GET(req: NextRequest) {
  try {
    if (!isAllowed(req)) return NextResponse.json({ ok: false, error: "Access denied" }, { status: 403 });

    const customerId = Number(req.nextUrl.searchParams.get("customerId") || 0);
    if (!customerId) return NextResponse.json({ ok: false, error: "Missing customerId" }, { status: 400 });

    const supabase = supaAdmin();
    const { data, error } = await supabase
      .from("customer_product_prices")
      .select("customer_id, product_id, price_excl_vat")
      .eq("customer_id", customerId);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, rows: data || [] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAllowed(req)) return NextResponse.json({ ok: false, error: "Access denied" }, { status: 403 });

    const body = (await req.json().catch(() => null)) as any;
    const customerId = Number(body?.customerId || 0);
    const productId = Number(body?.productId || 0);
    const priceExclVat = Number(body?.priceExclVat);

    if (!customerId || !productId || !Number.isFinite(priceExclVat) || priceExclVat <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const supabase = supaAdmin();
    const { error } = await supabase
      .from("customer_product_prices")
      .upsert([{ customer_id: customerId, product_id: productId, price_excl_vat: priceExclVat }] as any, {
        onConflict: "customer_id,product_id",
      });

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!isAllowed(req)) return NextResponse.json({ ok: false, error: "Access denied" }, { status: 403 });

    const body = (await req.json().catch(() => null)) as any;
    const customerId = Number(body?.customerId || 0);
    const productId = Number(body?.productId || 0);

    if (!customerId || !productId) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const supabase = supaAdmin();
    const { error } = await supabase
      .from("customer_product_prices")
      .delete()
      .eq("customer_id", customerId)
      .eq("product_id", productId);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
  }
}

