"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
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

function formatYYYYMMDD(v: any) {
  const s = String(v || "");
  // DB stores YYYY-MM-DD already
  return s;
}

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  // FIX HYDRATION:
  // - do NOT read localStorage during render
  const [rpUser, setRpUser] = useState<any>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("rp_user") || "";
      if (!raw) return;
      setRpUser(JSON.parse(raw));
    } catch {
      setRpUser(null);
    }
  }, []);

  const isAdmin = String(rpUser?.role || "").toLowerCase() === "admin";

  async function loadInvoice(): Promise<ApiResponse | null> {
    const id = params.id;
    if (!id) return null;

    try {
      setLoading(true);
      setActionError(null);

      const res = await rpFetch(`/api/invoices/get/${id}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed to load invoice");

      setData(json);
      return json;
    } catch (err: any) {
      setActionError(err.message || "Error loading invoice");
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const invoice = data?.invoice || null;
  const items = Array.isArray(data?.items) ? data!.items : [];

  const customer = invoice?.customers || null;

  const computed = useMemo(() => {
    const subtotal = items.reduce((sum, r) => sum + n2(r.total_qty) * n2(r.unit_price_excl_vat), 0);
    const vatAmount = items.reduce((sum, r) => sum + n2(r.total_qty) * n2(r.unit_vat), 0);
    const total = subtotal + vatAmount;

    const prev = n2(invoice?.previous_balance);
    const paid = n2(invoice?.amount_paid);
    const gross = total + prev;
    const due = Math.max(0, gross - paid);

    return { subtotal, vatAmount, total, prev, paid, gross, due };
  }, [items, invoice]);

  if (loading) {
    return <div style={{ padding: 20, textAlign: "center" }}>Loading invoice…</div>;
  }

  if (!invoice) {
    return <div style={{ padding: 20, color: "#b91c1c" }}>{actionError || "Invoice not found"}</div>;
  }

  const invoiceDateFormatted = formatYYYYMMDD(invoice.invoice_date);

  return (
    <div className="rp-app rp-invoice-page">
      {/* Sidebar (screen only) */}
      <aside className="rp-sidebar print-hidden">
        <div className="rp-sidebar-logo">
          <Image src="/images/logo/logo.png" alt="Ram Pottery Logo" width={34} height={34} />
          <div>
            <div className="rp-sidebar-logo-title">Ram Pottery Ltd</div>
            <div className="rp-sidebar-logo-sub">Online Accounting &amp; Stock Manager</div>
          </div>
        </div>

        <button className="rp-nav-item" onClick={() => router.push("/invoices")} style={{ marginTop: 16 }}>
          ← Back to Invoices
        </button>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 950, letterSpacing: 0.2, marginBottom: 6 }}>Actions</div>

          <button className="rp-nav-item" onClick={() => window.print()} style={{ width: "100%" }}>
            🖨 Print / Reprint
          </button>

          {!isAdmin ? (
            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
              (Admin-only actions hidden)
            </div>
          ) : null}
        </div>
      </aside>

      {/* Main: Locked RamPotteryDoc print layout */}
      <main className="rp-page-main rp-invoice-main">
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
          company={{ brn: null, vat_no: null }}
          items={items.map((r, idx) => {
            const uom = (r.uom ?? "BOX") === "PCS" ? "PCS" : "BOX";
            const box_qty = uom === "BOX" ? n2(r.box_qty) : 0;
            const pcs_qty = uom === "PCS" ? n2(r.pcs_qty ?? r.box_qty) : 0;

            const units_per_box = uom === "BOX" ? n2(r.units_per_box) : 1;
            const total_qty = n2(r.total_qty);

            const unit_price_excl_vat = n2(r.unit_price_excl_vat);
            const unit_vat = n2(r.unit_vat);
            const unit_price_incl_vat = n2((r.unit_price_incl_vat ?? unit_price_excl_vat + unit_vat) || 0);
            const line_total = n2((r.line_total ?? unit_price_incl_vat * total_qty) || 0);

            return {
              sn: idx + 1,
              item_code: r.products?.item_code || "",
              uom,
              box_qty,
              pcs_qty,
              units_per_box,
              total_qty,
              description: r.products?.name || "",
              unit_price_excl_vat,
              unit_vat,
              unit_price_incl_vat,
              line_total,
            };
          })}
          totals={{
            subtotal: computed.subtotal,
            vatPercentLabel: "VAT 15%",
            vat_amount: computed.vatAmount,
            total_amount: computed.total,
            previous_balance: computed.prev,
            amount_paid: computed.paid,
            balance_remaining: computed.due,
          }}
          preparedBy={null}
          deliveredBy={null}
        />
      </main>
    </div>
  );
}
