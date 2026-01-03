import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !(service || anon)) {
    throw new Error(
      "Missing Supabase env. Need NEXT_PUBLIC_SUPABASE_URL + (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY)"
    );
  }
  return createClient(url, service || anon!);
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ REQUIRED
) {
  try {
    const { id } = await context.params; // ✅ REQUIRED

    const invoiceId = Number(id);
    if (!Number.isFinite(invoiceId) || invoiceId <= 0) {
      return NextResponse.json(
        { ok: false, error: "Invalid invoice id" },
        { status: 400 }
      );
    }

    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = supaAdmin();

    const { data, error } = await supabase
      .from("invoice_payments")
      .select("id, payment_date, amount, method, reference, notes, created_at")
      .eq("invoice_id", invoiceId)
      .order("payment_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, payments: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

