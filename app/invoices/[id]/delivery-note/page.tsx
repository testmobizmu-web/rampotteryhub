"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type InvoiceItem = {
  id: number;
  box_qty: number | null;
  units_per_box: number | null;
  total_qty: number;
  products: { sku: string; name: string } | null;
};

type Invoice = {
  id: number;
  invoice_number: string;
  invoice_date: string;
  customers: {
    name: string;
    address: string | null;
    phone: string | null;
  } | null;
  invoice_items: InvoiceItem[];
};

export default function DeliveryNotePage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      const invoiceId = Number(id);
      const { data, error } = await supabase
        .from("invoices")
        .select(
          `
          id, invoice_number, invoice_date,
          customers ( name, address, phone ),
          invoice_items (
            id, box_qty, units_per_box, total_qty,
            products ( sku, name )
          )
        `
        )
        .eq("id", invoiceId)
        .single();
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setInvoice(data as any);
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="invoice-wrapper">
        <div className="invoice-page">
          <p>Loading delivery note…</p>
        </div>
      </div>
    );
  }
  if (error || !invoice) {
    return (
      <div className="invoice-wrapper">
        <div className="invoice-page">
          <p style={{ color: "red" }}>
            {error ? `Error: ${error}` : "Not found"}
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

        {/* You can reuse logo/header styling */}
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
              </td>
              <td style={{ textAlign: "right", width: "35%" }}>
                <strong style={{ fontSize: "15px" }}>DELIVERY NOTE</strong>
                <br />
                Ref: {invoice.invoice_number}
                <br />
                Date:{" "}
                {new Date(invoice.invoice_date).toLocaleDateString("en-GB")}
              </td>
            </tr>
          </tbody>
        </table>

        <br />
        <table className="invoice-table details-table">
          <thead>
            <tr>
              <th>DELIVER TO</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>{customer?.name}</strong>
                <br />
                {customer?.address}
                <br />
                Tel: {customer?.phone}
              </td>
            </tr>
          </tbody>
        </table>

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
              </tr>
            ))}
          </tbody>
        </table>

        <br />
        <table
          className="signature-table"
          style={{ width: "100%", textAlign: "center" }}
        >
          <tbody>
            <tr>
              <td>Prepared by</td>
              <td>Delivered by</td>
              <td>Customer Signature</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
