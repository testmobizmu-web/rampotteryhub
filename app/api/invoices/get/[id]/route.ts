// app/api/invoices/get/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

export const runtime = "nodejs";

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !(service || anon)) throw new Error("Missing Supabase env");

  return createClient(url, service || anon!, {
    auth: { persistSession: false },
  });
}

function isNumericId(s: string) {
  return /^[0-9]+$/.test(s);
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const raw = String(id || "").trim();
    if (!raw) {
      return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    }

    const supabase = supaAdmin();
    const numeric = isNumericId(raw);

    // ✅ Build query FIRST
    let invQ = supabase
      .from("invoices")
      .select(`
        id,
        invoice_number,
        invoice_date,
        customer_id,
        subtotal,
        vat_amount,
        total_amount,
        status,
        created_at,
        amount_paid,
        balance_remaining,
        customers:customer_id (
          id,
          name,
          phone,
          email,
          address,
          customer_code,
          client
        )
      `);

    // ✅ Apply filter BEFORE maybeSingle()
    invQ = numeric
      ? invQ.eq("id", Number(raw))
      : invQ.eq("invoice_number", raw);

    // ✅ Finalize
    const { data: invoice, error: invErr } = await invQ.maybeSingle();

    if (invErr) {
      return NextResponse.json({ ok: false, error: invErr.message }, { status: 500 });
    }

    if (!invoice) {
      return NextResponse.json({ ok: false, error: "Invoice not found" }, { status: 404 });
    }

    // ✅ Always use REAL numeric invoice.id
    const invId = invoice.id;

    const { data: items, error: itErr } = await supabase
      .from("invoice_items")
      .select(`
        id,
        product_id,
        box_qty,
        total_qty,
        unit_price_excl_vat,
        unit_vat,
        unit_price_incl_vat,
        line_total,
        products:product_id (
          id,
          item_code,
          sku,
          name
        )
      `)
      .eq("invoice_id", invId)
      .order("id", { ascending: true });

    if (itErr) {
      return NextResponse.json({ ok: false, error: itErr.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      invoice,
      items: items || [],
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

