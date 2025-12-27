"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export type InvoiceRow = {
  id: string;
  product_id: number | null;
  item_code: string;
  description: string;

  // UOM
  uom: "BOX" | "PCS";

  // qty input (meaning depends on uom):
  // - BOX: box_qty = number of boxes
  // - PCS: box_qty = number of pieces
  box_qty: number;

  // only meaningful for BOX (PCS forces 1)
  units_per_box: number;

  total_qty: number;
  unit_price_excl_vat: number;
  unit_vat: number;
  unit_price_incl_vat: number;
  line_total: number;
};

type CustomerRow = {
  id: number;
  name: string | null;
  address: string | null;
  phone: string | null;
  brn: string | null;
  vat_no: string | null;
  customer_code: string | null;
};

type ProductRow = {
  id: number;
  item_code: string | null;
  name: string | null;
  price_excl_vat: number | null;
};

function n2(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function money(v: any) {
  const x = n2(v);
  return x.toFixed(2);
}

function calcRow(row: InvoiceRow) {
  const qtyInput = n2(row.box_qty);
  const upb = row.uom === "PCS" ? 1 : n2(row.units_per_box);
  const qty = row.uom === "PCS" ? qtyInput : qtyInput * upb;

  const unitEx = n2(row.unit_price_excl_vat);
  const unitVat = unitEx * 0.15;
  const unitInc = unitEx + unitVat;
  const lineTotal = qty * unitInc;

  return {
    total_qty: qty,
    unit_vat: unitVat,
    unit_price_incl_vat: unitInc,
    line_total: lineTotal,
  };
}

function newRow(): InvoiceRow {
  const id = crypto.randomUUID();
  return {
    id,
    product_id: null,
    item_code: "",
    description: "",
    uom: "BOX",
    box_qty: 1,
    units_per_box: 1,
    total_qty: 1,
    unit_price_excl_vat: 0,
    unit_vat: 0,
    unit_price_incl_vat: 0,
    line_total: 0,
  };
}

export default function NewInvoicePage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);

  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);

  const [customerId, setCustomerId] = useState<number | null>(null);

  const [invoiceDate, setInvoiceDate] = useState(todayISO());
  const [purchaseOrderNo, setPurchaseOrderNo] = useState("");
  const [salesRep, setSalesRep] = useState("");
  const [salesRepPhone, setSalesRepPhone] = useState("");

  const [rows, setRows] = useState<InvoiceRow[]>([newRow()]);

  // Partywise pricing map: productId -> priceExclVat
  const [customerPriceMap, setCustomerPriceMap] = useState<Record<number, number>>({});

  // --- load lists
  useEffect(() => {
    async function loadLists() {
      const { data: c } = await supabase
        .from("customers")
        .select("id,name,address,phone,brn,vat_no,customer_code")
        .order("name", { ascending: true });

      setCustomers((c as any) || []);

      const { data: p } = await supabase
        .from("products")
        .select("id,item_code,name,price_excl_vat")
        .order("name", { ascending: true });

      setProducts((p as any) || []);
    }

    loadLists();
  }, []);

  // --- fetch customer pricing whenever customer changes
  useEffect(() => {
    async function loadCustomerPrices() {
      if (!customerId) {
        setCustomerPriceMap({});
        return;
      }

      try {
        const raw = localStorage.getItem("rp_user") || "";
        const res = await fetch(`/api/pricing?customerId=${customerId}`, {
          headers: { "x-rp-user": raw },
        });
        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json.ok) {
          setCustomerPriceMap({});
          return;
        }

        const map: Record<number, number> = {};
        for (const r of json.rows || []) {
          const price = r.price_excl_vat ?? r.price;
          if (price !== null && price !== undefined) {
            map[Number(r.product_id)] = Number(price);
          }
        }

        setCustomerPriceMap(map);

        // OPTIONAL: re-apply partywise price to any already-selected products
        setRows((prev) =>
          prev.map((row) => {
            if (!row.product_id) return row;
            const override = map[row.product_id];
            if (override === undefined) return row;
            const merged: InvoiceRow = { ...row, unit_price_excl_vat: n2(override) };
            const computed = calcRow(merged);
            return { ...merged, ...computed };
          })
        );
      } catch {
        setCustomerPriceMap({});
      }
    }

    loadCustomerPrices();
  }, [customerId]);

  const customer = useMemo(() => {
    const c = customers.find((x) => x.id === customerId);
    return {
      name: c?.name || "",
      address: c?.address || "",
      phone: c?.phone || "",
      brn: c?.brn || "",
      vat_no: c?.vat_no || "",
      customer_code: c?.customer_code || "",
    };
  }, [customers, customerId]);

  // compute totals (same logic)
  const { subtotal, vatAmount, totalAmount } = useMemo(() => {
    const subEx = rows.reduce((sum, r) => {
      const qty = n2(r.total_qty);
      const unitEx = n2(r.unit_price_excl_vat);
      return sum + qty * unitEx;
    }, 0);

    const vat = subEx * 0.15;
    const total = subEx + vat;
    return { subtotal: subEx, vatAmount: vat, totalAmount: total };
  }, [rows]);

  const previousBalance = 0;
  const amountPaid = 0;
  const balanceRemaining = totalAmount - amountPaid;
  const grossTotal = totalAmount + previousBalance;

  function onRowChange(rowId: string, patch: Partial<InvoiceRow>) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;

        const merged: InvoiceRow = { ...r, ...patch };

        // If user sets PCS, lock units_per_box to 1
        if (patch.uom === "PCS") merged.units_per_box = 1;
        if (merged.uom === "PCS") merged.units_per_box = 1;

        const computed = calcRow(merged);
        return { ...merged, ...computed };
      })
    );
  }

  function onAddRow() {
    setRows((prev) => [...prev, newRow()]);
  }

  function onRemoveRow(rowId: string) {
    setRows((prev) => prev.filter((r) => r.id !== rowId));
  }

  async function onSave() {
    if (!customerId) {
      alert("Please select a customer.");
      return;
    }

    const cleanRows = rows
      .filter((r) => r.product_id)
      .map((r) => ({
        product_id: r.product_id as number,
        box_qty: n2(r.box_qty),
        units_per_box: r.uom === "PCS" ? 1 : n2(r.units_per_box),
        total_qty: n2(r.total_qty),
        description: r.description || "",
        unit_price_excl_vat: n2(r.unit_price_excl_vat),
        unit_vat: n2(r.unit_vat),
        unit_price_incl_vat: n2(r.unit_price_incl_vat),
        line_total: n2(r.line_total),
      }));

    if (cleanRows.length === 0) {
      alert("Please add at least 1 product row.");
      return;
    }

    setSaving(true);
    try {
      const raw = localStorage.getItem("rp_user") || "";

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-rp-user": raw,
        },
        body: JSON.stringify({
          customer_id: customerId,
          invoice_date: invoiceDate,
          purchase_order_no: purchaseOrderNo || null,
          sales_rep: salesRep || null,
          sales_rep_phone: salesRepPhone || null,
          items: cleanRows,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.ok === false) {
        throw new Error(json.error || "Failed to create invoice");
      }

      const newId =
        json.invoiceId ?? json.id ?? json.invoice?.id ?? json.data?.id ?? null;

      if (!newId) {
        alert("Invoice saved, but could not detect invoice ID. Please check the invoices list.");
        router.push("/invoices");
        return;
      }

      router.push(`/invoices/${newId}`);
    } catch (e: any) {
      alert(e?.message || "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  }

  const company = {
    title: "RAM POTTERY LTD",
    subtitleLine1: "MANUFACTURER & IMPORTER OF QUALITY CLAY",
    subtitleLine2: "PRODUCTS AND OTHER RELIGIOUS ITEMS",
    address: "Robert Kennedy Street, Reunion Maurel, Petit Raffray - Mauritius",
    tel: "Tel: +230 57788884  +230 58060268  +230 52522844",
    email: "Email: info@rampottery.com",
    web: "Web: www.rampottery.com",
    brnVat: "BRN: C17144377 | VAT: 123456789",
  };

  return (
    <>
      {/* Top actions (not printed) */}
      <div className="rp-noprint rp-toolbar">
        <button className="rp-btn" onClick={() => router.push("/invoices")}>
          ← Back
        </button>
        <button className="rp-btn" onClick={onAddRow}>
          + Add Row
        </button>
        <button className="rp-btn" onClick={() => window.print()}>
          🖨 Print
        </button>
        <button className="rp-btn rp-btn--primary" disabled={saving} onClick={onSave}>
          {saving ? "Saving…" : "Save Invoice"}
        </button>
      </div>

      {/* A4 Invoice */}
      <div className="inv-a4">
        <div className="inv-border">
          {/* Header */}
          <div className="inv-header">
            <div className="inv-logo">
              <Image
                src="/images/logo/logo.png"
                alt="Ram Pottery Logo"
                width={140}
                height={120}
                style={{ width: 140, height: 120, objectFit: "contain" }}
                priority
              />
              <div className="inv-logo-caption">
                <div className="inv-logo-caption-title">RAM POTTERY</div>
                <div className="inv-logo-caption-sub">Quality pottery</div>
              </div>
            </div>

            <div className="inv-head-center">
              <div className="inv-head-title">{company.title}</div>
              <div className="inv-head-sub">{company.subtitleLine1}</div>
              <div className="inv-head-sub">{company.subtitleLine2}</div>
              <div className="inv-head-addr">{company.address}</div>

              <div className="inv-head-contact">
                <div>
                  <span className="inv-red">Tel:</span> {company.tel.replace("Tel:", "").trim()}
                </div>
                <div>
                  <span className="inv-red">Email:</span> {company.email.replace("Email:", "").trim()}{" "}
                  <span className="inv-red">Web:</span> {company.web.replace("Web:", "").trim()}
                </div>
              </div>

              <div className="inv-vat-invoice">VAT INVOICE</div>
            </div>
          </div>

          {/* BRN/VAT red bar */}
          <div className="inv-bar">{company.brnVat}</div>

          {/* Two top boxes */}
          <div className="inv-topgrid">
            {/* CUSTOMER DETAILS */}
            <div className="inv-box">
              <div className="inv-box-title">CUSTOMER DETAILS</div>
              <div className="inv-box-body">
                <div className="inv-line">
                  <span className="inv-lab">Name:</span>
                  <span className="inv-val">
                    <select
                      className="inv-select"
                      value={customerId ?? ""}
                      onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">Select customer…</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {(c.customer_code ? `${c.customer_code} — ` : "") + (c.name || "")}
                        </option>
                      ))}
                    </select>
                  </span>
                </div>

                <div className="inv-line">
                  <span className="inv-lab">ADDRESS:</span>
                  <span className="inv-val">
                    <input className="inv-input" value={customer.address} readOnly />
                  </span>
                </div>

                <div className="inv-line">
                  <span className="inv-lab">Tel:</span>
                  <span className="inv-val">
                    <input className="inv-input" value={customer.phone} readOnly />
                  </span>
                </div>

                <div className="inv-line inv-two">
                  <div className="inv-line">
                    <span className="inv-lab">BRN:</span>
                    <span className="inv-val">
                      <input className="inv-input" value={customer.brn} readOnly />
                    </span>
                  </div>
                  <div className="inv-line">
                    <span className="inv-lab">VAT No:</span>
                    <span className="inv-val">
                      <input className="inv-input" value={customer.vat_no} readOnly />
                    </span>
                  </div>
                </div>

                <div className="inv-line">
                  <span className="inv-lab">CUSTOMER CODE:</span>
                  <span className="inv-val">
                    <input className="inv-input" value={customer.customer_code} readOnly />
                  </span>
                </div>
              </div>
            </div>

            {/* INVOICE DETAILS */}
            <div className="inv-box">
              <div className="inv-box-title">INVOICE DETAILS</div>
              <div className="inv-box-body">
                <div className="inv-line">
                  <span className="inv-lab">INVOICE NO:</span>
                  <span className="inv-val">
                    <input className="inv-input" value="(Auto)" readOnly />
                  </span>
                </div>

                <div className="inv-line">
                  <span className="inv-lab">DATE:</span>
                  <span className="inv-val">
                    <input
                      className="inv-input"
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                    />
                  </span>
                </div>

                <div className="inv-line">
                  <span className="inv-lab">PURCHASE ORDER NO:</span>
                  <span className="inv-val">
                    <input
                      className="inv-input"
                      value={purchaseOrderNo}
                      onChange={(e) => setPurchaseOrderNo(e.target.value)}
                      placeholder="Optional"
                    />
                  </span>
                </div>

                <div className="inv-line inv-two">
                  <div className="inv-line">
                    <span className="inv-lab">SALES REP:</span>
                    <span className="inv-val">
                      <input
                        className="inv-input"
                        value={salesRep}
                        onChange={(e) => setSalesRep(e.target.value)}
                        placeholder="Mr Koushal"
                      />
                    </span>
                  </div>
                  <div className="inv-line">
                    <span className="inv-lab">Tel:</span>
                    <span className="inv-val">
                      <input
                        className="inv-input"
                        value={salesRepPhone}
                        onChange={(e) => setSalesRepPhone(e.target.value)}
                        placeholder="59193239"
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items table */}
          <table className="inv-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>SN</th>
                <th style={{ width: 92 }}>ITEM CODE</th>
                <th style={{ width: 54 }}>BOX</th>
                <th style={{ width: 74 }}>
                  UNIT<br />PER BOX
                </th>
                <th style={{ width: 86 }}>TOTAL QTY</th>
                <th>DESCRIPTION</th>
                <th style={{ width: 86 }}>
                  UNIT PRICE<br />(ExclVat)
                </th>
                <th style={{ width: 56 }}>VAT</th>
                <th style={{ width: 86 }}>
                  UNIT PRICE<br />(Incl Vat)
                </th>
                <th style={{ width: 96 }}>
                  TOTAL AMOUNT<br />(Incl Vat)
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, idx) => {
                return (
                  <tr key={r.id}>
                    <td className="inv-td-center">{idx + 1}</td>

                    <td>
                      <select
                        className="inv-cell inv-select"
                        value={r.product_id ?? ""}
                        onChange={(e) => {
                          const pid = e.target.value ? Number(e.target.value) : null;
                          const p = products.find((x) => x.id === pid);

                          // price rule: customerPriceMap override -> product.price_excl_vat -> 0
                          const basePrice =
                            (pid ? customerPriceMap[pid] : undefined) ?? (p?.price_excl_vat ?? 0);

                          onRowChange(r.id, {
                            product_id: pid,
                            item_code: p?.item_code || "",
                            description: p?.name || "",
                            unit_price_excl_vat: n2(basePrice),
                          });
                        }}
                      >
                        <option value="">Select</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {(p.item_code ? `${p.item_code} — ` : "") + (p.name || "")}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* BOX column: add UOM dropdown + qty input (same styling/classes) */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <select
                          className="inv-cell inv-select"
                          value={r.uom}
                          onChange={(e) => onRowChange(r.id, { uom: e.target.value as "BOX" | "PCS" })}
                          style={{ width: 54, padding: "0 4px" }}
                          title="Unit of measure"
                        >
                          <option value="BOX">Box</option>
                          <option value="PCS">Pcs</option>
                        </select>

                        <input
                          className="inv-cell inv-num"
                          value={r.box_qty}
                          onChange={(e) => onRowChange(r.id, { box_qty: n2(e.target.value) })}
                          style={{ width: "100%" }}
                          title={r.uom === "PCS" ? "Pieces" : "Boxes"}
                        />
                      </div>
                    </td>

                    <td>
                      <input
                        className="inv-cell inv-num"
                        value={r.units_per_box}
                        readOnly={r.uom === "PCS"}
                        onChange={(e) => onRowChange(r.id, { units_per_box: n2(e.target.value) })}
                        title={r.uom === "PCS" ? "PCS mode uses 1" : "Units per box"}
                        style={r.uom === "PCS" ? { opacity: 0.7 } : undefined}
                      />
                    </td>

                    <td>
                      <input className="inv-cell inv-num" value={money(r.total_qty)} readOnly />
                    </td>

                    <td>
                      <input
                        className="inv-cell"
                        value={r.description}
                        onChange={(e) => onRowChange(r.id, { description: e.target.value })}
                      />
                    </td>

                    <td>
                      <input
                        className="inv-cell inv-num"
                        value={money(r.unit_price_excl_vat)}
                        onChange={(e) =>
                          onRowChange(r.id, { unit_price_excl_vat: n2(e.target.value) })
                        }
                      />
                    </td>

                    <td>
                      <input className="inv-cell inv-num" value={money(r.unit_vat)} readOnly />
                    </td>

                    <td>
                      <input
                        className="inv-cell inv-num"
                        value={money(r.unit_price_incl_vat)}
                        readOnly
                      />
                    </td>

                    <td>
                      <div className="inv-line-total">
                        <span>{money(r.line_total)}</span>
                        <button
                          className="rp-noprint inv-x"
                          onClick={() => onRemoveRow(r.id)}
                          title="Remove row"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* fill blank space like template */}
              {Array.from({ length: Math.max(0, 10 - rows.length) }).map((_, i) => (
                <tr key={`blank-${i}`} className="inv-blank">
                  <td>&nbsp;</td>
                  <td />
                  <td />
                  <td />
                  <td />
                  <td />
                  <td />
                  <td />
                  <td />
                  <td />
                  <td />
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bottom zone */}
          <div className="inv-bottom">
            {/* Notes */}
            <div className="inv-notes">
              <div className="inv-notes-title">Note:</div>
              <ul>
                <li>Goods once sold cannot be returned or exchanged.</li>
                <li>
                  For any other manufacturing defects, must provide this invoice for a refund or
                  exchange.
                </li>
                <li>
                  Customer must verify that the quantity of goods conforms with their invoice;
                  otherwise, we will not be responsible after delivery
                </li>
                <li>Interest of 1% above the bank rate will be charged on sum due if not settled within 30 days.</li>
                <li>
                  All cheques to be issued on <span className="inv-red">RAM POTTERY LTD</span>.
                </li>
                <li>
                  Bank transfer to <span className="inv-red">000 44 570 46 59 MCB Bank</span>
                </li>
              </ul>
            </div>

            {/* Totals box */}
            <div className="inv-totals">
              <div className="inv-trow">
                <div>SUB TOTAL</div>
                <div className="inv-tval">{money(subtotal)}</div>
              </div>
              <div className="inv-trow">
                <div>VAT 15%</div>
                <div className="inv-tval">{money(vatAmount)}</div>
              </div>
              <div className="inv-trow inv-strong">
                <div>TOTAL AMOUNT</div>
                <div className="inv-tval">{money(totalAmount)}</div>
              </div>
              <div className="inv-trow">
                <div>PREVIOUS BALANCE</div>
                <div className="inv-tval">{money(previousBalance)}</div>
              </div>
              <div className="inv-trow">
                <div>GROSS TOTAL</div>
                <div className="inv-tval">{money(grossTotal)}</div>
              </div>
              <div className="inv-trow">
                <div>AMOUNT PAID</div>
                <div className="inv-tval">{money(amountPaid)}</div>
              </div>
              <div className="inv-trow">
                <div>BALANCE REMAINING</div>
                <div className="inv-tval">{money(balanceRemaining)}</div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="inv-sign">
            <div className="inv-sig">
              <div className="inv-sig-line" />
              <div className="inv-sig-lab">Signature</div>
              <div className="inv-sig-sub">Prepared by: Manish</div>
            </div>

            <div className="inv-sig">
              <div className="inv-sig-line" />
              <div className="inv-sig-lab">Signature</div>
              <div className="inv-sig-sub">Delivered by:</div>
            </div>

            <div className="inv-sig">
              <div className="inv-sig-line" />
              <div className="inv-sig-lab">Customer Signature</div>
              <div className="inv-sig-sub">
                Customer Name: <br />
                <i>Please verify before sign</i>
              </div>
            </div>
          </div>

          {/* Footer red bar */}
          <div className="inv-thanks">
            We thank you for your purchase and look forward to being of service to you again
          </div>
        </div>
      </div>

      {/* Styles: exact template look + perfect A4 print */}
      <style jsx global>{`
        /* ========= Not printed toolbar ========= */
        .rp-toolbar {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          padding: 14px 16px;
          justify-content: center;
        }
        .rp-btn {
          border: 1px solid rgba(0, 0, 0, 0.18);
          background: #fff;
          border-radius: 10px;
          padding: 10px 14px;
          font-weight: 800;
          cursor: pointer;
        }
        .rp-btn--primary {
          background: #e30613;
          border-color: #b7050f;
          color: #fff;
        }

        /* ========= A4 ========= */
        .inv-a4 {
          display: flex;
          justify-content: center;
          padding: 14px 10px 40px;
          background: #f3f3f3;
        }
        .inv-border {
          width: 210mm;
          min-height: 297mm;
          background: #fff;
          border: 2px solid #111;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.18);
          position: relative;
        }

        .inv-header {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 12px;
          padding: 12px 12px 6px;
          align-items: center;
        }
        .inv-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .inv-logo-caption-title {
          font-weight: 900;
          color: #d30010;
          letter-spacing: 0.6px;
        }
        .inv-logo-caption-sub {
          font-size: 12px;
          font-style: italic;
          color: #444;
          margin-top: -2px;
        }

        .inv-head-center {
          text-align: center;
          padding-right: 10px;
        }
        .inv-head-title {
          font-size: 34px;
          line-height: 1;
          font-weight: 1000;
          color: #e30613;
          letter-spacing: 1px;
        }
        .inv-head-sub {
          font-size: 11px;
          font-weight: 700;
          margin-top: 2px;
          color: #333;
        }
        .inv-head-addr {
          font-size: 12px;
          font-weight: 800;
          margin-top: 6px;
        }
        .inv-head-contact {
          margin-top: 6px;
          font-size: 12px;
          font-weight: 800;
        }
        .inv-vat-invoice {
          margin-top: 6px;
          font-weight: 1000;
          color: #d30010;
          letter-spacing: 0.8px;
        }
        .inv-red {
          color: #e30613;
          font-weight: 1000;
        }

        .inv-bar {
          background: #e30613;
          color: #fff;
          font-weight: 1000;
          text-align: center;
          padding: 6px 10px;
          border-top: 2px solid #111;
          border-bottom: 2px solid #111;
          letter-spacing: 0.4px;
        }

        .inv-topgrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 10px 12px;
        }
        .inv-box {
          border: 2px solid #111;
        }
        .inv-box-title {
          background: #e30613;
          color: #fff;
          font-weight: 1000;
          padding: 6px 10px;
          border-bottom: 2px solid #111;
          text-align: center;
          letter-spacing: 0.4px;
        }
        .inv-box-body {
          padding: 10px;
          font-size: 12px;
          font-weight: 900;
        }
        .inv-line {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 8px;
          align-items: center;
          margin-bottom: 6px;
        }
        .inv-two {
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .inv-lab {
          color: #d30010;
          font-weight: 1000;
        }
        .inv-val {
          width: 100%;
        }

        .inv-input,
        .inv-select {
          width: 100%;
          height: 26px;
          border: 1px solid #333;
          border-radius: 0;
          padding: 2px 6px;
          font-weight: 900;
          font-size: 12px;
          background: #fff;
        }

        .inv-table {
          width: calc(100% - 24px);
          margin: 0 12px;
          border-collapse: collapse;
          table-layout: fixed;
        }
        .inv-table th {
          background: #e30613;
          color: #fff;
          border: 2px solid #111;
          font-size: 11px;
          font-weight: 1000;
          padding: 6px 4px;
          text-align: center;
          line-height: 1.1;
        }
        .inv-table td {
          border: 2px solid #111;
          padding: 0;
          height: 28px;
          vertical-align: middle;
          font-size: 12px;
          font-weight: 900;
        }
        .inv-td-center {
          text-align: center;
          padding: 4px;
        }

        .inv-cell {
          width: 100%;
          height: 28px;
          border: 0;
          padding: 0 6px;
          font-weight: 900;
          font-size: 12px;
          background: #fff;
        }
        .inv-num {
          text-align: right;
        }
        .inv-blank td {
          height: 30px;
        }

        .inv-line-total {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 6px;
          gap: 6px;
        }
        .inv-x {
          border: 1px solid #999;
          background: #fff;
          border-radius: 8px;
          padding: 2px 8px;
          cursor: pointer;
          font-weight: 1000;
        }

        .inv-bottom {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 12px;
          padding: 10px 12px;
        }
        .inv-notes {
          border: 2px solid #111;
          padding: 10px 10px 8px;
          font-size: 11px;
          font-weight: 800;
          min-height: 180px;
        }
        .inv-notes-title {
          color: #d30010;
          font-weight: 1000;
          margin-bottom: 6px;
        }
        .inv-notes ul {
          margin: 0;
          padding-left: 16px;
        }
        .inv-notes li {
          margin: 5px 0;
        }

        .inv-totals {
          border: 2px solid #111;
          display: flex;
          flex-direction: column;
        }
        .inv-trow {
          display: grid;
          grid-template-columns: 1fr 120px;
          border-bottom: 2px solid #111;
          font-size: 12px;
          font-weight: 1000;
        }
        .inv-trow:last-child {
          border-bottom: 0;
        }
        .inv-trow > div {
          padding: 6px 8px;
        }
        .inv-tval {
          border-left: 2px solid #111;
          text-align: right;
          font-variant-numeric: tabular-nums;
        }
        .inv-strong {
          background: #f7f7f7;
        }

        .inv-sign {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 18px;
          padding: 18px 18px 10px;
        }
        .inv-sig {
          text-align: center;
        }
        .inv-sig-line {
          border-top: 2px solid #111;
          margin: 0 auto 8px;
          width: 80%;
          height: 1px;
        }
        .inv-sig-lab {
          font-size: 12px;
          font-weight: 1000;
        }
        .inv-sig-sub {
          font-size: 11px;
          font-weight: 800;
          margin-top: 4px;
        }

        .inv-thanks {
          margin: 10px 0 0;
          background: #e30613;
          color: #fff;
          font-style: italic;
          font-weight: 1000;
          text-align: center;
          padding: 6px 10px;
          border-top: 2px solid #111;
        }

        /* ========= Print rules ========= */
        @media print {
          .rp-noprint {
            display: none !important;
          }
          body {
            background: #fff !important;
          }
          .inv-a4 {
            padding: 0 !important;
            background: #fff !important;
          }
          .inv-border {
            box-shadow: none !important;
            border: 2px solid #111 !important;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>
    </>
  );
}
