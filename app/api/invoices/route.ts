// app/api/invoices/route.ts
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
  return createClient(url, service || anon!, { auth: { persistSession: false } });
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const supabase = supaAdmin();

    const { data, error } = await supabase
      .from("invoices")
      .select(
        `
        id,
        invoice_number,
        invoice_date,

        total_amount,
        amount_paid,
        balance_due,
        balance_remaining,

        discount_percent,
        discount_amount,

        status,
        customers ( name, customer_code )
      `
      )
      .order("id", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ ok: true, invoices: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load invoices" },
      { status: 500 }
    );
  }
}

