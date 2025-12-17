// app/api/credit-notes/by-invoice/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    const invoiceIdStr = req.nextUrl.searchParams.get("invoiceId") || "";
    const invoiceId = Number(invoiceIdStr);

    if (!invoiceId || Number.isNaN(invoiceId)) {
      return NextResponse.json(
        { ok: false, error: "invoiceId is required" },
        { status: 400 }
      );
    }

    // Keep select flexible: works even if some columns are null
    const { data, error } = await supabase
      .from("credit_notes")
      .select("id, credit_note_number, credit_note_date, total_amount, status, invoice_id")
      .eq("invoice_id", invoiceId)
      .order("credit_note_date", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ ok: true, creditNotes: data || [] });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load credit notes" },
      { status: 500 }
    );
  }
}
