"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { rpFetch } from "@/lib/rpFetch";

type CreditNote = {
  id: number;
  credit_note_number: string;
  credit_note_date: string;
  reason: string | null;
  subtotal: number;
  vat_amount: number;
  total_amount: number;
  status: string;
  customers: {
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    customer_code: string | null;
    client: string | null;
  };
};

type Item = {
  id: number;
  total_qty: number;
  unit_price_excl_vat: number;
  unit_vat: number;
  unit_price_incl_vat: number;
  line_total: number;
  products: {
    name: string | null;
    item_code: string | null;
    sku: string | null;
  };
};

export default function CreditNotePrintClient() {
  const { id } = useParams<{ id: string }>();
  const [cn, setCn] = useState<CreditNote | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await rpFetch(`/api/credit-notes/get/${id}`);
        const json = await res.json();
        if (!res.ok || !json.ok) throw new Error(json.error || "Failed");

        if (!alive) return;
        setCn(json.credit_note);
        setItems(json.items || []);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Error");
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [id]);

  if (err) return <div className="rp-print-error">{err}</div>;
  if (!cn) return null;

  return (
    <div className="rp-print">
      <div className="rp-print-toolbar">
        <button
          onClick={() => window.print()}
          className="rp-ui-btn rp-ui-btn--brand"
          type="button"
        >
          Print
        </button>

        <a
          className="rp-ui-btn rp-ui-btn--brand"
          href={`/api/credit-notes/pdf/${cn.id}`}
          target="_blank"
          rel="noreferrer"
        >
          Download PDF
        </a>
      </div>

      <div className="rp-a4">
        <header className="rp-a4-header">
          <div>
            <h1>CREDIT NOTE</h1>
            <div className="rp-doc-meta">
              <div>
                No: <b>{cn.credit_note_number}</b>
              </div>
              <div>Date: {cn.credit_note_date}</div>
            </div>
          </div>

          <div className="rp-company">
            <b>Ram Pottery Ltd</b>
            <div>Royal Road, Mauritius</div>
          </div>
        </header>

        <section className="rp-a4-box">
          <div className="rp-a4-box-title">BILL TO</div>
          <div>
            <b>{cn.customers.name}</b>
          </div>
          {cn.customers.customer_code && <div>Code: {cn.customers.customer_code}</div>}
          {cn.customers.client && <div>Client: {cn.customers.client}</div>}
          {cn.customers.address && <div>{cn.customers.address}</div>}
          <div>
            {cn.customers.phone && `Tel: ${cn.customers.phone}`}
            {cn.customers.email && ` • ${cn.customers.email}`}
          </div>
        </section>

        <table className="rp-a4-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th className="rp-right">Qty</th>
              <th className="rp-right">Unit</th>
              <th className="rp-right">VAT</th>
              <th className="rp-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={it.id}>
                <td>{i + 1}</td>
                <td>
                  <b>{it.products?.name || "—"}</b>
                  <div className="rp-muted">
                    {it.products?.item_code || it.products?.sku || ""}
                  </div>
                </td>
                <td className="rp-right">{it.total_qty}</td>
                <td className="rp-right">{Number(it.unit_price_excl_vat).toFixed(2)}</td>
                <td className="rp-right">{Number(it.unit_vat).toFixed(2)}</td>
                <td className="rp-right">{Number(it.line_total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="rp-a4-totals">
          <div>
            <span>Subtotal</span>
            <b>{Number(cn.subtotal).toFixed(2)}</b>
          </div>
          <div>
            <span>VAT</span>
            <b>{Number(cn.vat_amount).toFixed(2)}</b>
          </div>
          <div className="rp-a4-total">
            <span>Total</span>
            <b>{Number(cn.total_amount).toFixed(2)}</b>
          </div>
        </section>

        <footer className="rp-a4-footer">
          <div>Status: {cn.status}</div>
          <div>This credit note is system generated.</div>
        </footer>
      </div>
    </div>
  );
}
