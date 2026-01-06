"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import RamPotteryDoc from "@/components/RamPotteryDoc";
import { rpFetch } from "@/lib/rpFetch";

function n2(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

type ApiResponse = {
  ok: boolean;
  error?: string;
  invoice?: any;
  items?: any[];
};

function formatDDMMYYYY(v: any) {
  const s = String(v || "").trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return s;
}

// ✅ Put your company BRN / VAT here (so it always shows)
const COMPANY_BRN = "I25005130";
const COMPANY_VAT = ""; // put VAT no if you have

export default function InvoicePrintPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const autoprint = search.get("autoprint") === "1";

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const id = String(params?.id || "");

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setLoading(true);
        setErr(null);

        const res = await rpFetch(`/api/invoices/get/${encodeURIComponent(id)}`, { cache: "no-store" });
        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed to load invoice");

        if (!alive) return;
        setData(json);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Error");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    if (id) run();
    return () => {
      alive = false;
    };
  }, [id]);

  const invoice = data?.invoice || null;
  const items = Array.isArray(data?.items) ? data!.items : [];
  const customer = invoice?.customers || null;

  const computed = useMemo(() => {
    const subtotal = items.reduce((sum, r) => sum + n2(r.total_qty) * n2(r.unit_price_excl_vat), 0);
    const vatAmount = items.reduce((sum, r) => sum + n2(r.total_qty) * n2(r.unit_vat), 0);
    const total = subtotal + vatAmount;

    const prev = n2(invoice?.previous_balance);
    const paid = n2(invoice?.amount_paid);
    const gross = (invoice?.gross_total != null ? n2(invoice?.gross_total) : total + prev);
    const due = Math.max(0, gross - paid);

    return { subtotal, vatAmount, total, prev, paid, gross, due };
  }, [items, invoice]);

  useEffect(() => {
    if (!autoprint) return;
    if (loading) return;
    if (!invoice) return;

    const t = window.setTimeout(() => window.print(), 250);
    return () => window.clearTimeout(t);
  }, [autoprint, loading, invoice]);

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (err || !invoice) return <div style={{ padding: 16, color: "#b91c1c" }}>{err || "Not found"}</div>;

  const invoiceDateFormatted = formatDDMMYYYY(invoice.invoice_date);

  return (
    <div>
      {/* Screen-only small action bar */}
      <div className="print-hidden" style={{ padding: 12, display: "flex", gap: 10 }}>
        <button onClick={() => window.print()} style={{ padding: "10px 12px", cursor: "pointer" }}>
          🖨 Print
        </button>
        <button onClick={() => window.close()} style={{ padding: "10px 12px", cursor: "pointer" }}>
          Close
        </button>
      </div>

      <RamPotteryDoc
        variant="INVOICE"
        tableHeaderRightTitle="VAT INVOICE"
        docNoLabel="INVOICE NO:"
        docNoValue={invoice.invoice_number}
        dateLabel="DATE:"
        dateValue={invoiceDateFormatted}
        purchaseOrderLabel="PURCHASE ORDER NO:"
        purchaseOrderValue={invoice.purchase_order_no || ""}
        salesRepName={invoice.sales_rep || ""}
        salesRepPhone={invoice.sales_rep_phone || ""}
        customer={{
          customer_code: customer?.customer_code,
          name: customer?.name,
          address: customer?.address,
          phone: customer?.phone,
          brn: customer?.brn,
          vat_no: customer?.vat_no,
        }}
        company={{ brn: COMPANY_BRN, vat_no: COMPANY_VAT }}
        items={items.map((r, idx) => {
          const uom = (r.uom ?? "BOX") === "PCS" ? "PCS" : "BOX";

          return {
            sn: idx + 1,
            item_code: r.products?.item_code || "",
            uom,
            box_qty: n2(r.box_qty),
            units_per_box: n2(r.units_per_box),
            total_qty: n2(r.total_qty),
            description: r.description || r.products?.name || "",
            unit_price_excl_vat: n2(r.unit_price_excl_vat),
            unit_vat: n2(r.unit_vat),
            unit_price_incl_vat: n2(r.unit_price_incl_vat),
            line_total: n2(r.line_total),
          };
        })}
        totals={{
          subtotal: computed.subtotal,
          vatPercentLabel: `VAT ${invoice.vat_percent ?? 15}%`,
          vat_amount: computed.vatAmount,
          total_amount: computed.total,
          previous_balance: computed.prev,
          amount_paid: computed.paid,
          balance_remaining: computed.due,
        }}
      />

      <style jsx global>{`
        @media print {
          .print-hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}


