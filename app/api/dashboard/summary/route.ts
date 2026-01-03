// app/api/dashboard/summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function toNum(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function GET(_req: NextRequest) {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // invoice_date is stored as YYYY-MM-DD
    const todayStr = today.toISOString().slice(0, 10);
    const monthStartStr = startOfMonth.toISOString().slice(0, 10);

    const [todaySalesRes, monthSalesRes, outstandingRes, productsRes, recentInvoicesRes] =
      await Promise.all([
        // 1) TOTAL SALES TODAY
        supabaseAdmin.from("invoices").select("total_amount").eq("invoice_date", todayStr),

        // 2) TOTAL SALES THIS MONTH
        supabaseAdmin
          .from("invoices")
          .select("total_amount")
          .gte("invoice_date", monthStartStr)
          .lte("invoice_date", todayStr),

        // 3) OUTSTANDING BALANCE
        supabaseAdmin.from("invoices").select("balance_remaining"),

        // 4) LOW STOCK (✅ removed uom)
        supabaseAdmin
          .from("products")
          .select("id, sku, name, current_stock, reorder_level")
          .limit(2000),

        // 5) RECENT INVOICES
        supabaseAdmin
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
          .limit(10),
      ]);

    if (todaySalesRes.error) throw new Error(`today sales: ${todaySalesRes.error.message}`);
    if (monthSalesRes.error) throw new Error(`month sales: ${monthSalesRes.error.message}`);
    if (outstandingRes.error) throw new Error(`outstanding: ${outstandingRes.error.message}`);
    if (productsRes.error) throw new Error(`products: ${productsRes.error.message}`);
    if (recentInvoicesRes.error) throw new Error(`recent invoices: ${recentInvoicesRes.error.message}`);

    const totalSalesToday =
      (todaySalesRes.data || []).reduce((sum: number, r: any) => sum + toNum(r.total_amount), 0) || 0;

    const totalSalesMonth =
      (monthSalesRes.data || []).reduce((sum: number, r: any) => sum + toNum(r.total_amount), 0) || 0;

    const outstanding =
      (outstandingRes.data || []).reduce((sum: number, r: any) => sum + toNum(r.balance_remaining), 0) || 0;

    const lowStock = (productsRes.data || [])
      .map((p: any) => {
        const current = toNum(p.current_stock);
        const reorder = p.reorder_level === null || p.reorder_level === undefined ? null : toNum(p.reorder_level);

        return {
          id: p.id,
          item_code: p.sku || null,
          name: p.name || null,
          qty: current,
          min_qty: reorder,
        };
      })
      .filter((p: any) => p.min_qty !== null && p.min_qty > 0 && p.qty <= p.min_qty)
      .sort((a: any, b: any) => a.qty - b.qty)
      .slice(0, 10);

    return NextResponse.json({
      ok: true,
      totalSalesToday,
      totalSalesMonth,
      outstanding,
      lowStock,
      recentInvoices: recentInvoicesRes.data || [],
    });
  } catch (err: any) {
    console.error("dashboard/summary error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
