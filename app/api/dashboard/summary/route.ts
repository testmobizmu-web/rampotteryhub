// app/api/dashboard/summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(_req: NextRequest) {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayStr = today.toISOString().slice(0, 10);
    const monthStartStr = startOfMonth.toISOString().slice(0, 10);

    // -----------------------------
    // 1) TOTAL SALES TODAY
    // -----------------------------
    const { data: todaySalesData } = await supabase
      .from("invoices")
      .select("total_amount, invoice_date")
      .gte("invoice_date", todayStr)
      .lte("invoice_date", todayStr);

    const totalSalesToday =
      todaySalesData?.reduce(
        (sum, row: any) => sum + (row.total_amount || 0),
        0
      ) || 0;

    // -----------------------------
    // 2) TOTAL SALES THIS MONTH
    // -----------------------------
    const { data: monthSalesData } = await supabase
      .from("invoices")
      .select("total_amount, invoice_date")
      .gte("invoice_date", monthStartStr)
      .lte("invoice_date", todayStr);

    const totalSalesMonth =
      monthSalesData?.reduce(
        (sum, row: any) => sum + (row.total_amount || 0),
        0
      ) || 0;

    // -----------------------------
    // 3) OUTSTANDING BALANCE
    // -----------------------------
    const { data: outstandingData } = await supabase
      .from("invoices")
      .select("balance_remaining");

    const outstanding =
      outstandingData?.reduce(
        (sum, row: any) => sum + (row.balance_remaining || 0),
        0
      ) || 0;

    // -----------------------------
    // 4) LOW STOCK PRODUCTS
    // -----------------------------
    const { data: lowStock } = await supabase
      .from("products")
      .select("id, sku, name, current_stock, reorder_level")
      .not("reorder_level", "is", null)
      .lte("current_stock", "reorder_level")
      .order("current_stock", { ascending: true })
      .limit(10);

    // -----------------------------
    // 5) RECENT INVOICES (LAST 10)
    // -----------------------------
    const { data: recentInvoices } = await supabase
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
      .order("invoice_date", { ascending: false })
      .limit(10);

    // -----------------------------
    // 6) SALES BY MONTH (LAST 6 MONTHS)
    // -----------------------------
    const sixMonthsAgo = new Date(
      today.getFullYear(),
      today.getMonth() - 5,
      1
    );
    const sixMonthsAgoStr = sixMonthsAgo.toISOString().slice(0, 10);

    const { data: salesByMonth } = await supabase
      .from("invoices")
      .select("total_amount, invoice_date")
      .gte("invoice_date", sixMonthsAgoStr);

    const monthlyTotals: Record<string, number> = {};
    salesByMonth?.forEach((row: any) => {
      const d = new Date(row.invoice_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      monthlyTotals[key] = (monthlyTotals[key] || 0) + (row.total_amount || 0);
    });

    const monthlyLabels = Object.keys(monthlyTotals).sort();
    const monthlyValues = monthlyLabels.map((k) => monthlyTotals[k]);

    // -----------------------------
    // 7) SALES BY CUSTOMER (TOP 5)
    // -----------------------------
    const { data: salesByCustomer } = await supabase
      .from("invoices")
      .select(
        `
        total_amount,
        customers ( name )
      `
      );

    const customerTotals: Record<string, number> = {};
    salesByCustomer?.forEach((row: any) => {
      const name = row.customers?.name || "Unknown";
      customerTotals[name] = (customerTotals[name] || 0) + (row.total_amount || 0);
    });

    const customerEntries = Object.entries(customerTotals).sort(
      (a, b) => b[1] - a[1]
    );
    const topCustomerEntries = customerEntries.slice(0, 5);
    const customerLabels = topCustomerEntries.map(([name]) => name);
    const customerValues = topCustomerEntries.map(([, total]) => total);

    // -----------------------------
    // 8) CREDIT / DEBIT NOTES (THIS MONTH)
    //     ASSUMPTION: tables rp_credit_notes, rp_debit_notes
    //     with columns: amount (numeric), date (date)
    // -----------------------------
    const { data: creditRows } = await supabase
      .from("rp_credit_notes")
      .select("amount, date")
      .gte("date", monthStartStr)
      .lte("date", todayStr);

    const { data: debitRows } = await supabase
      .from("rp_debit_notes")
      .select("amount, date")
      .gte("date", monthStartStr)
      .lte("date", todayStr);

    const creditNotesTotal =
      creditRows?.reduce((sum, r: any) => sum + (r.amount ?? 0), 0) ?? 0;
    const debitNotesTotal =
      debitRows?.reduce((sum, r: any) => sum + (r.amount ?? 0), 0) ?? 0;

    // -----------------------------
    // RESPONSE
    // -----------------------------
    return NextResponse.json({
      totalSalesToday,
      totalSalesMonth,
      outstanding,
      lowStock: lowStock || [],
      recentInvoices: recentInvoices || [],
      monthlyLabels,
      monthlyValues,
      customerLabels,
      customerValues,
      creditNotesTotal,
      debitNotesTotal,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message || "Failed to load dashboard" },
      { status: 500 }
    );
  }
}

