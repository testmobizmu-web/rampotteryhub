// app/invoices/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { RamPotteryDoc } from "@/components/RamPotteryDoc";

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
  sales_rep_phone: string | null;

  subtotal: number | null;
  vat_amount: number | null;
  total_amount: number | null;
  previous_balance: number | null;
  amount_paid: number | null;
  gross_total: number | null;
  balance_remaining: number | null;
  status: string | null;

  customers: CustomerInfo | null;
};

type ProductInfo = { id: number; item_code: string | null; name: string | null };

type InvoiceItemView = {
  id: number;
  product_id: number | null;
  box_qty: number | null;
  units_per_box: number | null;
  total_qty: number | null;
  unit_price_excl_vat: number | null;
  unit_vat: number | null;
  unit_price_incl_vat?: number | null;
  line_total?: number | null;
  products: ProductInfo | null;
};

type ApiResponse = { invoice: InvoiceView; items: InvoiceItemView[] };

type CreditNoteRow = {
  id: number;
  credit_note_number: string | null;
  credit_note_date: string | null;
  total_amount: number | null;
  status: string | null;
};

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function toWhatsAppDigits(phoneRaw: string | null | undefined) {
  const raw = String(phoneRaw || "").trim();
  if (!raw) return null;
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  if (digits.length === 8) return `230${digits}`; // auto +230
  return digits;
}

function buildPaidWhatsAppText(params: {
  customerName: string;
  invoiceNo: string;
  total: number;
  date: string;
}) {
  const { customerName, invoiceNo, total, date } = params;

  const msg =
    `Bonjour ${customerName},\n\n` +
    `Nous confirmons la réception de votre paiement pour la facture ${invoiceNo} du ${date}.\n` +
    `Montant reçu : Rs ${total.toFixed(2)}.\n\n` +
    `Merci pour votre confiance.\n` +
    `— Ram Pottery Ltd`;

  return encodeURIComponent(msg);
}

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [actionBusy, setActionBusy] = useState<null | "MARK_PAID" | "MARK_UNPAID" | "ADD_PAYMENT">(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [partialAmount, setPartialAmount] = useState<string>("");

  const [cnLoading, setCnLoading] = useState(false);
  const [cnError, setCnError] = useState<string | null>(null);
  const [creditNotes, setCreditNotes] = useState<CreditNoteRow[]>([]);

  async function loadInvoice() {
    const id = params.id;
    if (!id) return;

    try {
      setLoading(true);
      setActionError(null);

      const res = await fetch(`/api/invoices/${id}`, { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed to load invoice");
      setData(json);
      setPartialAmount("");
    } catch (err: any) {
      setActionError(err.message || "Error loading invoice");
    } finally {
      setLoading(false);
    }
  }

  async function loadCreditNotes(invoiceId: number) {
    setCnLoading(true);
    setCnError(null);
    try {
      const res = await fetch(`/api/credit-notes/by-invoice?invoiceId=${invoiceId}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load credit notes");
      setCreditNotes(json.creditNotes || []);
    } catch (e: any) {
      setCnError(e.message || "Failed to load credit notes");
      setCreditNotes([]);
    } finally {
      setCnLoading(false);
    }
  }

  useEffect(() => {
    loadInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  useEffect(() => {
    const invId = data?.invoice?.id;
    if (!invId) return;
    loadCreditNotes(invId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.invoice?.id]);

  async function updatePayment(action: "MARK_PAID" | "MARK_UNPAID" | "ADD_PAYMENT") {
    if (!data?.invoice?.id) return;

    setActionBusy(action);
    setActionError(null);

    try {
      const body: any = { action };

      if (action === "ADD_PAYMENT") {
        const n = Number(partialAmount || 0);
        if (Number.isNaN(n) || n <= 0) {
          alert("Enter a valid payment amount (> 0).");
          setActionBusy(null);
          return;
        }
        body.paymentAmount = n;
      }

      const res = await fetch(`/api/invoices/${data.invoice.id}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Payment update failed");

      await loadInvoice();
    } catch (err: any) {
      setActionError(err.message || "Payment update failed");
    } finally {
      setActionBusy(null);
    }
  }

  const invoice = data?.invoice;
  const items = data?.items ?? [];
  const customer = invoice?.customers;

  const invoiceDateFormatted = invoice?.invoice_date
    ? new Date(invoice.invoice_date).toLocaleDateString("en-GB")
    : "";

  const statusUpper = String(invoice?.status || "UNPAID").toUpperCase();
  const isPaid = statusUpper === "PAID";

  const computed = useMemo(() => {
    const subtotal = Number(invoice?.subtotal || 0);
    const vatAmount = Number(invoice?.vat_amount || 0);
    const totalAmount = Number(invoice?.total_amount || 0);
    const previousBalance = Number(invoice?.previous_balance || 0);

    const grossTotal = Number(invoice?.gross_total ?? (totalAmount + previousBalance));
    const amountPaid = Number(invoice?.amount_paid || 0);
    const balanceRemaining = Number(invoice?.balance_remaining ?? Math.max(0, grossTotal - amountPaid));

    return {
      subtotal: round2(subtotal),
      vatAmount: round2(vatAmount),
      totalAmount: round2(totalAmount),
      previousBalance: round2(previousBalance),
      grossTotal: round2(grossTotal),
      amountPaid: round2(amountPaid),
      balanceRemaining: round2(balanceRemaining),
    };
  }, [invoice]);

  if (loading) return <div style={{ padding: 20, textAlign: "center" }}>Loading invoice…</div>;
  if (!invoice) return <div style={{ padding: 20, color: "#b91c1c" }}>{actionError || "Invoice not found"}</div>;

  return (
    <div className="rp-app rp-invoice-page">
      {/* Sidebar (keep your existing style) */}
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

        <button className="btn-primary-red" style={{ marginTop: 12, width: "100%" }} onClick={() => window.print()}>
          🖨 Print / Download PDF
        </button>

        <div style={{ marginTop: 14 }}>
          <button
            className="btn-primary-red"
            disabled={actionBusy !== null}
            onClick={() => updatePayment("MARK_PAID")}
            style={{ width: "100%", marginBottom: 8 }}
          >
            {actionBusy === "MARK_PAID" ? "Saving…" : "✅ Mark as PAID"}
          </button>

          <button
            className="rp-nav-item"
            disabled={actionBusy !== null}
            onClick={() => updatePayment("MARK_UNPAID")}
            style={{ width: "100%", marginBottom: 10 }}
          >
            {actionBusy === "MARK_UNPAID" ? "Saving…" : "↩ Mark as UNPAID"}
          </button>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.75, marginBottom: 6 }}>Partial Payment (Add)</div>

            <input
              className="rp-input-plain"
              value={partialAmount}
              onChange={(e) => setPartialAmount(e.target.value)}
              placeholder="Amount received now (Rs)"
              inputMode="decimal"
              style={{ width: "100%", marginBottom: 8 }}
            />

            <button className="rp-nav-item" disabled={actionBusy !== null} onClick={() => updatePayment("ADD_PAYMENT")} style={{ width: "100%" }}>
              {actionBusy === "ADD_PAYMENT" ? "Saving…" : "➕ Add Payment"}
            </button>
          </div>

          <button
            className="rp-nav-item"
            disabled={!isPaid}
            onClick={() => {
              if (!isPaid) return alert("Invoice must be PAID to send WhatsApp confirmation.");
              const wa = toWhatsAppDigits(customer?.phone);
              if (!wa) return alert("Customer phone missing/invalid for WhatsApp.");

              const msg = buildPaidWhatsAppText({
                customerName: customer?.name || "Client",
                invoiceNo: invoice.invoice_number,
                total: computed.grossTotal,
                date: invoiceDateFormatted,
              });

              window.open(`https://wa.me/${wa}?text=${msg}`, "_blank");
            }}
            style={{ width: "100%", marginTop: 2 }}
          >
            💬 WhatsApp Paid Confirmation
          </button>

          <div style={{ marginTop: 12 }}>
            <button
              className="rp-nav-item"
              onClick={() => router.push(`/credit-notes/new?customerId=${invoice.customers?.id || ""}&invoiceId=${invoice.id}`)}
              style={{ width: "100%", marginBottom: 8 }}
            >
              ➕ Create Credit Note (for this invoice)
            </button>

            <button className="rp-nav-item" onClick={() => router.push("/credit-notes")} style={{ width: "100%" }}>
              📄 View Credit Notes
            </button>
          </div>

          {actionError && <div style={{ marginTop: 10, color: "#fb7185", fontSize: 12 }}>{actionError}</div>}
        </div>
      </aside>

      {/* Main: EXACT TEMPLATE DOC */}
      <main className="rp-page-main rp-invoice-main">
        <RamPotteryDoc
          header={{ docTitle: "VAT INVOICE", statusText: statusUpper }}
          customer={{
            customerCode: customer?.customer_code,
            name: customer?.name,
            address: customer?.address,
            tel: customer?.phone,
            brn: customer?.brn,
            vatNo: customer?.vat_no,
          }}
          rightBlockTitle="INVOICE DETAILS"
          rightLines={[
            { label: "INVOICE NO:", value: invoice.invoice_number },
            { label: "DATE:", value: invoiceDateFormatted },
            { label: "PURCHASE ORDER NO:", value: invoice.purchase_order_no || "" },
            { label: "SALES REP:", value: invoice.sales_rep || "", extraLabel: "Tel:", extraValue: invoice.sales_rep_phone || "" },
          ]}
          tableHead={
            <tr>
              <th style={{ width: 46 }}>SN</th>
              <th style={{ width: 98 }}>ITEM CODE</th>
              <th style={{ width: 60 }}>BOX</th>
              <th style={{ width: 74 }}>UNIT PER BOX</th>
              <th style={{ width: 86 }}>TOTAL QTY</th>
              <th>DESCRIPTION</th>
              <th style={{ width: 92 }}>UNIT PRICE (Excl Vat)</th>
              <th style={{ width: 60 }}>VAT</th>
              <th style={{ width: 92 }}>UNIT PRICE (Incl Vat)</th>
              <th style={{ width: 96 }}>TOTAL AMOUNT (Incl Vat)</th>
            </tr>
          }
          tableBody={
            <>
              {items.map((r, idx) => {
                const boxQty = Number(r.box_qty || 0);
                const unitsPerBox = Number(r.units_per_box || 0);
                const totalQty = Number(r.total_qty || 0);
                const unitEx = Number(r.unit_price_excl_vat || 0);
                const unitVat = Number(r.unit_vat || 0);
                const unitIncl = Number((r.unit_price_incl_vat ?? unitEx + unitVat) || 0);
                const lineTotal = Number((r.line_total ?? unitIncl * totalQty) || 0);

                return (
                  <tr key={r.id}>
                    <td>{idx + 1}</td>
                    <td>{r.products?.item_code || ""}</td>
                    <td>{boxQty}</td>
                    <td>{unitsPerBox}</td>
                    <td>{totalQty}</td>
                    <td>{r.products?.name || ""}</td>
                    <td style={{ textAlign: "right" }}>{unitEx.toFixed(2)}</td>
                    <td style={{ textAlign: "right" }}>{unitVat.toFixed(2)}</td>
                    <td style={{ textAlign: "right" }}>{unitIncl.toFixed(2)}</td>
                    <td style={{ textAlign: "right" }}>{lineTotal.toFixed(2)}</td>
                  </tr>
                );
              })}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: 14 }}>
                    No items
                  </td>
                </tr>
              ) : null}
            </>
          }
          totals={[
            { label: "SUB TOTAL", value: computed.subtotal.toFixed(2) },
            { label: "VAT 15%", value: computed.vatAmount.toFixed(2) },
            { label: "TOTAL AMOUNT", value: computed.totalAmount.toFixed(2) },
            { label: "PREVIOUS BALANCE", value: computed.previousBalance.toFixed(2) },
            { label: "GROSS TOTAL", value: computed.grossTotal.toFixed(2) },
            { label: "AMOUNT PAID", value: computed.amountPaid.toFixed(2) },
            { label: "BALANCE REMAINING", value: computed.balanceRemaining.toFixed(2) },
          ]}
          footerLeft="Prepared by: __________"
          footerMiddle="Delivered by: __________"
          footerRight="Customer Signature"
        />

        {/* Linked credit notes quick table (kept outside the printed doc if you want) */}
        <div className="print-hidden" style={{ maxWidth: 820, margin: "12px auto 40px" }}>
          <div className="card">
            <div className="panel-title">Credit Notes linked to this invoice</div>
            {cnLoading ? (
              <p style={{ marginTop: 8 }}>Loading…</p>
            ) : cnError ? (
              <p style={{ marginTop: 8, color: "#b91c1c" }}>{cnError}</p>
            ) : creditNotes.length === 0 ? (
              <p style={{ marginTop: 8, opacity: 0.8 }}>No credit notes linked.</p>
            ) : (
              <div style={{ overflowX: "auto", marginTop: 10 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {creditNotes.map((cn) => (
                      <tr key={cn.id}>
                        <td>{cn.credit_note_number || `#${cn.id}`}</td>
                        <td>{cn.credit_note_date ? new Date(cn.credit_note_date).toLocaleDateString("en-GB") : "—"}</td>
                        <td>{Number(cn.total_amount || 0).toFixed(2)}</td>
                        <td>{String(cn.status || "—").toUpperCase()}</td>
                        <td>
                          <button className="btn btn-ghost" onClick={() => router.push(`/credit-notes/${cn.id}`)}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
