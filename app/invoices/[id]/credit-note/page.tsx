"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type CreditItem = {
  id: number;
  box_qty: number | null;
  units_per_box: number | null;
  total_qty: number;
  unit_price_excl_vat: number;
  unit_vat: number;
  unit_price_incl_vat: number;
  line_total: number;
  products: {
    sku: string;
    name: string;
  } | null;
};

type CreditInvoice = {
  id: number;
  invoice_number: string;
  invoice_date: string;
  subtotal: number;
  vat_amount: number;
  total_amount: number;
  vat_percent?: number | null;
  customers: {
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
  } | null;
  invoice_items: CreditItem[];
};

export default function CreditNotePage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const [invoice, setInvoice] = useState<CreditInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadInvoice() {
      setLoading(true);
      setError(null);

      const invoiceId = Number(id);
      if (!invoiceId) {
        setError("Invalid invoice id");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("invoices")
        .select(
          `
          id, invoice_number, invoice_date,
          subtotal, vat_amount, total_amount, vat_percent,
          customers ( name, address, phone, email ),
          invoice_items (
            id, box_qty, units_per_box, total_qty,
            unit_price_excl_vat, unit_vat, unit_price_incl_vat, line_total,
            products ( sku, name )
          )
        `
        )
        .eq("id", invoiceId)
        .single();

      if (error) {
        console.error(error);
        setError(error.message);
        setLoading(false);
        return;
      }

      setInvoice(data as unknown as CreditInvoice);
      setLoading(false);
    }

    loadInvoice();
  }, [id]);

  if (loading) {
    return (
      <div className="invoice-wrapper">
        <div className="invoice-page">
          <p>Loading credit note…</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="invoice-wrapper">
        <div className="invoice-page">
          <p style={{ color: "red" }}>
            {error ? `Error: ${error}` : "Credit note not found."}
          </p>
        </div>
      </div>
    );
  }

  const customer = invoice.customers;
  const items = invoice.invoice_items || [];

    return (
  <div className="invoice-wrapper">
    <div className="invoice-toolbar">
      <div className="invoice-toolbar-right">
        <button type="button" onClick={() => window.history.back()}>
          ← Back to Invoice
        </button>
        <button type="button" onClick={() => window.print()}>
          Download / Print PDF
        </button>
      </div>
    </div>

      <div className="invoice-page">
        {/* HEADER – CREDIT NOTE */}
        <table className="invoice-header-table" style={{ width: "100%" }}>
          <tbody>
            <tr>
              <td style={{ width: "65%" }}>
                <img
                  src="/ram-pottery-logo.png"
                  alt="Ram Pottery Ltd"
                  style={{ height: "50px", marginBottom: "4px" }}
                />
                <br />
                <strong style={{ fontSize: "16px" }}>RAM POTTERY LTD</strong>
                <br />
                Robert Kennedy Street, Reunion Maurel, Petit Raffray – Mauritius
                <br />
                Tel: 57788884 / 58060268 / 52522844
                <br />
                Email: rampottery@gmail.com
              </td>
              <td style={{ textAlign: "right", width: "35%" }}>
                <strong style={{ fontSize: "15px" }}>CREDIT NOTE</strong>
                <br />
                Ref: CN for Invoice {invoice.invoice_number}
                <br />
                Date:{" "}
                {new Date(invoice.invoice_date).toLocaleDateString("en-GB")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* CUSTOMER DETAILS */}
        <br />
        <table className="invoice-table details-table">
          <thead>
            <tr>
              <th>CUSTOMER DETAILS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Name:</strong> {customer?.name}
                <br />
                <strong>Address:</strong> {customer?.address}
                <br />
                <strong>Tel:</strong> {customer?.phone}
                <br />
                <strong>Email:</strong> {customer?.email}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ITEMS (values shown as positive; accountant will know it's a credit) */}
        <br />
        <table className="invoice-table">
          <thead>
            <tr>
              <th>SN</th>
              <th>ITEM CODE</th>
              <th>DESCRIPTION</th>
              <th>BOX</th>
              <th>UNIT PER BOX</th>
              <th>TOTAL QTY</th>
              <th>UNIT PRICE (Incl VAT)</th>
              <th>LINE TOTAL (Incl VAT)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={it.id}>
                <td className="center">{idx + 1}</td>
                <td className="center">{it.products?.sku}</td>
                <td>{it.products?.name}</td>
                <td className="right">{it.box_qty}</td>
                <td className="right">{it.units_per_box}</td>
                <td className="right">{it.total_qty}</td>
                <td className="right">
                  {it.unit_price_incl_vat.toFixed(2)}
                </td>
                <td className="right">{it.line_total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TOTALS / NOTES */}
        <br />
        <div className="flex-row">
          <div className="notes-box">
            <strong>Reason for Credit:</strong>
            <br />
            (Write reason here – e.g. returned goods, price adjustment, etc.)
            <br />
            <br />
            VAT rate: {invoice.vat_percent?.toFixed(2)}%
          </div>

          <div className="total-box">
            CREDIT SUB TOTAL: {invoice.subtotal.toFixed(2)}
            <br />
            CREDIT VAT: {invoice.vat_amount.toFixed(2)}
            <br />
            TOTAL CREDIT: {invoice.total_amount.toFixed(2)}
            <br />
          </div>
        </div>

        <br />
        <table
          className="signature-table"
          style={{ width: "100%", textAlign: "center" }}
        >
          <tbody>
            <tr>
              <td>Prepared by</td>
              <td>Customer Signature</td>
              <td>Company Stamp &amp; Signature</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
