import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    // Get latest invoices with customer name
    const { data, error } = await supabase
      .from("invoices")
      .select(
        `
        id,
        invoice_number,
        invoice_date,
        total_amount,
        status,
        customers ( name )
      `
      )
      .order("invoice_date", { ascending: false });

    if (error) throw error;

    const invoices =
      data?.map((row: any) => ({
        id: row.id,
        invoice_number: row.invoice_number,
        invoice_date: row.invoice_date,
        total_amount: row.total_amount ?? 0,
        status: row.status,
        customer_name: row.customers?.name ?? "",
      })) ?? [];

    return NextResponse.json({ invoices });
  } catch (err: any) {
    console.error("Error loading invoices list:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to load invoices list" },
      { status: 500 }
    );
  }
}
