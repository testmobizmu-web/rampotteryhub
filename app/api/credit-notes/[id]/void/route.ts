import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !(service || anon)) {
    throw new Error("Missing Supabase env");
  }
  return createClient(url, service || anon!);
}

function n2(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const creditNoteId = Number(id);

    if (!Number.isFinite(creditNoteId) || creditNoteId <= 0) {
      return NextResponse.json(
        { ok: false, error: "Invalid credit note id" },
        { status: 400 }
      );
    }

    // 🔐 Permission check (admin only recommended)
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user || String(user.role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const supabase = supaAdmin();

    // 1) Load credit note
    const { data: cn, error: cnErr } = await supabase
      .from("credit_notes")
      .select(
        "id, credit_note_number, status, stock_reversed_at"
      )
      .eq("id", creditNoteId)
      .single();

    if (cnErr || !cn) {
      return NextResponse.json(
        { ok: false, error: "Credit note not found" },
        { status: 404 }
      );
    }

    if (String(cn.status).toUpperCase() === "VOID") {
      return NextResponse.json({ ok: true, alreadyVoid: true });
    }

    // 2) Reverse stock ONLY ONCE
    if (!cn.stock_reversed_at) {
      const { data: items, error: itErr } = await supabase
        .from("credit_note_items")
        .select("product_id, total_qty")
        .eq("credit_note_id", creditNoteId);

      if (itErr) throw itErr;

      const movements = (items || [])
        .map((it: any) => {
          const pid = Number(it.product_id);
          const qty = n2(it.total_qty);
          if (!pid || qty <= 0) return null;

          return {
            product_id: pid,
            movement_type: "OUT",
            quantity: qty,
            reference: cn.credit_note_number,
            source_table: "credit_notes",
            source_id: creditNoteId,
            notes: "Credit note VOID – stock reversed",
          };
        })
        .filter(Boolean);

      if (movements.length) {
        const { error: mvErr } = await supabase
          .from("stock_movements")
          .insert(movements);

        if (mvErr) throw mvErr;

        // OPTIONAL: decrement live product stock via RPC
        for (const m of movements as any[]) {
          await supabase.rpc("decrement_product_stock", {
            p_product_id: m.product_id,
            p_qty: m.quantity,
          });
        }
      }
    }

    // 3) Update credit note status + lock reversal
    const { error: updErr } = await supabase
      .from("credit_notes")
      .update({
        status: "VOID",
        stock_reversed_at: new Date().toISOString(),
      })
      .eq("id", creditNoteId);

    if (updErr) throw updErr;

    return NextResponse.json({
      ok: true,
      creditNoteId,
      status: "VOID",
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to void credit note" },
      { status: 500 }
    );
  }
}
