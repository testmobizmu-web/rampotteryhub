// app/api/credit-notes/route.ts
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

export async function GET(req: NextRequest) {
  try {
    // 🔐 Protected route: requires rpFetch() header
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const supabase = supaAdmin();

    const { data, error } = await supabase
      .from("credit_notes")
      .select(
        `
        id,
        credit_note_number,
        credit_note_date,
        total_amount,
        status,
        customers ( name, customer_code )
      `
      )
      .order("id", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ ok: true, creditNotes: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load credit notes" },
      { status: 500 }
    );
  }
}
