// app/credit-notes/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

type CustomerInfo = {
  name: string | null;
  address: string | null;
  phone: string | null;
  brn: string | null;
  vat_no: string | null;
  customer_code: string | null;
};

type CreditNote = {
  id: number;
  credit_note_number: string;
  credit_note_date: string;
  reason: string | null;
  subtotal: number | null;
  vat_amount: number | null;
  total_amount: number | null;
  status: string | null;
  customers: CustomerInfo | null;
};

type CNItem = {
  id: number;
  total_qty: number | null;
  unit_price_excl_vat: number | null;
  unit_vat: number | null;
  unit_price_incl_vat: number | null;
  line_total: number | null;
  products: { sku: string | null; name: string | null } | null;
};

export default function CreditNoteViewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [creditNote, setCreditNote] = useState<CreditNote | null>(null);
  const [items, setItems] = useState<CNItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/credit-notes/${params.id}`, { cache: "no-store" });
      const json = await res.json();

      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load credit note");

      setCreditNote(json.creditNote);
      setItems(json.items || []);
    } catch (e: any) {
      setError(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>;
  if (error || !creditNote) return <div style={{ padding: 20, color: "#b91c1c" }}>{error || "Not found"}</div>;

  const c = creditNote.customers;
  const dateFmt = creditNote.credit_note_date ? new Date(creditNote.credit_note_date).toLocaleDateString("en-GB") : "";

  const subtotal = Number(creditNote.subtotal || 0);
  const vat = Number(creditNote.vat_amount || 0);
  const total = Number(creditNote.total_amount || 0);

  return (
    <div className="rp-app rp-invoice-page">
      <aside className="rp-sidebar print-hidden">
        <div className="rp-sidebar-logo">
          <Image src="/images/logo/logo.png" alt="Ram Pottery Logo" width={34} height={34} />
          <div>
            <div className="rp-sidebar-logo-title">Ram Pottery Ltd</div>
            <div className="rp-sidebar-logo-sub">Online Accounting &amp; Stock Manager</div>
          </div>
        </div>

        <button className="rp-nav-item" onClick={() => router.push("/credit-notes")} style={{ marginTop: 16 }}>
          ← Back to Credit Notes
        </button>

        <button className="btn-primary-red" style={{ marginTop: 12 }} onClick={() => window.print()}>
          🖨 Print / Download PDF
        </button>
      </aside>

      <main className="rp-page-main rp-invoice-main">
        <div className="rp-invoice-paper">
          <header className="rp-invoice-header">
            <div className="rp-invoice-logo-block">
              <Image src="/images/logo/logo.png" alt="Ram Pottery Logo" width={70} height={70} />
              <div className="rp-invoice-logo-text">
                <h1>RAM POTTERY LTD</h1>
                <p>MANUFACTURER &amp; IMPORTER OF QUALITY CLAY</p>
                <p>PRODUCTS AND OTHER RELIGIOUS ITEMS</p>
                <p>Robert Kennedy Street, Reunion Maurel, Petit Raffray - Mauritius</p>
                <p>Tel: +230 57788884 +230 58060268 +230 52522844 • Email: info@rampottery.com</p>
              </div>
            </div>

            <div className="rp-invoice-title-row">
              <div className="rp-invoice-title">CREDIT NOTE</div>
              <div style={{ marginTop: 8, fontSize: 12, fontWeight: 800, opacity: 0.75 }}>
                STATUS: {String(creditNote.status || "ISSUED").toUpperCase()}
              </div>
            </div>
          </header>

          <div className="rp-invoice-brn-row">
            <div className="rp-invoice-brn-cell">BRN: C17144377 | VAT: 123456789</div>
          </div>

          <section className="rp-invoice-top-grid">
            <div className="rp-invoice-customer-box">
              <div className="rp-invoice-section-heading red">CUSTOMER DETAILS</div>

              <div className="rp-invoice-field-row">
                <label>Customer Code:</label>
                <input disabled value={c?.customer_code || ""} className="rp-input-plain" />
              </div>

              <div className="rp-invoice-field-row">
                <label>Customer:</label>
                <input disabled value={c?.name || ""} className="rp-input-plain" />
              </div>

              <div className="rp-invoice-field-row">
                <label>Address:</label>
                <textarea disabled rows={2} value={c?.address || ""} className="rp-input-plain" />
              </div>

              <div className="rp-invoice-field-row">
                <label>Tel:</label>
                <input disabled value={c?.phone || ""} className="rp-input-plain" />
              </div>

              <div className="rp-invoice-field-row">
                <label>BRN:</label>
                <input disabled value={c?.brn || ""} className="rp-input-plain small" />
                <label>VAT No:</label>
                <input disabled value={c?.vat_no || ""} className="rp-input-plain small" />
              </div>
            </div>

            <div className="rp-invoice-account-box">
              <div className="rp-invoice-section-heading red">CREDIT NOTE DETAILS</div>

              <div className="rp-invoice-field-row">
                <label>Credit Note No:</label>
                <input disabled value={creditNote.credit_note_number} className="rp-input-plain" />
              </div>

              <div className="rp-invoice-field-row">
                <label>Date:</label>
                <input disabled value={dateFmt} className="rp-input-plain" />
              </div>

              <div className="rp-invoice-field-row">
                <label>Reason:</label>
                <textarea disabled rows={2} value={creditNote.reason || ""} className="rp-input-plain" />
              </div>
            </div>
          </section>

          <section className="rp-invoice-items">
            <table>
              <thead>
                <tr>
                  <th>SN</th>
                  <th>ITEM CODE</th>
                  <th>DESCRIPTION</th>
                  <th>QTY</th>
                  <th>UNIT PRICE (Excl VAT)</th>
                  <th>VAT</th>
                  <th>UNIT PRICE (Incl VAT)</th>
                  <th>LINE TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r, idx) => (
                  <tr key={r.id}>
                    <td>{idx + 1}</td>
                    <td>{r.products?.sku || ""}</td>
                    <td>{r.products?.name || ""}</td>
                    <td>{Number(r.total_qty || 0)}</td>
                    <td>{Number(r.unit_price_excl_vat || 0).toFixed(2)}</td>
                    <td>{Number(r.unit_vat || 0).toFixed(2)}</td>
                    <td>{Number(r.unit_price_incl_vat || 0).toFixed(2)}</td>
                    <td>{Number(r.line_total || 0).toFixed(2)}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={8}>No items</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          <section className="rp-invoice-bottom-grid">
            <div className="rp-invoice-notes">
              <div className="rp-invoice-notes-title">Note:</div>
              <ul>
                <li>This document is a Credit Note issued for the items/amounts above.</li>
                <li>Please keep this Credit Note for your records.</li>
              </ul>
            </div>

            <div className="rp-invoice-totals">
              <div className="rp-invoice-field-row">
                <label>SUBTOTAL</label>
                <input disabled value={subtotal.toFixed(2)} className="rp-input-plain" />
              </div>
              <div className="rp-invoice-field-row">
                <label>VAT 15%</label>
                <input disabled value={vat.toFixed(2)} className="rp-input-plain" />
              </div>
              <div className="rp-invoice-field-row">
                <label>TOTAL</label>
                <input disabled value={total.toFixed(2)} className="rp-input-plain" />
              </div>
            </div>
          </section>

          <div className="rp-invoice-footer-bar">
            We thank you for your business.
          </div>
        </div>
      </main>
    </div>
  );
}
