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

function formatDDMMYYYY(v: any) {
  const s = String(v || "").trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return s;
}

async function waitForImages() {
  const imgs = Array.from(document.images || []);
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) return resolve();
          img.onload = () => resolve();
          img.onerror = () => resolve();
        })
    )
  );
}

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  const [printing, setPrinting] = useState(false);

  // do NOT read localStorage during render (hydration safe)
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
    const id = params?.id;
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
      setActionError(err?.message || "Error loading invoice");
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  useEffect(() => {
    const onAfterPrint = () => setPrinting(false);
    window.addEventListener("afterprint", onAfterPrint);
    return () => window.removeEventListener("afterprint", onAfterPrint);
  }, []);

  async function handlePrint() {
    try {
      setPrinting(true);

      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      await waitForImages();

      setTimeout(() => window.print(), 80);
    } catch {
      try {
        window.print();
      } finally {
        setTimeout(() => setPrinting(false), 600);
      }
    }
  }

  const invoice = data?.invoice || null;
  const items = Array.isArray(data?.items) ? data!.items : [];
  const customer = invoice?.customers || null;

  // ✅ snapshot totals from invoices table (audit-proof)
  const computed = useMemo(() => {
    const subtotal = n2(invoice?.subtotal);
    const vatAmount = n2(invoice?.vat_amount);
    const total = n2(invoice?.total_amount);

    const prev = n2(invoice?.previous_balance);
    const paid = n2(invoice?.amount_paid);

    const gross = invoice?.gross_total != null ? n2(invoice?.gross_total) : n2(total + prev);

    const balanceFromDb =
      invoice?.balance_remaining != null
        ? n2(invoice?.balance_remaining)
        : invoice?.balance_due != null
        ? n2(invoice?.balance_due)
        : Math.max(0, gross - paid);

    // ✅ discount snapshot from invoice row
    const discountPercent = n2(invoice?.discount_percent);
    const discountAmount = n2(invoice?.discount_amount);

    return {
      subtotal,
      vatAmount,
      total,
      prev,
      paid,
      gross,
      due: balanceFromDb,
      discountPercent,
      discountAmount,
    };
  }, [invoice]);

  if (loading) {
    return <div style={{ padding: 20, textAlign: "center" }}>Loading invoice…</div>;
  }

  if (!invoice) {
    return <div style={{ padding: 20, color: "#b91c1c" }}>{actionError || "Invoice not found"}</div>;
  }

  const invoiceDateFormatted = formatDDMMYYYY(invoice.invoice_date);

  const companyBrn = (process.env.NEXT_PUBLIC_COMPANY_BRN || "").trim() || null;
  const companyVat = (process.env.NEXT_PUBLIC_COMPANY_VAT || "").trim() || null;

  const vatPercent = invoice?.vat_percent != null ? n2(invoice.vat_percent) : 15;

  const salesRepName = String(invoice?.sales_rep || "").trim();
  const salesRepPhone = String(invoice?.sales_rep_phone || "").trim();

  return (
    <div className={`rp-inv-shell ${printing ? "is-printing" : ""}`}>
      {/* Print overlay */}
      {printing ? (
        <div
          className="print-hidden"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.38)",
            display: "grid",
            placeItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 18,
              borderRadius: 14,
              width: 340,
              boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
              textAlign: "center",
              fontWeight: 900,
            }}
          >
            Preparing print…
            <div style={{ marginTop: 8, fontSize: 12, fontWeight: 650, opacity: 0.75 }}>
              If the dialog doesn’t appear, press Ctrl+P.
            </div>
          </div>
        </div>
      ) : null}

      {/* Premium top bar */}
      <header className="rp-inv-topbar print-hidden">
        <div className="rp-inv-brand" onClick={() => router.push("/invoices")} role="button" tabIndex={0}>
          <Image src="/images/logo/logo.png" alt="Ram Pottery Logo" width={34} height={34} />
          <div className="rp-inv-brand-text">
            <div className="t1">Ram Pottery Ltd</div>
            <div className="t2">Invoice Reprint</div>
          </div>
        </div>

        <div className="rp-inv-actions">
          <button className="rp-btn" onClick={() => router.push("/invoices")}>
            ← Back
          </button>
          <button className="rp-btn rp-btn-primary" onClick={handlePrint}>
            🖨 Print / Reprint
          </button>
        </div>
      </header>

      <div className="rp-inv-body">
        {/* Left panel */}
        <aside className="rp-inv-panel print-hidden">
          <div className="rp-inv-card">
            <div className="rp-inv-card-title">Invoice</div>

            <div className="rp-kv">
              <div className="k">Invoice No</div>
              <div className="v">{invoice.invoice_number}</div>
            </div>
            <div className="rp-kv">
              <div className="k">Date</div>
              <div className="v">{invoiceDateFormatted}</div>
            </div>
            <div className="rp-kv">
              <div className="k">Status</div>
              <div className="v">{String(invoice.status || "").toUpperCase()}</div>
            </div>

            <div className="rp-sep" />

            <div className="rp-inv-card-title">Customer</div>
            <div className="rp-kv">
              <div className="k">Name</div>
              <div className="v">{customer?.name || "-"}</div>
            </div>
            <div className="rp-kv">
              <div className="k">Phone</div>
              <div className="v">{customer?.phone || "-"}</div>
            </div>
            <div className="rp-kv">
              <div className="k">Code</div>
              <div className="v">{customer?.customer_code || "-"}</div>
            </div>

            <div className="rp-sep" />

            <div className="rp-inv-card-title">Sales Rep</div>
            <div className="rp-kv">
              <div className="k">Name</div>
              <div className="v">{salesRepName || "-"}</div>
            </div>
            <div className="rp-kv">
              <div className="k">Phone</div>
              <div className="v">{salesRepPhone || "-"}</div>
            </div>

            <div className="rp-sep" />

            <div className="rp-inv-card-title">Company</div>
            <div className="rp-kv">
              <div className="k">BRN</div>
              <div className="v">{companyBrn || "-"}</div>
            </div>
            <div className="rp-kv">
              <div className="k">VAT</div>
              <div className="v">{companyVat || "-"}</div>
            </div>

            <div className="rp-sep" />

            <div className="rp-inv-card-title">Totals</div>
            <div className="rp-kv">
              <div className="k">Gross Total</div>
              <div className="v">{computed.gross.toFixed(2)}</div>
            </div>
            <div className="rp-kv">
              <div className="k">Paid</div>
              <div className="v">{computed.paid.toFixed(2)}</div>
            </div>
            <div className="rp-kv">
              <div className="k">Balance</div>
              <div className="v">{computed.due.toFixed(2)}</div>
            </div>

            {!isAdmin ? <div className="rp-hint">(Admin-only actions hidden)</div> : null}
          </div>
        </aside>

        {/* Document preview */}
        <main className="rp-inv-preview">
          <div className="rp-inv-paperwrap">
            <RamPotteryDoc
              variant="INVOICE"
              tableHeaderRightTitle="VAT INVOICE"
              docNoLabel="INVOICE NO:"
              docNoValue={invoice.invoice_number}
              dateLabel="DATE:"
              dateValue={invoiceDateFormatted}
              purchaseOrderLabel="PURCHASE ORDER NO:"
              purchaseOrderValue={invoice.purchase_order_no || ""}

              salesRepName={salesRepName}
              salesRepPhone={salesRepPhone}
              customer={{
                customer_code: customer?.customer_code,
                name: customer?.name,
                address: customer?.address,
                phone: customer?.phone,
                brn: "",
                vat_no: "",
              }}
              company={{
                brn: companyBrn,
                vat_no: companyVat,
              }}
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
                  description: r.description || r.products?.name || "",
                  unit_price_excl_vat,
                  unit_vat,
                  unit_price_incl_vat,
                  line_total,
                };
              })}
              totals={{
                subtotal: computed.subtotal,
                vatPercentLabel: `VAT ${vatPercent.toFixed(0)}%`,
                vat_amount: computed.vatAmount,

                // ✅ these are already AFTER discount (as stored)
                total_amount: computed.total,

                // ✅ snapshot discount lines (audit-proof)
                discount_percent: computed.discountPercent,
                discount_amount: computed.discountAmount,

                previous_balance: computed.prev,
                amount_paid: computed.paid,
                balance_remaining: computed.due,
              }}
              preparedBy={null}
              deliveredBy={null}
            />
          </div>
        </main>
      </div>

      <style jsx global>{`
        .rp-inv-shell {
          min-height: 100vh;
          background: #0b1220;
          color: #e5e7eb;
        }

        .rp-inv-topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          background: rgba(10, 15, 28, 0.78);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .rp-inv-brand {
          display: flex;
          gap: 10px;
          align-items: center;
          cursor: pointer;
          user-select: none;
        }
        .rp-inv-brand-text .t1 {
          font-weight: 950;
          letter-spacing: 0.2px;
        }
        .rp-inv-brand-text .t2 {
          font-size: 12px;
          opacity: 0.78;
          margin-top: 2px;
        }

        .rp-inv-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .rp-btn {
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
          padding: 10px 12px;
          border-radius: 12px;
          font-weight: 850;
          cursor: pointer;
        }
        .rp-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .rp-btn-primary {
          border-color: rgba(239, 68, 68, 0.55);
          background: rgba(239, 68, 68, 0.18);
        }
        .rp-btn-primary:hover {
          background: rgba(239, 68, 68, 0.28);
        }

        .rp-inv-body {
          display: grid;
          grid-template-columns: 330px 1fr;
          gap: 16px;
          padding: 16px;
        }
        @media (max-width: 980px) {
          .rp-inv-body {
            grid-template-columns: 1fr;
          }
        }

        .rp-inv-panel .rp-inv-card {
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          border-radius: 18px;
          padding: 14px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
        }
        .rp-inv-card-title {
          font-weight: 950;
          letter-spacing: 0.2px;
          margin-bottom: 10px;
        }
        .rp-kv {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 0;
        }
        .rp-kv .k {
          font-size: 12px;
          opacity: 0.72;
        }
        .rp-kv .v {
          font-weight: 900;
          text-align: right;
        }
        .rp-sep {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 10px 0;
        }
        .rp-hint {
          margin-top: 10px;
          font-size: 12px;
          opacity: 0.7;
        }

        .rp-inv-preview {
          min-width: 0;
        }
        .rp-inv-paperwrap {
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          padding: 14px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          overflow: auto;
        }

        @media print {
          .print-hidden {
            display: none !important;
          }
          .rp-inv-shell {
            background: #fff !important;
            color: #000 !important;
          }
          .rp-inv-body {
            display: block;
            padding: 0 !important;
          }
          .rp-inv-paperwrap {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
