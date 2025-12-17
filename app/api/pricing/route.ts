// app/api/pricing/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;

    const customerIdRaw = sp.get("customerId");
    const productIdRaw = sp.get("productId");

    const customerId = customerIdRaw ? Number(customerIdRaw) : null;
    const productId = productIdRaw ? Number(productIdRaw) : null;

    // ✅ Case A: lookup one price (used by invoice page)
    if (customerId && productId) {
      // 1) partywise price
      const { data: cpp } = await supabase
        .from("customer_product_prices")
        .select("unit_price_excl_vat")
        .eq("customer_id", customerId)
        .eq("product_id", productId)
        .maybeSingle();

      if (cpp && cpp.unit_price_excl_vat !== null) {
        return NextResponse.json({
          ok: true,
          priceExclVat: Number(cpp.unit_price_excl_vat),
          source: "customer",
        });
      }

      // 2) default product price fallback (use selling_price)
      const { data: p, error } = await supabase
        .from("products")
        .select("selling_price")
        .eq("id", productId)
        .single();

      if (error || !p) {
        return NextResponse.json(
          { ok: false, error: "Product not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        ok: true,
        priceExclVat: Number((p as any).selling_price || 0),
        source: "default",
      });
    }

    // ✅ Case B: list all prices for a customer (used by pricing UI)
    if (customerId && !productId) {
      const { data, error } = await supabase
        .from("customer_product_prices")
        .select("id, customer_id, product_id, unit_price_excl_vat, updated_at")
        .eq("customer_id", customerId);

      if (error) {
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ ok: true, prices: data || [] });
    }

    return NextResponse.json(
      { ok: false, error: "Provide customerId (and optional productId)" },
      { status: 400 }
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Pricing GET failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { ok: false, error: "Missing JSON body" },
        { status: 400 }
      );
    }

    // Accept either single row or array
    const rows = Array.isArray(body) ? body : [body];

    const cleaned = rows.map((r: any) => {
      const customer_id = Number(r.customerId ?? r.customer_id);
      const product_id = Number(r.productId ?? r.product_id);
      const unit_price_excl_vat = Number(r.unit_price_excl_vat);

      if (!customer_id || !product_id || Number.isNaN(unit_price_excl_vat)) {
        throw new Error("Invalid row: customerId, productId, unit_price_excl_vat required");
      }

      return {
        customer_id,
        product_id,
        unit_price_excl_vat,
        updated_at: new Date().toISOString(),
      };
    });

    // Upsert using unique constraint (customer_id, product_id)
    const { data, error } = await supabase
      .from("customer_product_prices")
      .upsert(cleaned, { onConflict: "customer_id,product_id" })
      .select("customer_id, product_id, unit_price_excl_vat, updated_at");

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, saved: data || [] });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Pricing save failed" },
      { status: 500 }
    );
  }
}
