// app/api/reports/vat/route.ts
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

    let q = supabase
      .from("invoices")
      .select(
        `
        id,
        invoice_number,
        invoice_date,
        customer_id,
        sales_rep,
        subtotal,
        vat_amount,
        total_amount,
        status,
        customers ( name )
      `
      )
      .gte("invoice_date", fromStr)
      .lt("invoice_date", toStr)
      .order("invoice_date", { ascending: true });

    if (customerId) q = q.eq("customer_id", customerId);
    if (salesRep) q = q.eq("sales_rep", salesRep);

    const { data, error } = await q;

    if (error) throw error;

    const invoices =
      (data || []).map((r: any) => ({
        id: Number(r.id),
        invoice_number: r.invoice_number,
        invoice_date: r.invoice_date,
        customer_id: Number(r.customer_id),
        sales_rep: (r.sales_rep || "—").trim(),
        customer_name: r.customers?.name ?? null,
        subtotal: Number(r.subtotal || 0),
        vat_amount: Number(r.vat_amount || 0),
        total_amount: Number(r.total_amount || 0),
        status: r.status ?? null,
      })) || [];

    const totals = invoices.reduce(
      (acc: any, r: any) => {
        acc.subtotal += r.subtotal;
        acc.vat += r.vat_amount;
        acc.total += r.total_amount;
        acc.invoiceCount += 1;
        return acc;
      },
      { subtotal: 0, vat: 0, total: 0, invoiceCount: 0 }
    );

    const report = {
      period: { from: fromStr, toExclusive: toStr },
      filters: { customerId, salesRep },
      totals: {
        subtotal: +totals.subtotal.toFixed(2),
        vat: +totals.vat.toFixed(2),
        total: +totals.total.toFixed(2),
        invoiceCount: totals.invoiceCount,
      },
      invoices,
    };

    return NextResponse.json({ ok: true, report });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to build VAT report" },
      { status: 500 }
    );
  }
}
