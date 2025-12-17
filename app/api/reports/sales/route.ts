// app/api/reports/sales/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function parseYmd(s: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(s + "T00:00:00.000Z");
  if (Number.isNaN(d.getTime())) return null;
  return s;
}

function monthRange(month: string) {
  const [yStr, mStr] = month.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  if (!y || !m || m < 1 || m > 12) return null;

  const from = new Date(Date.UTC(y, m - 1, 1));
  const to = new Date(Date.UTC(y, m, 1)); // exclusive
  return {
    fromStr: from.toISOString().slice(0, 10),
    toStr: to.toISOString().slice(0, 10),
  };
}

function isPaid(status: any) {
  return String(status || "").trim().toUpperCase() === "PAID";
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;

    // Optional filters
    const customerIdQ = sp.get("customerId");
    const salesRepQ = (sp.get("salesRep") || "").trim();

    const customerId =
      customerIdQ && /^\d+$/.test(customerIdQ) ? Number(customerIdQ) : null;
    const salesRep = salesRepQ ? salesRepQ : null;

    // Date range
    const fromQ = sp.get("from");
    const toQ = sp.get("to");

    let fromStr: string | null = null;
    let toStr: string | null = null;

    if (fromQ && toQ) {
      fromStr = parseYmd(fromQ);
      toStr = parseYmd(toQ);
      if (!fromStr || !toStr) {
        return NextResponse.json(
          { ok: false, error: "Invalid from/to. Expected YYYY-MM-DD" },
          { status: 400 }
        );
      }
    } else {
      const month = sp.get("month") || "";
      const range = monthRange(month);
      if (!range) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Provide month=YYYY-MM OR from=YYYY-MM-DD&to=YYYY-MM-DD",
          },
          { status: 400 }
        );
      }
      fromStr = range.fromStr;
      toStr = range.toStr;
    }

    // Fetch invoices in range
    let q = supabase
      .from("invoices")
      .select(
        `
        id,
        invoice_number,
        invoice_date,
        customer_id,
        subtotal,
        total_amount,
        sales_rep,
        status,
        customers ( name )
      `
      )
      .gte("invoice_date", fromStr)
      .lt("invoice_date", toStr);

    if (customerId) q = q.eq("customer_id", customerId);
    if (salesRep) q = q.eq("sales_rep", salesRep);

    const { data, error } = await q;

    if (error) throw error;

    const invoicesAll =
      (data || []).map((r: any) => ({
        id: Number(r.id),
        invoice_number: r.invoice_number,
        invoice_date: r.invoice_date,
        customer_id: Number(r.customer_id),
        customer_name: r.customers?.name ?? null,
        subtotal: Number(r.subtotal || 0), // excl VAT
        total_amount: Number(r.total_amount || 0), // incl VAT
        sales_rep: (r.sales_rep || "—").trim(),
        status: r.status ?? null,
      })) || [];

    const invoicesPaid = invoicesAll.filter((r) => isPaid(r.status));

    // Aggregates BY CUSTOMER (based on ALL invoices - useful dashboard)
    const byCustomerMap = new Map<
      number,
      {
        customer_id: number;
        customer_name: string | null;
        invoice_count: number;
        total_sales: number;
        subtotal_excl_vat: number;
      }
    >();

    for (const r of invoicesAll) {
      const key = r.customer_id;
      const cur = byCustomerMap.get(key) || {
        customer_id: key,
        customer_name: r.customer_name,
        invoice_count: 0,
        total_sales: 0,
        subtotal_excl_vat: 0,
      };
      cur.invoice_count += 1;
      cur.total_sales += r.total_amount;
      cur.subtotal_excl_vat += r.subtotal;
      byCustomerMap.set(key, cur);
    }

    const byCustomer = Array.from(byCustomerMap.values())
      .map((x) => ({
        customer_id: x.customer_id,
        customer_name: x.customer_name,
        invoice_count: x.invoice_count,
        total_sales: +x.total_sales.toFixed(2),
        subtotal_excl_vat: +x.subtotal_excl_vat.toFixed(2),
      }))
      .sort((a, b) => b.total_sales - a.total_sales);

    // Aggregates BY SALES REP (ALL)
    const byRepMapAll = new Map<
      string,
      {
        sales_rep: string;
        invoice_count: number;
        total_sales: number;
        subtotal_excl_vat: number;
      }
    >();

    for (const r of invoicesAll) {
      const rep = r.sales_rep || "—";
      const cur = byRepMapAll.get(rep) || {
        sales_rep: rep,
        invoice_count: 0,
        total_sales: 0,
        subtotal_excl_vat: 0,
      };
      cur.invoice_count += 1;
      cur.total_sales += r.total_amount;
      cur.subtotal_excl_vat += r.subtotal;
      byRepMapAll.set(rep, cur);
    }

    const bySalesRepAll = Array.from(byRepMapAll.values())
      .map((x) => ({
        sales_rep: x.sales_rep,
        invoice_count: x.invoice_count,
        total_sales: +x.total_sales.toFixed(2),
        subtotal_excl_vat: +x.subtotal_excl_vat.toFixed(2),
      }))
      .sort((a, b) => b.total_sales - a.total_sales);

    // Aggregates BY SALES REP (PAID only)
    const byRepMapPaid = new Map<
      string,
      {
        sales_rep: string;
        invoice_count: number;
        total_sales: number;
        subtotal_excl_vat: number;
      }
    >();

    for (const r of invoicesPaid) {
      const rep = r.sales_rep || "—";
      const cur = byRepMapPaid.get(rep) || {
        sales_rep: rep,
        invoice_count: 0,
        total_sales: 0,
        subtotal_excl_vat: 0,
      };
      cur.invoice_count += 1;
      cur.total_sales += r.total_amount;
      cur.subtotal_excl_vat += r.subtotal;
      byRepMapPaid.set(rep, cur);
    }

    const bySalesRepPaid = Array.from(byRepMapPaid.values())
      .map((x) => ({
        sales_rep: x.sales_rep,
        invoice_count: x.invoice_count,
        total_sales: +x.total_sales.toFixed(2),
        subtotal_excl_vat: +x.subtotal_excl_vat.toFixed(2),
      }))
      .sort((a, b) => b.total_sales - a.total_sales);

    // Totals (ALL vs PAID)
    const subtotalExclVatAll = +invoicesAll
      .reduce((s, r) => s + r.subtotal, 0)
      .toFixed(2);

    const totalSalesAll = +invoicesAll
      .reduce((s, r) => s + r.total_amount, 0)
      .toFixed(2);

    const subtotalExclVatPaid = +invoicesPaid
      .reduce((s, r) => s + r.subtotal, 0)
      .toFixed(2);

    const totalSalesPaid = +invoicesPaid
      .reduce((s, r) => s + r.total_amount, 0)
      .toFixed(2);

    const report = {
      period: { from: fromStr, toExclusive: toStr },
      filters: { customerId, salesRep },
      totals: {
        invoiceCountAll: invoicesAll.length,
        subtotalExclVatAll,
        totalSalesAll,

        invoiceCountPaid: invoicesPaid.length,
        subtotalExclVatPaid, // ✅ COMMISSION BASE
        totalSalesPaid,
      },
      byCustomer,
      bySalesRepAll,
      bySalesRepPaid,
      invoicesAll,
      invoicesPaid, // ✅ commission invoice list
    };

    return NextResponse.json({ ok: true, report });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to build sales report" },
      { status: 500 }
    );
  }
}


