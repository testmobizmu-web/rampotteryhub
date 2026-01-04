// app/api/credit-notes/get/[id]/route.ts
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

function isNumericId(s: string) {
  return /^[0-9]+$/.test(s);
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const raw = String(id || "").trim();
    if (!raw) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const supabase = supaAdmin();
    const numeric = isNumericId(raw);

    // ✅ Build query -> apply eq -> then maybeSingle()
    let cnQ = supabase
      .from("credit_notes")
      .select(`
        id,
        credit_note_number,
        credit_note_date,
        customer_id,
        invoice_id,
        reason,
        subtotal,
        vat_amount,
        total_amount,
        status,
        created_at,
        customers:customer_id (
          id,
          name,
          phone,
          email,
          address,
          opening_balance,
          client,
          customer_code
        )
      `);

    cnQ = numeric ? cnQ.eq("id", Number(raw)) : cnQ.eq("credit_note_number", raw);

    const { data: creditNote, error: cnErr } = await cnQ.maybeSingle();

    if (cnErr) return NextResponse.json({ ok: false, error: cnErr.message }, { status: 500 });
    if (!creditNote) return NextResponse.json({ ok: false, error: "Credit note not found" }, { status: 404 });

    // ✅ Always use REAL numeric id for items
    const cnId = creditNote.id;

    const { data: items, error: itErr } = await supabase
      .from("credit_note_items")
      .select(`
        id,
        product_id,
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
      .eq("credit_note_id", cnId)
      .order("id", { ascending: true });

    if (itErr) return NextResponse.json({ ok: false, error: itErr.message }, { status: 500 });

    return NextResponse.json({
      ok: true,
      credit_note: creditNote,
      items: items || [],
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
  }
}
