"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { rpFetch } from "@/lib/rpFetch";
import RamPotteryDoc from "@/components/RamPotteryDoc";

type CustomerRow = {
  id: number;
  name: string;
  address: string;
  phone: string;
  brn: string;
  vat_no: string;
  customer_code: string;
};

type ProductRow = {
  id: number;
  item_code: string;
  sku: string;
  name: string;
  description: string;
  units_per_box: number | null;
  price_excl_vat: number | null;
  vat_rate: number | null; // percent (15 / 0)
};

type Uom = "BOX" | "PCS";

type InvoiceLine = {
  id: string;
  product_id: number | null;
  item_code: string;
  description: string;

  uom: Uom;
  box_qty: number; // for PCS we still use this input as qty
  units_per_box: number;
  total_qty: number;

  vat_rate: number; // 0 or 15
  unit_price_excl_vat: number;
  unit_vat: number;
  unit_price_incl_vat: number;
  line_total: number;
};

function n2(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}
function money(v: any) {
  const x = n2(v);
  return x.toFixed(2);
}
function uid() {
  try {
    return crypto.randomUUID();
  } catch {
    return String(Date.now()) + "-" + Math.random().toString(16).slice(2);
  }
}

function recalc(row: InvoiceLine): InvoiceLine {
  const qtyInput = Math.max(0, n2(row.box_qty));
  const uom: Uom = row.uom === "PCS" ? "PCS" : "BOX";
  const upb = uom === "PCS" ? 1 : Math.max(1, Math.trunc(n2(row.units_per_box) || 1));

  const totalQty = uom === "PCS" ? Math.trunc(qtyInput) : Math.trunc(qtyInput * upb);

  const unitEx = Math.max(0, n2(row.unit_price_excl_vat));
  const rate = row.vat_rate === 0 ? 0 : 15;
  const unitVat = unitEx * (rate / 100);
  const unitInc = unitEx + unitVat;

  return {
    ...row,
    uom,
    units_per_box: upb,
    total_qty: totalQty,
    vat_rate: rate,
    unit_vat: unitVat,
    unit_price_incl_vat: unitInc,
    line_total: totalQty * unitInc,
  };
}

function blankLine(): InvoiceLine {
  return recalc({
    id: uid(),
    product_id: null,
    item_code: "",
    description: "",
    uom: "BOX",
    box_qty: 0,
    units_per_box: 1,
    total_qty: 0,
    vat_rate: 15,
    unit_price_excl_vat: 0,
    unit_vat: 0,
    unit_price_incl_vat: 0,
    line_total: 0,
  });
}

function roleUpper(r?: string) {
  return String(r || "").toUpperCase();
}
function canDuplicate(role?: string) {
  const r = roleUpper(role);
  return r === "ADMIN" || r === "MANAGER";
}

export default function NewInvoiceClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const duplicateId = searchParams.get("duplicate");

  const [saving, setSaving] = useState(false);

  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);

  const [customerId, setCustomerId] = useState<number | null>(null);
  const [invoiceDate, setInvoiceDate] = useState<string>("");
  const [purchaseOrderNo, setPurchaseOrderNo] = useState("");

  const [salesRep, setSalesRep] = useState("Mr Koushal");
  const [salesRepPhone, setSalesRepPhone] = useState("59193239");

  const [previousBalance, setPreviousBalance] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);

  const [vatPercent, setVatPercent] = useState<number>(15);

  const [invoiceNumber, setInvoiceNumber] = useState<string>("(Auto when saved)");
  const [lines, setLines] = useState<InvoiceLine[]>([]);

  // ✅ screen-only duplication badge
  const [dupFromNo, setDupFromNo] = useState<string | null>(null);

  // ✅ role guard for duplicate
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("rp_user");
      if (raw) {
        const u = JSON.parse(raw);
        setRole(String(u?.role || ""));
      }
    } catch {}
  }, []);

  useEffect(() => {
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setLines([blankLine()]);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          rpFetch("/api/customers/list", { cache: "no-store" }),
          rpFetch("/api/products/list", { cache: "no-store" }),
        ]);

        const cJson = cRes.ok ? await cRes.json() : {};
        const pJson = pRes.ok ? await pRes.json() : {};

        if (!alive) return;
        setCustomers(cJson.customers || []);
        setProducts(pJson.products || []);
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ✅ DUPLICATE PREFILL + ROLE LOCK + WARNING BADGE
  useEffect(() => {
    if (!duplicateId) return;

    // lock duplicate for admin/manager only
    if (!canDuplicate(role)) {
      alert("Only Admin / Manager can duplicate invoices.");
      router.replace("/invoices");
      return;
    }

    let alive = true;

    (async () => {
      try {
        const res = await rpFetch(`/api/invoices/${duplicateId}`, { cache: "no-store" });
        const json = await res.json();
        if (!json?.ok || !alive) return;

        const inv = json.invoice;
        const items = json.items || [];

        // badge: "Duplicated from INV-xxx" (screen only)
        setDupFromNo(String(inv.invoice_number || duplicateId));

        // Header
        setCustomerId(inv.customer_id);
        setPurchaseOrderNo(inv.purchase_order_no || "");
        setSalesRep(inv.sales_rep || "Mr Koushal");
        setSalesRepPhone(inv.sales_rep_phone || "");
        setVatPercent(inv.vat_percent ?? 15);

        // reset payments
        setPreviousBalance(0);
        setAmountPaid(0);

        // Items
        const cloned = items.map((it: any) =>
          recalc({
            id: uid(),
            product_id: it.product_id,
            item_code: it.products?.item_code || "",
            description: it.products?.name || "",
            uom: it.uom || "BOX",
            box_qty: it.box_qty || 0,
            units_per_box: it.units_per_box || 1,
            total_qty: it.total_qty || 0,
            vat_rate: it.unit_vat > 0 ? 15 : 0,
            unit_price_excl_vat: it.unit_price_excl_vat || 0,
            unit_vat: it.unit_vat || 0,
            unit_price_incl_vat: it.unit_price_incl_vat || 0,
            line_total: it.line_total || 0,
          })
        );

        setLines(cloned.length ? cloned : [blankLine()]);
      } catch {
        // fail silently
      }
    })();

    return () => {
      alive = false;
    };
  }, [duplicateId, role, router]);

  const customer = useMemo(
    () => customers.find((c) => c.id === customerId) || null,
    [customers, customerId]
  );

  const realLines = useMemo(() => lines.filter((l) => !!l.product_id), [lines]);

  const subtotal = useMemo(() => {
    return realLines.reduce((sum, r) => sum + n2(r.total_qty) * n2(r.unit_price_excl_vat), 0);
  }, [realLines]);

  const vatAmount = useMemo(() => subtotal * (n2(vatPercent) / 100), [subtotal, vatPercent]);
  const totalAmount = useMemo(() => subtotal + vatAmount, [subtotal, vatAmount]);
  const grossTotal = useMemo(() => totalAmount + n2(previousBalance), [totalAmount, previousBalance]);
  const balanceRemaining = useMemo(() => Math.max(0, grossTotal - n2(amountPaid)), [grossTotal, amountPaid]);

  function setLine(id: string, patch: Partial<InvoiceLine>) {
    setLines((prev) => prev.map((r) => (r.id === id ? recalc({ ...r, ...patch } as InvoiceLine) : r)));
  }

  function addRow() {
    setLines((prev) => [...prev, blankLine()]);
  }

  function removeRow(id: string) {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  }

  async function onSave() {
  if (!customerId) return alert("Please select a customer.");
  if (!invoiceDate) return alert("Please select invoice date.");
  if (realLines.length === 0) return alert("Please add at least one item.");

  setSaving(true);

  try {
    const payload = {
      customerId,
      invoiceDate,
      purchaseOrderNo: purchaseOrderNo || null,
      salesRep: salesRep || null,
      salesRepPhone: salesRepPhone || null,
      vatPercent: n2(vatPercent),
      previousBalance: n2(previousBalance),
      amountPaid: n2(amountPaid),
      discountPercent: 0,

      items: realLines.map((l) => {
        const qty = Math.trunc(n2(l.box_qty)) || 1;

        return {
          product_id: l.product_id,
          description: l.description || null,

          uom: l.uom,

          // 🔒 never NULL (DB constraint)
          box_qty: qty,
          pcs_qty: l.uom === "PCS" ? qty : null,

          units_per_box: Math.trunc(n2(l.units_per_box)),
          total_qty: Math.trunc(n2(l.total_qty)),

          unit_price_excl_vat: n2(l.unit_price_excl_vat),
          vat_rate: n2(l.vat_rate),
          unit_vat: n2(l.unit_vat),
          unit_price_incl_vat: n2(l.unit_price_incl_vat),
          line_total: n2(l.line_total),
        };
      }),
    };

    const res = await rpFetch("/api/invoices/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.ok) {
      throw new Error(json?.error || "Failed to create invoice");
    }

    setInvoiceNumber(String(json.invoiceNumber || "(Saved)"));
    alert(`Invoice saved: ${json.invoiceNumber || ""}`);
  } catch (err: any) {
    alert(err?.message || "Failed to create invoice");
  } finally {
    setSaving(false);
  }
}

  function onPrint() {
    window.print();
  }

  const docItems = useMemo(() => {
    return realLines.map((r, i) => ({
      sn: i + 1,
      item_code: r.item_code,
      uom: r.uom,
      box_qty: Math.trunc(n2(r.box_qty)),
      units_per_box: Math.trunc(n2(r.units_per_box)),
      total_qty: Math.trunc(n2(r.total_qty)),
      description: r.description,
      unit_price_excl_vat: n2(r.unit_price_excl_vat),
      unit_vat: n2(r.unit_vat),
      unit_price_incl_vat: n2(r.unit_price_incl_vat),
      line_total: n2(r.line_total),
    }));
  }, [realLines]);

  return (
    <div className="inv-page">
      {/* Screen actions */}
      <div className="inv-actions inv-screen">
        <button className="rp-btn rp-btn--ghost" onClick={() => router.back()}>
          ← Back
        </button>

        <div className="inv-actions-right">
          <button className="rp-btn" onClick={addRow}>
            + Add Row
          </button>
          <button className="rp-btn" onClick={onPrint}>
            Print
          </button>
          <button className="rp-btn rp-btn--primary" onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : "Save Invoice"}
          </button>
        </div>
      </div>

      {/* Screen Form */}
      <div className="inv-screen inv-form-shell">
        <div className="inv-form-card">
          <div className="inv-form-head">
            <div>
              <div className="inv-form-title">New VAT Invoice</div>
              <div className="inv-form-sub">A4 Print Template Locked (Ram Pottery)</div>

              {/* ✅ Warning badge (screen only, print-hidden) */}
              {dupFromNo ? (
                <div className="inv-dup-badge">
                  Duplicated from <b>{dupFromNo}</b>
                </div>
              ) : null}
            </div>

            <div className="inv-form-meta">
              <div className="inv-meta-row">
                <span className="inv-meta-k">Invoice No</span>
                <span className="inv-meta-v">{invoiceNumber}</span>
              </div>
              <div className="inv-meta-row">
                <span className="inv-meta-k">Date</span>
                <span className="inv-meta-v">{invoiceDate || "—"}</span>
              </div>
            </div>
          </div>

          <div className="inv-form-grid">
            <div className="inv-field">
              <label>Customer</label>
              <select
                className="inv-input"
                value={customerId ?? ""}
                onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Select…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="inv-help">
                {customer ? (
                  <>
                    <span>{customer.address}</span> · <span>{customer.phone}</span>
                  </>
                ) : (
                  <span>Select a customer to auto-fill details</span>
                )}
              </div>
            </div>

            <div className="inv-field">
              <label>Invoice Date</label>
              <input className="inv-input" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
            </div>

            <div className="inv-field">
              <label>Purchase Order No (optional)</label>
              <input className="inv-input" value={purchaseOrderNo} onChange={(e) => setPurchaseOrderNo(e.target.value)} placeholder="Optional" />
            </div>

            <div className="inv-field">
              <label>Sales Rep</label>
              <input className="inv-input" value={salesRep} onChange={(e) => setSalesRep(e.target.value)} />
            </div>

            <div className="inv-field">
              <label>Sales Rep Phone</label>
              <input className="inv-input" value={salesRepPhone} onChange={(e) => setSalesRepPhone(e.target.value)} />
            </div>

            <div className="inv-field">
              <label>VAT %</label>
              <select className="inv-input" value={vatPercent} onChange={(e) => setVatPercent(n2(e.target.value) === 0 ? 0 : 15)}>
                <option value={15}>15%</option>
                <option value={0}>0%</option>
              </select>
            </div>

            <div className="inv-field">
              <label>Previous Balance</label>
              <input className="inv-input inv-input--right" value={previousBalance} onChange={(e) => setPreviousBalance(n2(e.target.value))} />
            </div>

            <div className="inv-field">
              <label>Amount Paid</label>
              <input className="inv-input inv-input--right" value={amountPaid} onChange={(e) => setAmountPaid(n2(e.target.value))} />
            </div>
          </div>

          <div className="inv-items-card">
            <div className="inv-items-head">
              <div>
                <div className="inv-items-title">Items</div>
                <div className="inv-items-sub">BOX / PCS supported (stock updated correctly)</div>
              </div>

              <div className="inv-items-totals">
                <div className="inv-pill">
                  <span className="k">Sub</span>
                  <span className="v">Rs {money(subtotal)}</span>
                </div>
                <div className="inv-pill">
                  <span className="k">VAT</span>
                  <span className="v">Rs {money(vatAmount)}</span>
                </div>
                <div className="inv-pill inv-pill--strong">
                  <span className="k">Total</span>
                  <span className="v">Rs {money(totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="inv-items-table">
              <div className="inv-items-th">
                <div>Item Code</div>
                <div>UOM + Qty</div>
                <div>Unit/Box</div>
                <div>Total Qty</div>
                <div>Description</div>
                <div className="right">Unit Ex</div>
                <div>VAT</div>
                <div className="right">Unit Inc</div>
                <div className="right">Line Total</div>
                <div className="center"> </div>
              </div>

              {lines.map((r) => (
                <div key={r.id} className="inv-items-tr">
                  <div>
                    <select
                      className="inv-input inv-input--tight"
                      value={r.product_id ?? ""}
                      onChange={(e) => {
                        const pid = e.target.value ? Number(e.target.value) : null;
                        const p = products.find((x) => x.id === pid) || null;

                        if (!pid || !p) {
                          setLine(r.id, {
                            product_id: null,
                            item_code: "",
                            description: "",
                            units_per_box: 1,
                            unit_price_excl_vat: 0,
                            vat_rate: 15,
                            uom: "BOX",
                            box_qty: 0,
                          });
                          return;
                        }

                        setLine(r.id, {
                          product_id: pid,
                          item_code: p.item_code || p.sku || "",
                          description: (p.description || p.name || "").trim(),
                          units_per_box: Math.max(1, n2(p.units_per_box ?? 1)),
                          unit_price_excl_vat: n2(p.price_excl_vat ?? 0),
                          vat_rate: n2(p.vat_rate ?? 15) === 0 ? 0 : 15,
                          uom: "BOX",
                          box_qty: 1,
                        });
                      }}
                    >
                      <option value="">Select…</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.item_code || p.sku || "—"} — {p.name || ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="inv-boxcell">
                    <select className="inv-input inv-input--uom" value={r.uom} onChange={(e) => setLine(r.id, { uom: e.target.value as any })}>
                      <option value="BOX">BOX</option>
                      <option value="PCS">PCS</option>
                    </select>
                    <input
                      className="inv-input inv-input--qty inv-input--center"
                      value={r.box_qty}
                      onChange={(e) => setLine(r.id, { box_qty: n2(e.target.value) })}
                    />
                  </div>

                  <div>
                    <input
                      className="inv-input inv-input--center"
                      value={r.units_per_box}
                      onChange={(e) => setLine(r.id, { units_per_box: n2(e.target.value) })}
                      disabled={r.uom === "PCS"}
                    />
                  </div>

                  <div>
                    <input className="inv-input inv-input--center" value={r.total_qty} readOnly />
                  </div>

                  <div>
                    <input className="inv-input" value={r.description} onChange={(e) => setLine(r.id, { description: e.target.value })} />
                  </div>

                  <div>
                    <input
                      className="inv-input inv-input--right"
                      value={r.unit_price_excl_vat}
                      onChange={(e) => setLine(r.id, { unit_price_excl_vat: n2(e.target.value) })}
                    />
                  </div>

                  <div>
                    <select className="inv-input inv-input--center" value={r.vat_rate} onChange={(e) => setLine(r.id, { vat_rate: n2(e.target.value) })}>
                      <option value={15}>15%</option>
                      <option value={0}>0%</option>
                    </select>
                  </div>

                  <div>
                    <input className="inv-input inv-input--right" value={money(r.unit_price_incl_vat)} readOnly />
                  </div>

                  <div>
                    <input className="inv-input inv-input--right" value={money(r.line_total)} readOnly />
                  </div>

                  <div className="center">
                    <button className="rp-icon-btn" onClick={() => removeRow(r.id)} aria-label="Remove row">
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="inv-items-foot">
              <button className="rp-btn" onClick={addRow}>
                + Add Item
              </button>

              <div className="inv-balance">
                <div className="inv-balance-row">
                  <span>Gross Total</span>
                  <b>Rs {money(grossTotal)}</b>
                </div>
                <div className="inv-balance-row">
                  <span>Balance Remaining</span>
                  <b>Rs {money(balanceRemaining)}</b>
                </div>
              </div>
            </div>
          </div>

          <div className="inv-hint">
            Print is locked to the official Ram Pottery A4 template. Page 2 appears <b>only</b> when real rows exceed page 1.
          </div>
        </div>
      </div>

      {/* PRINT ONLY */}
      <div className="inv-printonly">
        <RamPotteryDoc
          variant="INVOICE"
          docNoLabel="INVOICE NO:"
          docNoValue={invoiceNumber}
          dateLabel="DATE:"
          dateValue={invoiceDate}
          purchaseOrderLabel="PURCHASE ORDER NO:"
          purchaseOrderValue={purchaseOrderNo || ""}
          salesRepName={salesRep}
          salesRepPhone={salesRepPhone}
          customer={{
            name: customer?.name || "",
            address: customer?.address || "",
            phone: customer?.phone || "",
            brn: customer?.brn || "",
            vat_no: customer?.vat_no || "",
            customer_code: customer?.customer_code || "",
          }}
          company={{
            brn: "C17144377",
            vat_no: "123456789",
          }}
          items={docItems}
          totals={{
            subtotal,
            vatPercentLabel: `VAT ${vatPercent}%`,
            vat_amount: vatAmount,
            total_amount: totalAmount,
            previous_balance: previousBalance,
            amount_paid: amountPaid,
            balance_remaining: balanceRemaining,
          }}
          preparedBy="Manish"
          deliveredBy=""
        />
      </div>
    </div>
  );
}
