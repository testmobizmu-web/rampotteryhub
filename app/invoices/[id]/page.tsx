"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import RamPotteryDoc from "@/components/RamPotteryDoc";

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
  balance_due?: number | null; // newer column
  balance_remaining: number | null; // legacy column

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

type PaymentRow = {
  id: string;
  payment_date: string | null;
  amount: number | null;
  method: string | null;
  reference: string | null;
  notes: string | null;
  created_at: string | null;
};

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function toWhatsAppDigits(phoneRaw: string | null | undefined) {
  const raw = String(phoneRaw || "").trim();
  if (!raw) return null;
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  if (digits.length === 8) return `230${digits}`; // Mauritius
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

function statusBadge(statusUpper: string) {
  const s = statusUpper || "ISSUED";
  if (s === "PAID") return { text: "PAID", cls: "rp-status rp-status-approved" };
  if (s === "PARTIALLY_PAID")
    return { text: "PARTIALLY PAID", cls: "rp-status rp-status-pending" };
  if (s === "VOID") return { text: "VOID", cls: "rp-status rp-status-cancelled" };
  if (s === "DRAFT") return { text: "DRAFT", cls: "rp-status rp-status-draft" };
  return { text: "ISSUED", cls: "rp-status rp-status-issued" };
}

function n2(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [actionBusy, setActionBusy] = useState<null | "PRINT" | "PAYMENT_ADD" | "PAYMENT_DELETE">(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [cnLoading, setCnLoading] = useState(false);
  const [cnError, setCnError] = useState<string | null>(null);
  const [creditNotes, setCreditNotes] = useState<CreditNoteRow[]>([]);

  // Payments
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);

  // Add Payment Modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<string>("");
  const [payMethod, setPayMethod] = useState<string>("Cash");
  const [payRef, setPayRef] = useState<string>("");
  const [payNotes, setPayNotes] = useState<string>("");

  const rpUserRaw =
    typeof window !== "undefined" ? localStorage.getItem("rp_user") || "" : "";
  const rpUser = useMemo(() => {
    if (!rpUserRaw) return null;
    try {
      return JSON.parse(rpUserRaw);
    } catch {
      return null;
    }
  }, [rpUserRaw]);

  const isAdmin = String(rpUser?.role || "").toLowerCase() === "admin";

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
      const res = await fetch(`/api/credit-notes/by-invoice?invoiceId=${invoiceId}`, {
        cache: "no-store",
      });
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

  async function loadPayments(invoiceId: number | string) {
    setPayLoading(true);
    setPayError(null);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/payments`, {
        cache: "no-store",
        headers: { "x-rp-user": rpUserRaw },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load payments");
      setPayments(Array.isArray(json.payments) ? json.payments : []);
    } catch (e: any) {
      setPayError(e.message || "Failed to load payments");
      setPayments([]);
    } finally {
      setPayLoading(false);
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
    loadPayments(invId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.invoice?.id]);

  const invoice = data?.invoice;
  const items = data?.items ?? [];
  const customer = invoice?.customers;

  const invoiceDateFormatted = invoice?.invoice_date
    ? new Date(invoice.invoice_date).toLocaleDateString("en-GB")
    : "";

  const statusUpper = String(invoice?.status || "ISSUED").toUpperCase();
  const badge = statusBadge(statusUpper);

  const isPaid = statusUpper === "PAID";
  const isLocked = statusUpper !== "DRAFT"; // for later: lock editing UI when you add edit mode

  // Totals computed always
  const computed = useMemo(() => {
    const subtotal = n2(invoice?.subtotal);
    const vatAmount = n2(invoice?.vat_amount);
    const totalAmount = n2(invoice?.total_amount);
    const previousBalance = n2(invoice?.previous_balance);
    const amountPaid = n2(invoice?.amount_paid);

    const grossTotal = totalAmount + previousBalance;

    // prefer new column balance_due if present, else legacy balance_remaining, else compute
    const balance =
      invoice?.balance_due != null
        ? n2(invoice.balance_due)
        : invoice?.balance_remaining != null
        ? n2(invoice.balance_remaining)
        : Math.max(0, grossTotal - amountPaid);

    return {
      subtotal: round2(subtotal),
      vatAmount: round2(vatAmount),
      totalAmount: round2(totalAmount),
      previousBalance: round2(previousBalance),
      grossTotal: round2(grossTotal),
      amountPaid: round2(amountPaid),
      balanceDue: round2(balance),
    };
  }, [invoice]);

  const paymentsTotal = useMemo(() => {
    return round2(payments.reduce((s, p) => s + n2(p.amount), 0));
  }, [payments]);

  async function addPayment() {
    if (!invoice?.id) return;
    const amt = n2(payAmount);
    if (!amt || amt <= 0) return alert("Enter a valid payment amount (> 0).");

    setActionBusy("PAYMENT_ADD");
    setActionError(null);

    try {
      const res = await fetch(`/api/invoices/${invoice.id}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-rp-user": rpUserRaw,
        },
        body: JSON.stringify({
          amount: amt,
          method: payMethod,
          reference: payRef || "",
          notes: payNotes || "",
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to add payment");

      setPayModalOpen(false);
      setPayAmount("");
      setPayRef("");
      setPayNotes("");

      await loadInvoice();
      await loadPayments(invoice.id);
    } catch (e: any) {
      setActionError(e.message || "Failed to add payment");
    } finally {
      setActionBusy(null);
    }
  }

  async function deletePayment(paymentId: string) {
    if (!invoice?.id) return;
    if (!isAdmin) return alert("Only Admin can delete payments.");
    if (!confirm("Delete this payment? This will recalculate invoice totals/status.")) return;

    setActionBusy("PAYMENT_DELETE");
    setActionError(null);

    try {
      const res = await fetch(`/api/invoices/payments/${paymentId}`, {
        method: "DELETE",
        headers: { "x-rp-user": rpUserRaw },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to delete payment");

      await loadInvoice();
      await loadPayments(invoice.id);
    } catch (e: any) {
      setActionError(e.message || "Failed to delete payment");
    } finally {
      setActionBusy(null);
    }
  }

  if (loading) {
    return <div style={{ padding: 20, textAlign: "center" }}>Loading invoice…</div>;
  }

  if (!invoice) {
    return (
      <div style={{ padding: 20, color: "#b91c1c" }}>
        {actionError || "Invoice not found"}
      </div>
    );
  }

  return (
    <div className="rp-app rp-invoice-page">
      {/* Sidebar */}
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ fontWeight: 950, letterSpacing: 0.2 }}>Status</div>
            <span className={badge.cls}>
              <span className="rp-status-dot" />
              {badge.text}
            </span>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, fontWeight: 850, opacity: 0.8 }}>
            Total (Gross): <span style={{ opacity: 1 }}>Rs {computed.grossTotal.toFixed(2)}</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 12, fontWeight: 850, opacity: 0.8 }}>
            Paid: <span style={{ opacity: 1 }}>Rs {computed.amountPaid.toFixed(2)}</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 12, fontWeight: 900, opacity: 0.9 }}>
            Balance Due: <span style={{ opacity: 1 }}>Rs {computed.balanceDue.toFixed(2)}</span>
          </div>
        </div>

        <button
          className="btn-primary-red"
          style={{ marginTop: 14, width: "100%" }}
          onClick={() => window.print()}
          disabled={actionBusy !== null}
        >
          🖨 Print / Download PDF
        </button>

        <button
          className="btn-primary-red"
          style={{ marginTop: 10, width: "100%" }}
          onClick={() => setPayModalOpen(true)}
          disabled={actionBusy !== null}
        >
          ➕ Add Payment
        </button>

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
          style={{ width: "100%", marginTop: 10 }}
        >
          💬 WhatsApp Paid Confirmation
        </button>

        <div style={{ marginTop: 12 }}>
          <button
            className="rp-nav-item"
            onClick={() =>
              router.push(
                `/credit-notes/new?customerId=${invoice.customers?.id || ""}&invoiceId=${invoice.id}`
              )
            }
            style={{ width: "100%", marginBottom: 8 }}
          >
            ➕ Create Credit Note (for this invoice)
          </button>

          <button className="rp-nav-item" onClick={() => router.push("/credit-notes")} style={{ width: "100%" }}>
            📄 View Credit Notes
          </button>
        </div>

        {isLocked && (
          <div style={{ marginTop: 12, fontSize: 12, fontWeight: 850, opacity: 0.7 }}>
            🔒 Invoice is locked (status: {badge.text}). Editing is disabled.
          </div>
        )}

        {actionError && (
          <div style={{ marginTop: 10, color: "#fb7185", fontSize: 12 }}>
            {actionError}
          </div>
        )}
      </aside>

      {/* Main: RamPotteryDoc print layout */}
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
          company={{
            brn: null,
            vat_no: null,
          }}
          items={items.map((r, idx) => {
            const box_qty = n2(r.box_qty);
            const units_per_box = n2(r.units_per_box);
            const total_qty = n2(r.total_qty);

            const unit_price_excl_vat = n2(r.unit_price_excl_vat);
            const unit_vat = n2(r.unit_vat);

            const unit_price_incl_vat = n2(
              (r.unit_price_incl_vat ?? unit_price_excl_vat + unit_vat) || 0
            );
            const line_total = n2((r.line_total ?? unit_price_incl_vat * total_qty) || 0);

            return {
              sn: idx + 1,
              item_code: r.products?.item_code || "",
              box_qty,
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
            total_amount: computed.totalAmount,
            previous_balance: computed.previousBalance,
            amount_paid: computed.amountPaid,
            balance_remaining: computed.balanceDue,
          }}
          preparedBy={null}
          deliveredBy={null}
        />

        {/* Payments table (screen only) */}
        <div className="print-hidden" style={{ maxWidth: 920, margin: "12px auto 18px" }}>
          <div className="card">
            <div className="panel-title" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <span>Payments</span>
              <span style={{ fontSize: 12, fontWeight: 900, opacity: 0.75 }}>
                Payments total: Rs {paymentsTotal.toFixed(2)}
              </span>
            </div>

            {payLoading ? (
              <p style={{ marginTop: 8 }}>Loading…</p>
            ) : payError ? (
              <p style={{ marginTop: 8, color: "#b91c1c" }}>{payError}</p>
            ) : payments.length === 0 ? (
              <p style={{ marginTop: 8, opacity: 0.8 }}>No payments recorded yet.</p>
            ) : (
              <div style={{ overflowX: "auto", marginTop: 10 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Method</th>
                      <th>Reference</th>
                      <th>Notes</th>
                      <th style={{ textAlign: "right" }}>Amount</th>
                      <th style={{ width: 90 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td>
                          {p.payment_date
                            ? new Date(p.payment_date).toLocaleDateString("en-GB")
                            : "—"}
                        </td>
                        <td style={{ fontWeight: 950 }}>{String(p.method || "—")}</td>
                        <td>{p.reference || "—"}</td>
                        <td style={{ maxWidth: 320, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {p.notes || "—"}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 950 }}>
                          Rs {n2(p.amount).toFixed(2)}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {isAdmin ? (
                            <button
                              className="btn btn-ghost"
                              disabled={actionBusy !== null}
                              onClick={() => deletePayment(p.id)}
                              title="Admin: delete payment"
                            >
                              Delete
                            </button>
                          ) : (
                            <span style={{ fontSize: 12, opacity: 0.6 }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="btn-primary-red" onClick={() => setPayModalOpen(true)} disabled={actionBusy !== null}>
                ➕ Add Payment
              </button>
              <button className="rp-nav-item" onClick={() => invoice?.id && loadPayments(invoice.id)} disabled={actionBusy !== null}>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Credit notes linked table (screen only) */}
        <div className="print-hidden" style={{ maxWidth: 920, margin: "12px auto 40px" }}>
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
                        <td>
                          {cn.credit_note_date
                            ? new Date(cn.credit_note_date).toLocaleDateString("en-GB")
                            : "—"}
                        </td>
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

      {/* Add Payment Modal */}
      {payModalOpen ? (
        <div className="rp-modal-backdrop print-hidden" role="dialog" aria-modal="true">
          <div className="rp-modal">
            <div className="rp-modal-head">
              <div className="rp-modal-title">Add Payment</div>
              <button className="rp-modal-x" onClick={() => setPayModalOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="rp-modal-body">
              <div className="rp-form-grid">
                <div>
                  <div className="rp-label">Amount (Rs)</div>
                  <input
                    className="rp-input-plain"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="e.g. 500.00"
                    inputMode="decimal"
                  />
                </div>

                <div>
                  <div className="rp-label">Method</div>
                  <select className="rp-input-plain" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                    <option value="Cash">Cash</option>
                    <option value="Juice">Juice</option>
                    <option value="Bank">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <div className="rp-label">Reference (optional)</div>
                  <input
                    className="rp-input-plain"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    placeholder="Txn / cheque no."
                  />
                </div>

                <div>
                  <div className="rp-label">Notes (optional)</div>
                  <input
                    className="rp-input-plain"
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                    placeholder="Any note"
                  />
                </div>
              </div>

              <div style={{ marginTop: 12, fontSize: 12, fontWeight: 900, opacity: 0.75 }}>
                After saving, invoice status updates automatically (ISSUED / PARTIALLY PAID / PAID).
              </div>
            </div>

            <div className="rp-modal-foot">
              <button className="rp-nav-item" onClick={() => setPayModalOpen(false)} disabled={actionBusy !== null}>
                Cancel
              </button>
              <button className="btn-primary-red" onClick={addPayment} disabled={actionBusy !== null}>
                {actionBusy === "PAYMENT_ADD" ? "Saving…" : "Save Payment"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
