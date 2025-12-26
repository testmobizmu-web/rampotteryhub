"use client";

import Image from "next/image";
import React, { useMemo, useRef } from "react";

export type InvoiceRow = {
  id: string;
  product_id: string | null;
  item_code: string;
  description: string;
  box_qty: number;
  units_per_box: number;
  total_qty: number;
  unit_price_excl_vat: number;
  unit_vat: number;
  unit_price_incl_vat: number;
  line_total: number;
};

export type PartyLite = {
  name: string;
  address: string;
  phone: string;
  brn: string;
  vat_no: string;
  customer_code: string;
};

export type NewInvoiceDocProps = {
  title?: string;
  onSave: () => void;
  onCancel: () => void;
  onAddRow: () => void;
  saving?: boolean;

  companyName: string;
  companySubtitle?: string;
  companyAddressLines: string[];
  companyTelLine?: string;
  companyEmail?: string;
  companyWeb?: string;
  companyBrnVatText?: string;

  invoiceNoPreview?: string;
  invoiceDate: string;
  purchaseOrderNo: string;
  salesRep: string;
  salesRepPhone: string;

  onInvoiceDateChange: (val: string) => void;
  onPurchaseOrderNoChange: (val: string) => void;
  onSalesRepChange: (val: string) => void;
  onSalesRepPhoneChange: (val: string) => void;

  customerSelectNode: React.ReactNode;
  customer: PartyLite;

  rows: InvoiceRow[];
  products: Array<{
    id: string;
    item_code: string;
    name: string;
    price_excl_vat?: number | null;
  }>;

  // 🔑 Partywise pricing map (productId -> priceExclVat)
  customerPriceMap: Record<number, number>;

  onRowChange: (rowId: string, patch: Partial<InvoiceRow>) => void;
  onRemoveRow: (rowId: string) => void;

  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  previousBalance: number;
  grossTotal: number;
  amountPaid: number;
  balanceRemaining: number;
};

function n2(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}
function fmtMoney(v: number) {
  return n2(v).toFixed(2);
}
function cleanNumberString(s: string) {
  return s.replace(/[^\d.-]/g, "");
}

type AnyEl = HTMLElement;
function focusEl(el?: AnyEl | null) {
  if (!el) return;
  el.focus();
  if ((el as any).isContentEditable) {
    const r = document.createRange();
    r.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(r);
  }
}

function EditableCE({
  value,
  placeholder,
  align = "left",
  numeric = false,
  onCommit,
  onKeyDown,
  elRef,
  readOnly,
}: {
  value: string | number;
  placeholder?: string;
  align?: "left" | "center" | "right";
  numeric?: boolean;
  onCommit: (val: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  elRef?: React.RefObject<HTMLDivElement | null>;
  readOnly?: boolean;
}) {
  const display = value === null || value === undefined ? "" : String(value);

  return (
    <div
      ref={elRef as any}
      className={`rp-ce rp-ce-${align} ${readOnly ? "rp-ce-readonly" : ""}`}
      contentEditable={!readOnly}
      suppressContentEditableWarning
      data-placeholder={placeholder || ""}
      onKeyDown={onKeyDown}
      onPaste={(e) => {
        if (readOnly) return;
        e.preventDefault();
        const txt = e.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, txt);
      }}
      onBlur={(e) => {
        if (readOnly) return;
        const raw = (e.currentTarget.textContent ?? "").trim();
        const val = numeric ? cleanNumberString(raw) : raw;
        onCommit(val);
      }}
    >
      {display}
    </div>
  );
}

export default function NewInvoiceDoc(props: NewInvoiceDocProps) {
  const {
    title = "New Invoice",
    onSave,
    onCancel,
    onAddRow,
    saving,

    companyName,
    companySubtitle,
    companyAddressLines,
    companyTelLine,
    companyEmail,
    companyWeb,
    companyBrnVatText,

    invoiceNoPreview,
    invoiceDate,
    purchaseOrderNo,
    salesRep,
    salesRepPhone,

    onInvoiceDateChange,
    onPurchaseOrderNoChange,
    onSalesRepChange,
    onSalesRepPhoneChange,

    customerSelectNode,
    customer,

    rows,
    products,
    customerPriceMap,
    onRowChange,
    onRemoveRow,

    subtotal,
    vatAmount,
    totalAmount,
    previousBalance,
    grossTotal,
    amountPaid,
    balanceRemaining,
  } = props;

  const anyCustomerPriceApplied = useMemo(() => {
    return rows.some((r) => r.product_id && customerPriceMap[Number(r.product_id)] !== undefined);
  }, [rows, customerPriceMap]);

  // Keyboard focus refs (rowId -> refs)
  const refs = useRef<Record<string, { box?: HTMLDivElement | null; upb?: HTMLDivElement | null; price?: HTMLDivElement | null }>>({});

  function setRef(rowId: string, key: "box" | "upb" | "price", el: HTMLDivElement | null) {
    refs.current[rowId] = refs.current[rowId] || {};
    refs.current[rowId][key] = el;
  }

  function jump(rowIndex: number, key: "box" | "upb" | "price") {
    const row = rows[rowIndex];
    if (!row) return;
    const el = refs.current[row.id]?.[key];
    focusEl(el);
  }

  return (
    <div className="rp-page">
      <div className="rp-container">
        {/* Toolbar */}
        <div className="rp-toolbar">
          <div>
            <h1 className="rp-h1">{title}</h1>
            <p className="rp-subtitle">
              Premium invoice editor • VAT 15%
              {anyCustomerPriceApplied ? (
                <>
                  {" "}
                  • <span className="rp-status rp-status-pending"><span className="rp-status-dot" />Customer pricing active</span>
                </>
              ) : null}
            </p>
          </div>
          <div className="rp-actions">
            <button className="rp-btn-red" type="button" onClick={onAddRow}>
              + Add Row
            </button>
            <button className="rp-btn-red" type="button" onClick={onSave} disabled={!!saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button className="rp-btn-red-outline" type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>

        {/* Document card */}
        <div className="rp-card">
          <div style={{ padding: 18 }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Image src="/images/logo/logo.png" alt="Ram Pottery" width={54} height={54} />
                <div>
                  <div style={{ fontWeight: 950, fontSize: 18 }}>{companyName}</div>
                  <div style={{ fontWeight: 900, opacity: 0.75 }}>{companySubtitle || "VAT INVOICE"}</div>
                  <div style={{ marginTop: 6, fontWeight: 800, opacity: 0.75, lineHeight: 1.4 }}>
                    {companyAddressLines.map((l, i) => (
                      <div key={i}>{l}</div>
                    ))}
                    {companyTelLine ? <div>{companyTelLine}</div> : null}
                    {companyEmail ? <div>{companyEmail}</div> : null}
                    {companyWeb ? <div>{companyWeb}</div> : null}
                    {companyBrnVatText ? <div>{companyBrnVatText}</div> : null}
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div style={{ minWidth: 320 }}>
                <div className="rp-meta-grid">
                  <div className="rp-meta-label">INVOICE NO:</div>
                  <div className="rp-meta-value">{invoiceNoPreview || "—"}</div>

                  <div className="rp-meta-label">DATE:</div>
                  <input
                    className="rp-input-premium"
                    value={invoiceDate}
                    onChange={(e) => onInvoiceDateChange(e.target.value)}
                    style={{ width: 160 }}
                  />

                  <div className="rp-meta-label">PURCHASE ORDER NO:</div>
                  <input
                    className="rp-input-premium"
                    value={purchaseOrderNo}
                    onChange={(e) => onPurchaseOrderNoChange(e.target.value)}
                    placeholder="Optional"
                  />

                  <div className="rp-meta-label">SALES REP:</div>
                  <input
                    className="rp-input-premium"
                    value={salesRep}
                    onChange={(e) => onSalesRepChange(e.target.value)}
                    placeholder="Name"
                  />

                  <div className="rp-meta-label">TEL:</div>
                  <input
                    className="rp-input-premium"
                    value={salesRepPhone}
                    onChange={(e) => onSalesRepPhoneChange(e.target.value)}
                    placeholder="Phone"
                  />
                </div>
              </div>
            </div>

            {/* Customer */}
            <div style={{ marginTop: 16, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
              <div style={{ minWidth: 320 }}>
                <div style={{ fontWeight: 950, marginBottom: 6 }}>BILL TO</div>
                {customerSelectNode}
              </div>

              <div style={{ flex: 1 }}>
                <div className="rp-customer-box">
                  <div style={{ fontWeight: 950, fontSize: 14 }}>
                    {customer.name || "—"}
                    {customer.customer_code ? (
                      <span style={{ marginLeft: 8, opacity: 0.7 }}>({customer.customer_code})</span>
                    ) : null}
                  </div>
                  <div style={{ opacity: 0.8, marginTop: 4, whiteSpace: "pre-line" }}>
                    {customer.address || "—"}
                  </div>
                  <div style={{ opacity: 0.8, marginTop: 6 }}>
                    {customer.phone ? `Tel: ${customer.phone}` : "Tel: —"}{" "}
                    {customer.vat_no ? ` • VAT: ${customer.vat_no}` : ""}{" "}
                    {customer.brn ? ` • BRN: ${customer.brn}` : ""}
                  </div>
                </div>
              </div>
            </div>

            {/* Items table */}
            <div className="rp-table-wrap" style={{ marginTop: 16 }}>
              <table className="rp-table">
                <thead>
                  <tr>
                    <th style={{ width: 70 }}>S/N</th>
                    <th style={{ width: 260 }}>PRODUCT</th>
                    <th style={{ width: 110, textAlign: "right" }}>BOX</th>
                    <th style={{ width: 120, textAlign: "right" }}>UNITS/BOX</th>
                    <th style={{ width: 120, textAlign: "right" }}>QTY</th>
                    <th>DESCRIPTION</th>
                    <th style={{ width: 150, textAlign: "right" }}>UNIT (Excl)</th>
                    <th style={{ width: 170, textAlign: "right" }}>LINE TOTAL</th>
                    <th style={{ width: 90 }} />
                  </tr>
                </thead>

                <tbody>
                  {rows.map((r, idx) => {
                    const pidNum = r.product_id ? Number(r.product_id) : null;
                    const customerOverride = pidNum !== null && customerPriceMap[pidNum] !== undefined;
                    const badge = customerOverride ? (
                      <div style={{ marginTop: 6, display: "flex", justifyContent: "flex-end" }}>
                        <span className="rp-status rp-status-pending" title="This unit price comes from customer-specific pricing.">
                          <span className="rp-status-dot" />
                          Customer price applied
                        </span>
                      </div>
                    ) : null;

                    return (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 950 }}>{idx + 1}</td>

                        <td>
                          <select
                            className="rp-input-premium"
                            value={r.product_id ?? ""}
                            onChange={(e) => {
                              const pid = e.target.value || null;
                              const p = products.find((x) => x.id === pid);

                              let price = n2(p?.price_excl_vat ?? 0);
                              if (pid && customerPriceMap[Number(pid)] !== undefined) {
                                price = n2(customerPriceMap[Number(pid)]);
                              }

                              onRowChange(r.id, {
                                product_id: pid,
                                item_code: p?.item_code || "",
                                description: p?.name || "",
                                unit_price_excl_vat: price,
                              });
                            }}
                          >
                            <option value="">Select…</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {(p.item_code ? `${p.item_code} — ` : "") + p.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td style={{ textAlign: "right" }}>
                          <EditableCE
                            value={r.box_qty}
                            numeric
                            align="right"
                            onCommit={(val) => onRowChange(r.id, { box_qty: n2(val) })}
                            elRef={{
                              get current() {
                                return null;
                              },
                              set current(el: HTMLDivElement | null) {
                                setRef(r.id, "box", el);
                              },
                            } as any}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                jump(idx, "upb");
                              }
                            }}
                          />
                        </td>

                        <td style={{ textAlign: "right" }}>
                          <EditableCE
                            value={r.units_per_box}
                            numeric
                            align="right"
                            onCommit={(val) => onRowChange(r.id, { units_per_box: n2(val) })}
                            elRef={{
                              get current() {
                                return null;
                              },
                              set current(el: HTMLDivElement | null) {
                                setRef(r.id, "upb", el);
                              },
                            } as any}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                jump(idx, "price");
                              }
                            }}
                          />
                        </td>

                        <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 900 }}>
                          {fmtMoney(r.total_qty)}
                        </td>

                        <td>
                          <div style={{ fontWeight: 900, opacity: 0.9 }}>{r.item_code || ""}</div>
                          <div style={{ opacity: 0.85 }}>{r.description || ""}</div>
                        </td>

                        <td style={{ textAlign: "right" }}>
                          <EditableCE
                            value={fmtMoney(r.unit_price_excl_vat)}
                            numeric
                            align="right"
                            readOnly={customerOverride} // 🔒 lock if customer-specific price
                            onCommit={(val) => {
                              if (customerOverride) return;
                              onRowChange(r.id, { unit_price_excl_vat: n2(val) });
                            }}
                            elRef={{
                              get current() {
                                return null;
                              },
                              set current(el: HTMLDivElement | null) {
                                setRef(r.id, "price", el);
                              },
                            } as any}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.preventDefault();
                            }}
                          />
                          {badge}
                        </td>

                        <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 950 }}>
                          {fmtMoney(r.line_total)}
                        </td>

                        <td style={{ textAlign: "right" }}>
                          <button className="rp-btn-red-outline" type="button" onClick={() => onRemoveRow(r.id)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="rp-totals" style={{ marginTop: 16 }}>
              <div className="rp-totals-box">
                <div className="rp-trow">
                  <div className="rp-tlabel">SUBTOTAL (Excl VAT)</div>
                  <div className="rp-tval">Rs {fmtMoney(subtotal)}</div>
                </div>
                <div className="rp-trow">
                  <div className="rp-tlabel">VAT 15%</div>
                  <div className="rp-tval">Rs {fmtMoney(vatAmount)}</div>
                </div>
                <div className="rp-trow rp-trow-strong">
                  <div className="rp-tlabel">TOTAL</div>
                  <div className="rp-tval">Rs {fmtMoney(totalAmount)}</div>
                </div>

                <div className="rp-trow" style={{ marginTop: 10 }}>
                  <div className="rp-tlabel">PREVIOUS BALANCE</div>
                  <div className="rp-tval">Rs {fmtMoney(previousBalance)}</div>
                </div>
                <div className="rp-trow rp-trow-strong">
                  <div className="rp-tlabel">GROSS TOTAL</div>
                  <div className="rp-tval">Rs {fmtMoney(grossTotal)}</div>
                </div>
                <div className="rp-trow">
                  <div className="rp-tlabel">AMOUNT PAID</div>
                  <div className="rp-tval">Rs {fmtMoney(amountPaid)}</div>
                </div>
                <div className="rp-trow rp-trow-strong">
                  <div className="rp-tlabel">BALANCE REMAINING</div>
                  <div className="rp-tval">Rs {fmtMoney(balanceRemaining)}</div>
                </div>
              </div>
            </div>

            {/* Print hint */}
            <div style={{ marginTop: 12, fontWeight: 900, opacity: 0.65 }}>
              Tip: When “Customer price applied” appears, unit price is locked to the customer’s rate.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
