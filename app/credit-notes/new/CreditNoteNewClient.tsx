"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const VAT_RATE = 0.15;

/** === Adjust these to match your real company header === */
const COMPANY = {
  name: "RAM POTTERY LTD",
  tagline1: "MANUFACTURER & IMPORTER OF QUALITY CLAY",
  tagline2: "PRODUCTS AND OTHER RELIGIOUS ITEMS",
  address: "Robert Kennedy Street, Reunion Maurel, Petit Raffray - Mauritius",
  tel1: "+230 57788884",
  tel2: "+230 58060268",
  tel3: "+230 52522844",
  email: "info@rampottery.com",
  web: "www.rampottery.com",
  brn: "C17144377",
  vat: "VAT:123456789",
};

type Customer = { id: number; name: string; customer_code: string | null };
type Product = { id: number; sku: string | null; name: string | null; selling_price: number | null };

type CNItem = {
  id: number;
  productId: string;
  sku: string;
  description: string;
  qty: number;
  unitExcl: number;
  unitVat: number;
  unitIncl: number;
  lineTotal: number;
};

function recalc(item: CNItem): CNItem {
  const unitVat = +(item.unitExcl * VAT_RATE).toFixed(2);
  const unitIncl = +(item.unitExcl + unitVat).toFixed(2);
  const lineTotal = +(unitIncl * (item.qty || 0)).toFixed(2);
  return { ...item, unitVat, unitIncl, lineTotal };
}

function money(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CreditNoteNewClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [creditNoteDate, setCreditNoteDate] = useState(new Date().toISOString().slice(0, 10));
  const [invoiceId, setInvoiceId] = useState(""); // optional link
  const [reason, setReason] = useState("");

  const [items, setItems] = useState<CNItem[]>([
    {
      id: 1,
      productId: "",
      sku: "",
      description: "",
      qty: 0,
      unitExcl: 0,
      unitVat: 0,
      unitIncl: 0,
      lineTotal: 0,
    },
  ]);

  /* ===== theme + mobile drawer (same pattern as your dashboard) ===== */
  const [dark, setDark] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("rp_theme") : null;
    const isDark = saved === "dark";
    setDark(isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("rp_theme", next ? "dark" : "light");
  }

  // lock scroll when drawer open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  // close on ESC
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileNavOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* ===== data ===== */
  useEffect(() => {
    async function load() {
      const { data: c } = await supabase.from("customers").select("id, name, customer_code").order("name");
      setCustomers((c ?? []) as Customer[]);

      const { data: p } = await supabase.from("products").select("id, sku, name, selling_price").order("sku");
      setProducts((p ?? []) as Product[]);
    }
    load();
  }, []);

  // ✅ Prefill from invoice page link
  useEffect(() => {
    const cId = searchParams.get("customerId");
    const invId = searchParams.get("invoiceId");
    if (cId && /^\d+$/.test(cId)) setCustomerId(cId);
    if (invId && /^\d+$/.test(invId)) setInvoiceId(invId);
  }, [searchParams]);

  const selectedCustomer = useMemo(() => {
    const id = Number(customerId);
    if (!id) return null;
    return customers.find((c) => c.id === id) || null;
  }, [customerId, customers]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, r) => s + (r.qty || 0) * (r.unitExcl || 0), 0);
    const vat = subtotal * VAT_RATE;
    const total = subtotal + vat;
    return {
      subtotal: +subtotal.toFixed(2),
      vat: +vat.toFixed(2),
      total: +total.toFixed(2),
    };
  }, [items]);

  const updateItem = (id: number, patch: Partial<CNItem>) => {
    setItems((prev) => prev.map((r) => (r.id === id ? recalc({ ...r, ...patch }) : r)));
  };

  const handleSelectProduct = (id: number, productId: string) => {
    const p = products.find((x) => x.id === Number(productId));
    updateItem(id, {
      productId,
      sku: p?.sku || "",
      description: p?.name || "",
      unitExcl: Number(p?.selling_price || 0),
    });
  };

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      recalc({
        id: prev.length + 1,
        productId: "",
        sku: "",
        description: "",
        qty: 0,
        unitExcl: 0,
        unitVat: 0,
        unitIncl: 0,
        lineTotal: 0,
      }),
    ]);
  };

  const removeRow = (id: number) => {
    setItems((prev) => prev.filter((r) => r.id !== id));
  };

  const save = async () => {
    if (!customerId) return alert("Select a customer first.");
    const clean = items.filter((r) => r.productId && r.qty > 0);
    if (!clean.length) return alert("Add at least 1 item with qty > 0");

    const res = await fetch("/api/credit-notes/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: Number(customerId),
        creditNoteDate,
        invoiceId: invoiceId ? Number(invoiceId) : null,
        reason: reason || null,
        subtotal: totals.subtotal,
        vatAmount: totals.vat,
        totalAmount: totals.total,
        items: clean.map((r) => ({
          product_id: Number(r.productId),
          total_qty: r.qty,
          unit_price_excl_vat: r.unitExcl,
          unit_vat: r.unitVat,
          unit_price_incl_vat: r.unitIncl,
          line_total: r.lineTotal,
        })),
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.ok) {
      alert(json.error || "Failed to create credit note");
      return;
    }

    router.push(`/credit-notes/${json.creditNoteId}`);
  };

  /* ===== TEMPLATE STYLES (inline so you don't need new CSS) ===== */
  const red = "#e30613";
  const paperBg = "#ffffff";
  const ink = "#111827";
  const border = "rgba(17,24,39,.28)";

  const box: React.CSSProperties = {
    border: `1px solid ${border}`,
    borderRadius: 10,
    background: paperBg,
    overflow: "hidden",
  };

  const boxHead: React.CSSProperties = {
    background: red,
    color: "white",
    fontWeight: 900,
    letterSpacing: ".06em",
    fontSize: 12,
    padding: "10px 12px",
    textTransform: "uppercase",
  };

  const cellLabel: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 900,
    color: ink,
    letterSpacing: ".02em",
  };

  const smallInput: React.CSSProperties = {
    width: "100%",
    height: 40,
    borderRadius: 12,
    border: `1px solid rgba(148,163,184,.35)`,
    padding: "0 12px",
    fontWeight: 850,
    outline: "none",
    background: "rgba(255,255,255,.92)",
    color: ink,
  };

  const selectStyle: React.CSSProperties = {
    ...smallInput,
    paddingRight: 10,
  };

  return (
    <div className="rp-app">
      {/* luxury background like dashboard */}
      <div className="rp-bg" aria-hidden="true">
        <span className="rp-bg-orb rp-bg-orb--1" />
        <span className="rp-bg-orb rp-bg-orb--2" />
        <span className="rp-bg-orb rp-bg-orb--3" />
        <span className="rp-bg-grid" />
      </div>

      <div className="rp-shell rp-enter">
        {/* Mobile top bar */}
        <div className="rp-mtop">
          <button type="button" className="rp-icon-btn" aria-label="Open menu" onClick={() => setMobileNavOpen(true)}>
            <span className="rp-burger" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>

          <div className="rp-mtop-brand">
            <div className="rp-mtop-title">New Credit Note</div>
            <div className="rp-mtop-sub">Template • Premium</div>
          </div>

          <button type="button" className="rp-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {dark ? "☀️" : "🌙"}
          </button>
        </div>

        {/* overlay */}
        <button
          type="button"
          className={`rp-overlay ${mobileNavOpen ? "is-open" : ""}`}
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />

        {/* drawer */}
        <aside className={`rp-drawer ${mobileNavOpen ? "is-open" : ""}`} aria-label="Mobile navigation">
          <div className="rp-drawer-head">
            <div className="rp-drawer-brand">
              <div className="rp-drawer-logo">
                <Image
                  src="/images/logo/logo.png"
                  alt="Ram Pottery Ltd"
                  width={40}
                  height={40}
                  priority
                  style={{ width: 40, height: 40, objectFit: "contain" }}
                />
              </div>
              <div>
                <div className="rp-drawer-title">Ram Pottery Ltd</div>
                <div className="rp-drawer-sub">Accounting & Stock</div>
              </div>
            </div>

            <button type="button" className="rp-icon-btn" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">
              ✕
            </button>
          </div>

          <nav className="rp-nav" onClick={() => setMobileNavOpen(false)}>
            <Link className="rp-nav-btn" href="/">Dashboard</Link>
            <Link className="rp-nav-btn" href="/invoices">Invoices</Link>
            <Link className="rp-nav-btn rp-nav-btn--active" href="/credit-notes">Credit Notes</Link>
            <Link className="rp-nav-btn" href="/products">Stock & Categories</Link>
            <Link className="rp-nav-btn" href="/customers">Customers</Link>
            <Link className="rp-nav-btn" href="/reports">Reports & Statements</Link>
            <Link className="rp-nav-btn" href="/admin/users">Users & Permissions</Link>
          </nav>
        </aside>

        {/* desktop sidebar */}
        <aside className="rp-side">
          <div className="rp-side-card rp-card-anim">
            <div className="rp-brand">
              <div className="rp-brand-logo">
                <Image
                  src="/images/logo/logo.png"
                  alt="Ram Pottery Ltd"
                  width={44}
                  height={44}
                  priority
                  style={{ width: 44, height: 44, objectFit: "contain" }}
                />
              </div>
              <div className="rp-brand-text">
                <div className="rp-brand-title">Ram Pottery Ltd</div>
                <div className="rp-brand-sub">Online Accounting & Stock Manager</div>
              </div>
            </div>

            <nav className="rp-nav">
              <Link className="rp-nav-btn" href="/">Dashboard</Link>
              <Link className="rp-nav-btn" href="/invoices">Invoices</Link>
              <Link className="rp-nav-btn rp-nav-btn--active" href="/credit-notes">Credit Notes</Link>
              <Link className="rp-nav-btn" href="/products">Stock & Categories</Link>
              <Link className="rp-nav-btn" href="/stock-movements">Stock Movements</Link>
              <Link className="rp-nav-btn" href="/customers">Customers</Link>
              <Link className="rp-nav-btn" href="/suppliers">Suppliers</Link>
              <Link className="rp-nav-btn" href="/reports">Reports & Statements</Link>
              <Link className="rp-nav-btn" href="/admin/users">Users & Permissions</Link>
            </nav>

            <div className="rp-side-footer">
              <div className="rp-role">
                <span>Doc</span>
                <b>Credit Note</b>
              </div>
            </div>
          </div>
        </aside>

        {/* main */}
        <main className="rp-main">
          {/* top header */}
          <div className="rp-top rp-card-anim" style={{ animationDelay: "60ms" }}>
            <div className="rp-title">
              <div className="rp-eyebrow">
                <span className="rp-tag">RamPotteryDoc style</span>
                <span className="rp-tag">VAT 15%</span>
              </div>
              <h1>New Credit Note</h1>
              <p>Premium template layout • ready for printing</p>
            </div>

            <div className="rp-top-right">
              <button type="button" className="rp-theme-btn" onClick={() => router.push("/credit-notes")}>
                ← Back
              </button>
              <button type="button" className="rp-theme-btn" onClick={() => window.print()}>
                🖨 Print
              </button>
              <button type="button" className="rp-theme-btn" onClick={toggleTheme}>
                {dark ? "☀️ Light" : "🌙 Dark"}
              </button>
            </div>
          </div>

          {/* DOCUMENT PANEL */}
          <section className="rp-card rp-glass rp-card-anim" style={{ animationDelay: "140ms" }}>
            <div className="rp-card-body" style={{ padding: 16 }}>
              {/* “Paper” area */}
              <div
                style={{
                  background: paperBg,
                  color: ink,
                  borderRadius: 18,
                  border: `1px solid rgba(148,163,184,.35)`,
                  boxShadow: "0 25px 80px rgba(0,0,0,.10)",
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <div style={{ padding: "16px 16px 10px 16px", borderBottom: `1px solid rgba(148,163,184,.25)` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 14, alignItems: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <Image
                        src="/images/logo/logo.png"
                        alt="Ram Pottery"
                        width={110}
                        height={110}
                        priority
                        style={{ width: 110, height: 110, objectFit: "contain" }}
                      />
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 34, fontWeight: 1000, letterSpacing: ".06em", color: red }}>
                        {COMPANY.name}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.8 }}>{COMPANY.tagline1}</div>
                      <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.8 }}>{COMPANY.tagline2}</div>

                      <div style={{ marginTop: 8, fontSize: 13, fontWeight: 850 }}>
                        {COMPANY.address}
                      </div>

                      <div style={{ marginTop: 6, fontSize: 12, fontWeight: 850 }}>
                        <span style={{ color: red, fontWeight: 1000 }}>Tel:</span>{" "}
                        {COMPANY.tel1} • {COMPANY.tel2} • {COMPANY.tel3}
                      </div>
                      <div style={{ marginTop: 4, fontSize: 12, fontWeight: 850 }}>
                        <span style={{ color: red, fontWeight: 1000 }}>Email:</span> {COMPANY.email} •{" "}
                        <span style={{ color: red, fontWeight: 1000 }}>Web:</span> {COMPANY.web}
                      </div>

                      <div style={{ marginTop: 10, fontSize: 14, fontWeight: 1000, color: red, letterSpacing: ".12em" }}>
                        CREDIT NOTE
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer + Meta boxes */}
                <div style={{ padding: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {/* Customer details */}
                    <div style={box}>
                      <div style={boxHead}>Customer Details</div>
                      <div style={{ padding: 12, display: "grid", gap: 10 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, alignItems: "center" }}>
                          <div style={cellLabel}>Customer *</div>
                          <select style={selectStyle} value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                            <option value="">Select customer</option>
                            {customers.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.customer_code ? `${c.customer_code} — ` : ""}
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, alignItems: "center" }}>
                          <div style={cellLabel}>Customer Code</div>
                          <div style={{ fontWeight: 950 }}>
                            {selectedCustomer?.customer_code || "—"}
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, alignItems: "center" }}>
                          <div style={cellLabel}>Name</div>
                          <div style={{ fontWeight: 950 }}>{selectedCustomer?.name || "—"}</div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, alignItems: "center" }}>
                          <div style={cellLabel}>Reason</div>
                          <input
                            style={smallInput}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Returned goods / Damaged / Price adjustment…"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Meta */}
                    <div style={box}>
                      <div style={{ ...boxHead, display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <span>BRN: {COMPANY.brn}</span>
                        <span>{COMPANY.vat}</span>
                      </div>

                      <div style={{ padding: 12, display: "grid", gap: 10 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10, alignItems: "center" }}>
                          <div style={cellLabel}>Credit Note No</div>
                          <div style={{ fontWeight: 1000, letterSpacing: ".04em" }}>AUTO</div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10, alignItems: "center" }}>
                          <div style={cellLabel}>Date *</div>
                          <input
                            type="date"
                            style={smallInput}
                            value={creditNoteDate}
                            onChange={(e) => setCreditNoteDate(e.target.value)}
                          />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10, alignItems: "center" }}>
                          <div style={cellLabel}>Related Invoice ID</div>
                          <input
                            style={smallInput}
                            value={invoiceId}
                            onChange={(e) => setInvoiceId(e.target.value)}
                            placeholder="e.g. 123"
                          />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10, alignItems: "center" }}>
                          <div style={cellLabel}>Sales Rep</div>
                          <input style={smallInput} value={"—"} readOnly />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items table */}
                  <div style={{ marginTop: 14, ...box }}>
                    <div style={boxHead}>Items</div>

                    <div style={{ padding: 12 }}>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
                          <thead>
                            <tr>
                              {[
                                "SN",
                                "ITEM CODE",
                                "DESCRIPTION",
                                "TOTAL QTY",
                                "UNIT PRICE (Excl VAT)",
                                "VAT",
                                "UNIT PRICE (Incl VAT)",
                                "TOTAL AMOUNT (Incl VAT)",
                                "",
                              ].map((h, idx) => (
                                <th
                                  key={idx}
                                  style={{
                                    background: red,
                                    color: "white",
                                    fontSize: 12,
                                    letterSpacing: ".06em",
                                    textTransform: "uppercase",
                                    padding: "10px 10px",
                                    borderRight: idx === 8 ? "none" : "1px solid rgba(255,255,255,.18)",
                                    whiteSpace: "nowrap",
                                    textAlign: idx >= 3 ? "right" : "left",
                                  }}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>

                          <tbody>
                            {items.map((r, i) => (
                              <tr key={r.id}>
                                {/* SN */}
                                <td style={{ padding: 10, borderBottom: `1px solid rgba(148,163,184,.25)`, fontWeight: 950 }}>
                                  {i + 1}
                                </td>

                                {/* ITEM CODE + PRODUCT SELECT */}
                                <td style={{ padding: 10, borderBottom: `1px solid rgba(148,163,184,.25)`, minWidth: 240 }}>
                                  <select
                                    style={selectStyle}
                                    value={r.productId}
                                    onChange={(e) => handleSelectProduct(r.id, e.target.value)}
                                  >
                                    <option value="">Select product</option>
                                    {products.map((p) => (
                                      <option key={p.id} value={p.id}>
                                        {p.sku} — {p.name}
                                      </option>
                                    ))}
                                  </select>
                                  <div style={{ marginTop: 6, fontSize: 12, fontWeight: 900, opacity: 0.85 }}>
                                    {r.sku || "—"}
                                  </div>
                                </td>

                                {/* DESCRIPTION */}
                                <td style={{ padding: 10, borderBottom: `1px solid rgba(148,163,184,.25)`, minWidth: 260, fontWeight: 850 }}>
                                  {r.description || "—"}
                                </td>

                                {/* QTY */}
                                <td style={{ padding: 10, borderBottom: `1px solid rgba(148,163,184,.25)`, minWidth: 120 }}>
                                  <input
                                    style={{ ...smallInput, textAlign: "right" }}
                                    inputMode="numeric"
                                    value={r.qty}
                                    onChange={(e) => updateItem(r.id, { qty: Number(e.target.value) || 0 })}
                                  />
                                </td>

                                {/* UNIT EXCL */}
                                <td style={{ padding: 10, borderBottom: `1px solid rgba(148,163,184,.25)`, minWidth: 170 }}>
                                  <input
                                    style={{ ...smallInput, textAlign: "right" }}
                                    inputMode="decimal"
                                    value={r.unitExcl}
                                    onChange={(e) => updateItem(r.id, { unitExcl: Number(e.target.value) || 0 })}
                                  />
                                </td>

                                {/* VAT */}
                                <td style={{ padding: 10, borderBottom: `1px solid rgba(148,163,184,.25)`, textAlign: "right", fontWeight: 950 }}>
                                  {r.unitVat.toFixed(2)}
                                </td>

                                {/* UNIT INCL */}
                                <td style={{ padding: 10, borderBottom: `1px solid rgba(148,163,184,.25)`, textAlign: "right", fontWeight: 950 }}>
                                  {r.unitIncl.toFixed(2)}
                                </td>

                                {/* LINE TOTAL */}
                                <td style={{ padding: 10, borderBottom: `1px solid rgba(148,163,184,.25)`, textAlign: "right", fontWeight: 1000 }}>
                                  {r.lineTotal.toFixed(2)}
                                </td>

                                {/* Remove */}
                                <td style={{ padding: 10, borderBottom: `1px solid rgba(148,163,184,.25)`, textAlign: "right" }}>
                                  {items.length > 1 && (
                                    <button
                                      type="button"
                                      className="rp-chip"
                                      onClick={() => removeRow(r.id)}
                                      style={{ border: `1px solid rgba(227,6,19,.25)` }}
                                    >
                                      Remove
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 12, flexWrap: "wrap" }}>
                        <button type="button" className="rp-chip rp-chip--primary" onClick={addRow}>
                          + Add Row
                        </button>

                        <div style={{ display: "grid", gridTemplateColumns: "220px 170px", gap: 10, alignItems: "stretch", marginLeft: "auto" }}>
                          <div style={{ ...box, borderRadius: 14 }}>
                            <div style={boxHead}>Totals</div>
                            <div style={{ padding: 12, display: "grid", gap: 10 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 950 }}>
                                <span>SUB TOTAL</span>
                                <span>{money(totals.subtotal)}</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 950 }}>
                                <span>VAT 15%</span>
                                <span>{money(totals.vat)}</span>
                              </div>
                              <div style={{ height: 1, background: "rgba(148,163,184,.35)" }} />
                              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 1000, fontSize: 16 }}>
                                <span>TOTAL</span>
                                <span>{money(totals.total)}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={save}
                            style={{
                              borderRadius: 14,
                              border: "none",
                              background: `linear-gradient(135deg, ${red}, #b4000b)`,
                              color: "white",
                              fontWeight: 1000,
                              letterSpacing: ".02em",
                              boxShadow: "0 18px 50px rgba(227,6,19,.25)",
                              padding: "14px 14px",
                              cursor: "pointer",
                              height: "100%",
                            }}
                          >
                            Save Credit Note
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer note bar (like your template) */}
                  <div
                    style={{
                      marginTop: 14,
                      background: red,
                      color: "white",
                      padding: "10px 12px",
                      borderRadius: 12,
                      fontWeight: 900,
                      textAlign: "center",
                      letterSpacing: ".03em",
                    }}
                  >
                    We thank you for your business and look forward to being of service to you again.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer className="rp-footer rp-card-anim" style={{ animationDelay: "260ms" }}>
            © 2025 Ram Pottery Ltd • Built by <span>MoBiz.mu</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
