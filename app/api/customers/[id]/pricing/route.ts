import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

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

// Try multiple product price column names safely
function pickBasePrice(p: any) {
  return n(
    p?.selling_price ??
      p?.unit_price ??
      p?.price ??
      p?.sale_price ??
      p?.mrp ??
      0
  );
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await ctx.params;
    const customerId = Number(id);
    if (!Number.isFinite(customerId) || customerId <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid customer id" }, { status: 400 });
    }

    const supabase = supaAdmin();

    // Load products (safe across schemas)
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("id, sku, name, unit_price, selling_price, price")
      .order("name", { ascending: true });

    if (prodErr) throw prodErr;

    // Load overrides for this customer
    const { data: overrides, error: ovErr } = await supabase
      .from("customer_pricing")
      .select("product_id, customer_price")
      .eq("customer_id", customerId);

    if (ovErr) throw ovErr;

    const map = new Map<string, number>();
    (overrides || []).forEach((r: any) => map.set(String(r.product_id), n(r.customer_price)));

    const rows = (products || []).map((p: any) => {
      const pid = String(p.id);
      const base = pickBasePrice(p);
      const cust = map.has(pid) ? map.get(pid)! : null;

      return {
        product_id: n(p.id),
        sku: p.sku ?? "",
        name: p.name ?? "",
        base_price: base,
        customer_price: cust, // null means “uses base”
        effective_price: cust != null ? cust : base,
        has_override: cust != null,
      };
    });

    return NextResponse.json({ ok: true, customerId, rows });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await ctx.params;
    const customerId = Number(id);
    if (!Number.isFinite(customerId) || customerId <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid customer id" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const items = Array.isArray(body?.items) ? body.items : [];

    if (!items.length) {
      return NextResponse.json({ ok: false, error: "No items provided" }, { status: 400 });
    }

    const supabase = supaAdmin();

    const now = new Date().toISOString();

    const rows = items.map((it: any) => {
      const product_id = Number(it.product_id);
      const customer_price = Number(it.customer_price);

      if (!Number.isFinite(product_id) || product_id <= 0) {
        throw new Error("Invalid product_id");
      }
      if (!Number.isFinite(customer_price) || customer_price < 0) {
        throw new Error("Invalid customer_price");
      }

      return {
        customer_id: customerId,
        product_id,
        customer_price,
        updated_at: now,
      };
    });

    const { error } = await supabase
      .from("customer_pricing")
      .upsert(rows, { onConflict: "customer_id,product_id" });

    if (error) throw error;

    return NextResponse.json({ ok: true, updated: rows.length });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await ctx.params;
    const customerId = Number(id);
    if (!Number.isFinite(customerId) || customerId <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid customer id" }, { status: 400 });
    }

    const productId = Number(req.nextUrl.searchParams.get("product_id"));
    if (!Number.isFinite(productId) || productId <= 0) {
      return NextResponse.json({ ok: false, error: "Missing product_id" }, { status: 400 });
    }

    const supabase = supaAdmin();

    const { error } = await supabase
      .from("customer_pricing")
      .delete()
      .eq("customer_id", customerId)
      .eq("product_id", productId);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed" }, { status: 500 });
  }
}
