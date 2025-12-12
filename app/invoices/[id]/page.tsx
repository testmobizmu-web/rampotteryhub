// app/invoices/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

type CustomerInfo = {
  id: number;
  name: string | null;
  address: string | null;
  phone: string | null;
  brn: string | null;
  vat_no: string | null;
  customer_code: string | null;
};

type InvoiceView = {
  id: number;
  invoice_number: string;
  invoice_date: string;
  purchase_order_no: string | null;
  sales_rep: string | null;
  subtotal: number | null;
  discount_percent: number | null;
  discount_amount: number | null;
  vat_amount: number | null;
  total_amount: number | null;
  previous_balance: number | null;
  amount_paid: number | null;
  gross_total: number | null;
  balance_remaining: number | null;
  status: string | null;
  customers: CustomerInfo | null;
};

type ProductInfo = {
  id: number;
  item_code: string | null;
  name: string | null;
};

type InvoiceItemView = {
  id: number;
  product_id: number | null;
  box_qty: number | null;
  units_per_box: number | null;
  total_qty: number | null;
  unit_price_excl_vat: number | null;
  unit_vat: number | null;
  products: ProductInfo | null;
};

type ApiResponse = {
  invoice: InvoiceView;
  items: InvoiceItemView[];
};

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = params.id;
    if (!id) return;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/invoices/${id}`);
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Failed to load invoice");
        }
        setData(json);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error loading invoice");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.id]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="rp-app rp-invoice-page">
        <main className="rp-page-main rp-invoice-main">
          <p style={{ marginTop: 40, textAlign: "center" }}>
            Loading invoice…
          </p>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rp-app rp-invoice-page">
        <main className="rp-page-main rp-invoice-main">
          <p style={{ marginTop: 40, textAlign: "center", color: "#b91c1c" }}>
            {error || "Invoice not found"}
          </p>
        </main>
      </div>
    );
  }

  const { invoice, items } = data;
  const customer = invoice.customers;

  const invoiceDateFormatted = invoice.invoice_date
    ? new Date(invoice.invoice_date).toLocaleDateString("en-GB")
    : "";

  // fallbacks if DB fields are null
  const subtotal = invoice.subtotal ?? 0;
  const discountPercent = invoice.discount_percent ?? 0;
  const discountAmount = invoice.discount_amount ?? 0;
  const vatAmount = invoice.vat_amount ?? 0;
  const totalAmount = invoice.total_amount ?? 0;
  const previousBalance = invoice.previous_balance ?? 0;
  const amountPaid = invoice.amount_paid ?? 0;
  const grossTotal = invoice.gross_total ?? totalAmount;
  const balanceRemaining = invoice.balance_remaining ?? 0;

  return (
    <div className="rp-app rp-invoice-page">
      {/* Minimal sidebar just like NewInvoicePage */}
      <aside className="rp-sidebar">
        <div className="rp-sidebar-logo">
          <Image
            src="/images/logo/logo.png"
            alt="Ram Pottery Logo"
            width={34}
            height={34}
          />
          <div>
            <div className="rp-sidebar-logo-title">Ram Pottery Ltd</div>
            <div className="rp-sidebar-logo-sub">
              Online Accounting &amp; Stock Manager
            </div>
          </div>
        </div>
        <button
          className="rp-nav-item"
          onClick={() => router.push("/invoices")}
          style={{ marginTop: 16 }}
        >
          ← Back to Invoices
        </button>
      </aside>

      <main className="rp-page-main rp-invoice-main">
        <div className="rp-invoice-paper">
          {/* ACTIONS (Print) */}
          <div className="rp-invoice-actions print-hidden">
            <button
              type="button"
              className="btn-soft"
              onClick={() => router.push("/invoices")}
            >
              ← Back
            </button>
            <button
              type="button"
              className="btn-primary-red"
              onClick={handlePrint}
            >
              🖨 Print / Download PDF
            </button>
          </div>

          {/* TOP HEADER */}
          <header className="rp-invoice-header">
            <div className="rp-invoice-logo-block">
              <Image
                src="/images/logo/logo.png"
                alt="Ram Pottery Logo"
                width={70}
                height={70}
              />
              <div className="rp-invoice-logo-text">
                <h1>RAM POTTERY LTD</h1>
                <p>MANUFACTURER &amp; IMPORTER OF QUALITY CLAY</p>
                <p>PRODUCTS AND OTHER RELIGIOUS ITEMS</p>
                <p>
                  Robert Kennedy Street, Reunion Maurel, Petit Raffray -
                  Mauritius
                </p>
                <p>
                  Tel: +230 57788884 +230 58060268 +230 52522844 &nbsp; Email:
                  info@rampottery.com &nbsp; Web: www.rampottery.com
                </p>
              </div>
            </div>
            <div className="rp-invoice-title-row">
              <div className="rp-invoice-title">VAT INVOICE</div>
            </div>
          </header>

          {/* BRN / VAT strip */}
          <div className="rp-invoice-brn-row">
            <div className="rp-invoice-brn-cell">
              BRN: C17144377 | VAT: 123456789
            </div>
          </div>

          {/* CUSTOMER + ACCOUNT DETAILS */}
          <section className="rp-invoice-top-grid">
            <div className="rp-invoice-customer-box">
              <div className="rp-invoice-section-heading red">
                CUSTOMER DETAILS
              </div>
              <div className="rp-invoice-field-row">
                <label>Customer:</label>
                <input
                  disabled
                  value={customer?.name || ""}
                  className="rp-input-plain"
                />
              </div>
              <div className="rp-invoice-field-row">
                <label>Name:</label>
                <input
                  disabled
                  value={customer?.name || ""}
                  className="rp-input-plain"
                />
              </div>
              <div className="rp-invoice-field-row">
                <label>Address:</label>
                <textarea
                  disabled
                  rows={2}
                  value={customer?.address || ""}
                  className="rp-input-plain"
                />
              </div>
              <div className="rp-invoice-field-row">
                <label>Tel:</label>
                <input
                  disabled
                  value={customer?.phone || ""}
                  className="rp-input-plain"
                />
              </div>
              <div className="rp-invoice-field-row">
                <label>BRN:</label>
                <input
                  disabled
                  value={customer?.brn || ""}
                  className="rp-input-plain small"
                />
                <label>VAT No:</label>
                <input
                  disabled
                  value={customer?.vat_no || ""}
                  className="rp-input-plain small"
                />
              </div>
              <div className="rp-invoice-field-row">
                <label>Customer Code:</label>
                <input
                  disabled
                  value={customer?.customer_code || ""}
                  className="rp-input-plain"
                />
              </div>
            </div>

            <div className="rp-invoice-account-box">
              <div className="rp-invoice-section-heading red">
                ACCOUNT / INVOICE DETAILS
              </div>
              <div className="rp-invoice-field-row">
                <label>Invoice No:</label>
                <input
                  disabled
                  value={invoice.invoice_number}
                  className="rp-input-plain"
                />
              </div>
              <div className="rp-invoice-field-row">
                <label>Date:</label>
                <input
                  disabled
                  value={invoiceDateFormatted}
                  className="rp-input-plain"
                />
              </div>
              <div className="rp-invoice-field-row">
                <label>Purchase Order No:</label>
                <input
                  disabled
                  value={invoice.purchase_order_no || ""}
                  className="rp-input-plain"
                />
              </div>
              <div className="rp-invoice-field-row">
                <label>Sales Rep:</label>
                <input
                  disabled
                  value={invoice.sales_rep || ""}
                  className="rp-input-plain"
                />
              </div>
            </div>
          </section>

          {/* ITEMS TABLE */}
          <section className="rp-invoice-items">
            <table>
              <thead>
                <tr>
                  <th>SN</th>
                  <th>ITEM CODE</th>
                  <th>BOX</th>
                  <th>UNIT PER BOX</th>
                  <th>TOTAL QTY</th>
                  <th>DESCRIPTION</th>
                  <th>UNIT PRICE (Excl Vat)</th>
                  <th>VAT</th>
                  <th>UNIT PRICE (Incl Vat)</th>
                  <th>TOTAL AMOUNT (Incl Vat)</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={10} style={{ fontSize: 12 }}>
                      No items recorded for this invoice.
                    </td>
                  </tr>
                )}
                {items.map((row, idx) => {
                  const qty = row.total_qty ?? 0;
                  const unitEx = row.unit_price_excl_vat ?? 0;
                  const unitVat = row.unit_vat ?? 0;
                  const unitIncl = unitEx + unitVat;
                  const totalIncl = unitIncl * qty;

                  const itemCode = row.products?.item_code || "";
                  const desc = row.products?.name || "";

                  return (
                    <tr key={row.id}>
                      <td>{idx + 1}</td>
                      <td>{itemCode}</td>
                      <td>{row.box_qty ?? 0}</td>
                      <td>{row.units_per_box ?? 0}</td>
                      <td>{qty}</td>
                      <td>{desc}</td>
                      <td>{unitEx.toFixed(2)}</td>
                      <td>{unitVat.toFixed(2)}</td>
                      <td>{unitIncl.toFixed(2)}</td>
                      <td>{totalIncl.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* NOTES + TOTALS */}
          <section className="rp-invoice-bottom-grid">
            <div className="rp-invoice-notes">
              <div className="rp-invoice-notes-title">Note:</div>
              <ul>
                <li>Goods once sold cannot be returned or exchanged.</li>
                <li>
                  For any other manufacturing defects, must provide this invoice
                  for a refund or exchange.
                </li>
                <li>
                  Customer must verify that the quantity of goods conforms with
                  their invoice; otherwise, we will not be responsible after
                  delivery.
                </li>
                <li>
                  Interest of 1% above the bank rate will be charged on sum due
                  if not settled within 30 days.
                </li>
                <li>All cheques to be issued on RAM POTTERY LTD.</li>
                <li>
                  Bank transfer to <strong>000 44 570 46 59 MCB Bank</strong>
                </li>
              </ul>
            </div>

            <div className="rp-invoice-totals">
              <div className="rp-invoice-field-row">
                <label>Discount %</label>
                <input
                  disabled
                  value={discountPercent.toFixed(2)}
                  className="rp-input-plain"
                />
              </div>
              <div className="rp-invoice-field-row">
                <label>Discount Amount (Rs)</label>
                <input
                  disabled
                  value={discountAmount.toFixed(2)}
                  className="rp-input-plain"
                />
              </div>
              <div className="rp-invoice-field-row">
                <label>SUB TOTAL</label>
                <input
                  disabled
                  value={subtotal.toFixed(2)}
                  className="rp-input-plain"
                />
              </div>
              <div className="rp-invoice-field-row">
                <label>VAT 15%</label>
                <input
                  disabled
                  value={vatAmount.toFixed(2)}
                  className="rp-input-plain"
                />
              </div>
              <div className="rp-invoice-field-row">
                <label>TOTAL AMOUNT</label>
                <input
                  disabled
                  value={totalAmount.toFixed(2)}
                  className="rp-input-plain"
                />
              </div>
              <div className="rp-invoice-field-row">
                <label>PREVIOUS BALANCE</label>
                <input
                  disabled
                  value={previousBalance.toFixed(2)}
                  className="rp-input-plain"
                />
              </div>
              <div className="rp-invoice-field-row">
                <label>GROSS TOTAL</label>
                <input
                  disabled
                  value={grossTotal.toFixed(2)}
                  className="rp-input-plain"
                />
              </div>
              <div className="rp-invoice-field-row">
                <label>AMOUNT PAID</label>
                <input
                  disabled
                  value={amountPaid.toFixed(2)}
                  className="rp-input-plain"
                />
              </div>
              <div className="rp-invoice-field-row">
                <label>BALANCE REMAINING</label>
                <input
                  disabled
                  value={balanceRemaining.toFixed(2)}
                  className="rp-input-plain"
                />
              </div>
            </div>
          </section>

          {/* SIGNATURES + FOOTLINE */}
          <section className="rp-invoice-signatures">
            <div>
              <div className="sig-line" />
              <div className="sig-label">Signature – Prepared by: Manish</div>
            </div>
            <div>
              <div className="sig-line" />
              <div className="sig-label">Signature – Delivered by:</div>
            </div>
            <div>
              <div className="sig-line" />
              <div className="sig-label">
                Customer Signature – Customer Name:
              </div>
            </div>
          </section>

          <div className="rp-invoice-footer-bar">
            We thank you for your purchase and look forward to being of service
            to you again
          </div>
        </div>
      </main>
    </div>
  );
}
