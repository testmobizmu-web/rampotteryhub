"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const VAT_RATE = 0.15;

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

/**
 * ✅ Important:
 * - I added units_per_box because Invoice needs it.
 * - If your DB column is different, tell me the exact name and I will switch it.
 */
type Product = {
  id: number;
  sku: string | null;
  name: string | null;
  selling_price: number | null;
  units_per_box?: number | null; // optional
  unit_per_box?: number | null; // fallback alt name (if exists)
};

type UOM = "BOX" | "PCS";

type CNItem = {
  id: number;

  productId: string;
  sku: string;
  description: string;

  uom: UOM;
  box_qty: number; // the qty typed in the UOM+Qty cell (BOX count or PCS count)

  units_per_box: number; // auto from product (default 1)
  total_qty: number; // auto computed

  unitExcl: number;
  unitVat: number;
  unitIncl: number;
  lineTotal: number;
};

function n2(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

function round2(n: number) {
  return +n.toFixed(2);
}

function computeTotalQty(uom: UOM, boxQty: number, unitsPerBox: number) {
  const q = n2(boxQty);
  const upb = Math.max(1, n2(unitsPerBox));
  if (uom === "BOX") return Math.max(0, Math.floor(q) * upb);
  return Math.max(0, Math.floor(q));
}

function recalc(item: CNItem): CNItem {
  const unitsPerBox = Math.max(1, n2(item.units_per_box));
  const totalQty = computeTotalQty(item.uom, item.box_qty, unitsPerBox);

  const unitVat = round2(n2(item.unitExcl) * VAT_RATE);
  const unitIncl = round2(n2(item.unitExcl) + unitVat);
  const lineTotal = round2(unitIncl * totalQty);

  return {
    ...item,
    units_per_box: unitsPerBox,
    total_qty: totalQty,
    unitVat,
    unitIncl,
    lineTotal,
  };
}

function money(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDateTime(d: Date) {
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
    d.getSeconds()
  )}`;
}

function blankRow(id: number): CNItem {
  return recalc({
    id,
    productId: "",
    sku: "",
    description: "",
    uom: "BOX",       // ✅ default BOX
    box_qty: 0,
    units_per_box: 1,
    total_qty: 0,
    unitExcl: 0,
    unitVat: 0,
    unitIncl: 0,
    lineTotal: 0,
  });
}


export default function CreditNoteNewClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // toast
  const [toast, setToast] = useState<string | null>(null);
  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  }

  const [lastSync, setLastSync] = useState<string>("—");
  const [dark, setDark] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);

  const [customerId, setCustomerId] = useState("");
  const [creditNoteDate, setCreditNoteDate] = useState(new Date().toISOString().slice(0, 10));
  const [invoiceId, setInvoiceId] = useState("");
  const [reason, setReason] = useState("");

  const [saving, setSaving] = useState(false);

  const [items, setItems] = useState<CNItem[]>([blankRow(1)]);

  // refs for fast data entry
  const customerRef = useRef<HTMLSelectElement | null>(null);
  const reasonRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("rp_theme") : null;
    const isDark = saved === "dark";
    setDark(isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    setLastSync(fmtDateTime(new Date()));
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

  // ESC closes drawer; Ctrl/⌘ + Enter saves
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (mobileNavOpen) setMobileNavOpen(false);
        return;
      }
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        void save();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileNavOpen, items, customerId, creditNoteDate, invoiceId, reason]);

  // load customers/products
  useEffect(() => {
    async function load() {
      setLoadingLists(true);
      try {
        const { data: c } = await supabase.from("customers").select("id, name, customer_code").order("name");
        setCustomers((c ?? []) as Customer[]);

        // ✅ include units_per_box if it exists; if not, supabase just ignores it
        const { data: p } = await supabase
          .from("products")
          .select("id, sku, name, selling_price, units_per_box, unit_per_box")
          .order("sku");

        setProducts((p ?? []) as Product[]);
      } finally {
        setLoadingLists(false);
        setLastSync(fmtDateTime(new Date()));
        window.setTimeout(() => customerRef.current?.focus(), 120);
      }
    }
    load();
  }, []);

  // prefill from invoice link
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
    const subtotalEx = items.reduce((s, r) => s + n2(r.total_qty) * n2(r.unitExcl), 0);
    const vat = subtotalEx * VAT_RATE;
    const total = subtotalEx + vat;

    return {
      subtotal: round2(subtotalEx),
      vat: round2(vat),
      total: round2(total),
    };
  }, [items]);

  const setItem = (id: number, patch: Partial<CNItem>) => {
    setItems((prev) => prev.map((r) => (r.id === id ? recalc({ ...r, ...patch } as CNItem) : r)));
  };

  const handleSelectProduct = (id: number, productId: string) => {
    const p = products.find((x) => x.id === Number(productId));

    const unitsPerBox =
      Math.max(1, n2((p as any)?.units_per_box ?? (p as any)?.unit_per_box ?? 1));

    // ✅ Keep current qty if already typed, else default to 1
    const current = items.find((x) => x.id === id);
    const nextBoxQty = current?.box_qty ? n2(current.box_qty) : 1;

    setItem(id, {
        productId,
        sku: p?.sku || "",
        description: p?.name || "",
        unitExcl: n2(p?.selling_price || 0),
        units_per_box: unitsPerBox,
        box_qty: nextBoxQty,

     // ✅ default to BOX only on first select (so it doesn't override user choice later)
      uom: current?.productId ? current.uom : "BOX",
   });


    // ✅ auto-add next row if this was last row (invoice behavior)
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.id === id);
      const isLast = idx === prev.length - 1;
      if (!isLast) return prev;
      return [...prev, blankRow(prev.length + 1)];
    });
  };

  const addRow = () => {
    setItems((prev) => [...prev, blankRow(prev.length + 1)]);
  };

  const removeRow = (id: number) => {
    setItems((prev) => prev.filter((r) => r.id !== id));
  };

  const save = async () => {
    if (saving) return;

    if (!customerId) {
      showToast("Select a customer first ⚠️");
      customerRef.current?.focus();
      return;
    }

    const clean = items.filter((r) => r.productId && n2(r.total_qty) > 0);
    if (!clean.length) {
      showToast("Add at least 1 item with qty > 0 ⚠️");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("/api/credit-notes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: Number(customerId),
          creditNoteDate,
          invoiceId: invoiceId ? Number(invoiceId) : null,
          reason: reason || null,

          // ✅ snapshot totals
          subtotal: totals.subtotal,
          vatAmount: totals.vat,
          totalAmount: totals.total,

          items: clean.map((r) => ({
            product_id: Number(r.productId),

            // ✅ invoice-like qty logic
            total_qty: n2(r.total_qty),

            unit_price_excl_vat: n2(r.unitExcl),
            unit_vat: n2(r.unitVat),
            unit_price_incl_vat: n2(r.unitIncl),
            line_total: n2(r.lineTotal),

            // optional: if your API supports it you can store uom + box_qty + units_per_box
            // uom: r.uom,
            // box_qty: r.box_qty,
            // units_per_box: r.units_per_box,
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to create credit note");

      showToast("Credit note created ✅");
      window.setTimeout(() => {
        router.push(`/credit-notes/${json.creditNoteId}`);
      }, 650);
    } catch (e: any) {
      showToast(e?.message || "Failed to create credit note");
    } finally {
      setSaving(false);
    }
  };

  // premium UI helpers
  const red = "#e30613";

  const inputCls =
    "w-full h-[42px] rounded-2xl border border-[rgba(148,163,184,.35)] bg-[rgba(255,255,255,.92)] px-3 font-extrabold outline-none";
  const labelCls = "text-[12px] font-black tracking-wide text-[rgba(17,24,39,.85)]";

  // ✅ invoice-like split input for UOM + Qty
  const uomSelectCls =
    "h-[42px] rounded-2xl border border-[rgba(148,163,184,.35)] bg-[rgba(255,255,255,.92)] px-3 font-extrabold outline-none";
  const qtyInputCls =
    "h-[42px] rounded-2xl border border-[rgba(148,163,184,.35)] bg-[rgba(255,255,255,.92)] px-3 font-extrabold outline-none text-right";

  return (
    <div className="rp-app">
      <div className="rp-bg" aria-hidden="true">
        <span className="rp-bg-orb rp-bg-orb--1" />
        <span className="rp-bg-orb rp-bg-orb--2" />
        <span className="rp-bg-orb rp-bg-orb--3" />
        <span className="rp-bg-grid" />
      </div>

      {toast && (
        <div
          style={{
            position: "fixed",
            right: 18,
            top: 16,
            zIndex: 9999,
            padding: "10px 14px",
            borderRadius: 14,
            background: "rgba(255,255,255,.92)",
            border: "1px solid rgba(0,0,0,.12)",
            boxShadow: "0 16px 50px rgba(0,0,0,.18)",
            fontWeight: 950,
            backdropFilter: "blur(10px)",
            maxWidth: 520,
          }}
        >
          {toast}
        </div>
      )}

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
            <div className="rp-mtop-sub">Ctrl/⌘ + Enter = Save</div>
          </div>

          <button type="button" className="rp-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {dark ? "☀️" : "🌙"}
          </button>
        </div>

        <button
          type="button"
          className={`rp-overlay ${mobileNavOpen ? "is-open" : ""}`}
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />

        {/* Drawer */}
        <aside className={`rp-drawer ${mobileNavOpen ? "is-open" : ""}`} aria-label="Mobile navigation">
          <div className="rp-drawer-head">
            <div className="rp-drawer-brand">
              <div className="rp-drawer-logo">
                <Image src="/images/logo/logo.png" alt="Ram Pottery Ltd" width={40} height={40} priority />
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

        {/* Desktop sidebar */}
        <aside className="rp-side">
          <div className="rp-side-card rp-card-anim">
            <div className="rp-brand">
              <div className="rp-brand-logo">
                <Image src="/images/logo/logo.png" alt="Ram Pottery Ltd" width={44} height={44} priority />
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

        {/* Main */}
        <main className="rp-main">
          {/* Premium top header like invoices */}
          <header className="rp-top rp-top--saas rp-card-anim" style={{ animationDelay: "60ms" }}>
            <div className="rp-top-left--actions">
              <button type="button" className="rp-ui-btn rp-ui-btn--brand" onClick={toggleTheme}>
                <span className="rp-ui-btn__dot" aria-hidden="true" />
                {dark ? "☀ Light" : "🌙 Dark"}
              </button>

              <button type="button" className="rp-ui-btn" onClick={() => router.push("/credit-notes")}>
                <span className="rp-ui-btn__dot" aria-hidden="true" />
                Back
              </button>
            </div>

            <div className="rp-top-center--logo">
              <div className="rp-top-logo">
                <Image src="/images/logo/logo.png" alt="Ram Pottery" width={44} height={44} priority />
              </div>
            </div>

            <div className="rp-top-right--sync">
              <div className="rp-sync">
                <div className="rp-sync-label">Last sync :</div>
                <div className="rp-sync-time">{lastSync}</div>
              </div>
            </div>
          </header>

          <section className="rp-exec rp-card-anim">
            <div className="rp-exec__left">
              <div className="rp-exec__title">New Credit Note</div>
              <div className="rp-exec__sub">Invoice-style BOX/PCS • Unit/Box auto • Total Qty auto • VAT 15%</div>
            </div>
            <div className="rp-exec__right">
              <span className={`rp-live ${saving ? "is-dim" : ""}`}>
                <span className="rp-live-dot" aria-hidden="true" />
                {saving ? "Saving" : "Live"}
              </span>
              <span className="rp-chip rp-chip--soft">Reprint-ready</span>
            </div>
          </section>

          {/* Document Card */}
          <section className="rp-card rp-card-anim" style={{ animationDelay: "140ms" }}>
            <div className="rp-card-body" style={{ padding: 16 }}>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  border: "1px solid rgba(148,163,184,.35)",
                  boxShadow: "0 25px 80px rgba(0,0,0,.10)",
                  overflow: "hidden",
                }}
              >
                {/* Paper header */}
                <div style={{ padding: 16, borderBottom: "1px solid rgba(148,163,184,.22)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 14, alignItems: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <Image src="/images/logo/logo.png" alt="Ram Pottery" width={96} height={96} priority />
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 32, fontWeight: 1000, letterSpacing: ".06em", color: red }}>
                        {COMPANY.name}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.82 }}>{COMPANY.tagline1}</div>
                      <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.82 }}>{COMPANY.tagline2}</div>

                      <div style={{ marginTop: 8, fontSize: 13, fontWeight: 850 }}>{COMPANY.address}</div>
                      <div style={{ marginTop: 6, fontSize: 12, fontWeight: 850 }}>
                        <span style={{ color: red, fontWeight: 1000 }}>Tel:</span> {COMPANY.tel1} • {COMPANY.tel2} • {COMPANY.tel3}
                      </div>
                      <div style={{ marginTop: 4, fontSize: 12, fontWeight: 850 }}>
                        <span style={{ color: red, fontWeight: 1000 }}>Email:</span> {COMPANY.email} •{" "}
                        <span style={{ color: red, fontWeight: 1000 }}>Web:</span> {COMPANY.web}
                      </div>

                      <div style={{ marginTop: 10, fontSize: 14, fontWeight: 1000, color: red, letterSpacing: ".14em" }}>
                        CREDIT NOTE
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form grid */}
                <div style={{ padding: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {/* Customer */}
                    <div className="rp-card" style={{ margin: 0 }}>
                      <div className="rp-card-head rp-card-head--tight">
                        <div>
                          <div className="rp-card-title">Customer</div>
                          <div className="rp-card-sub">Auto-fill from customer list</div>
                        </div>
                        <span className="rp-chip rp-chip--soft">{loadingLists ? "Loading…" : "Ready"}</span>
                      </div>

                      <div className="rp-card-body" style={{ paddingTop: 10 }}>
                        <div style={{ display: "grid", gap: 10 }}>
                          <label>
                            <div className={labelCls}>Customer *</div>
                            <select
                              ref={customerRef}
                              className={inputCls}
                              value={customerId}
                              onChange={(e) => setCustomerId(e.target.value)}
                            >
                              <option value="">Select customer</option>
                              {customers.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.customer_code ? `${c.customer_code} — ` : ""}
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </label>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <div>
                              <div className={labelCls}>Customer Code</div>
                              <div style={{ fontWeight: 1000, paddingTop: 6 }}>{selectedCustomer?.customer_code || "—"}</div>
                            </div>
                            <div>
                              <div className={labelCls}>Name</div>
                              <div style={{ fontWeight: 1000, paddingTop: 6 }}>{selectedCustomer?.name || "—"}</div>
                            </div>
                          </div>

                          <label>
                            <div className={labelCls}>Reason</div>
                            <input
                              ref={reasonRef}
                              className={inputCls}
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              placeholder="Returned goods / Damaged / Price adjustment…"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="rp-card" style={{ margin: 0 }}>
                      <div className="rp-card-head rp-card-head--tight">
                        <div>
                          <div className="rp-card-title">Document</div>
                          <div className="rp-card-sub">BRN • VAT • reference</div>
                        </div>
                        <span className="rp-chip">VAT 15%</span>
                      </div>

                      <div className="rp-card-body" style={{ paddingTop: 10 }}>
                        <div style={{ display: "grid", gap: 10 }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <div>
                              <div className={labelCls}>Date *</div>
                              <input type="date" className={inputCls} value={creditNoteDate} onChange={(e) => setCreditNoteDate(e.target.value)} />
                            </div>
                            <div>
                              <div className={labelCls}>Credit Note No</div>
                              <div style={{ fontWeight: 1000, paddingTop: 10 }}>AUTO</div>
                            </div>
                          </div>

                          <label>
                            <div className={labelCls}>Related Invoice ID (optional)</div>
                            <input className={inputCls} value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} placeholder="e.g. 123" />
                          </label>

                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <span className="rp-chip rp-chip--soft">BRN: {COMPANY.brn}</span>
                            <span className="rp-chip rp-chip--soft">{COMPANY.vat}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="rp-card" style={{ marginTop: 14 }}>
                    <div className="rp-card-head rp-card-head--tight">
                      <div>
                        <div className="rp-card-title">Items</div>
                        <div className="rp-card-sub">Invoice-style: BOX/PCS + Qty → Unit/Box + Total Qty auto</div>
                      </div>

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button type="button" className="rp-ui-btn" onClick={addRow}>
                          <span className="rp-ui-btn__dot" aria-hidden="true" />
                          Add row
                        </button>

                        <button
                          type="button"
                          className="rp-ui-btn rp-ui-btn--brand"
                          onClick={() => void save()}
                          disabled={saving}
                          title="Ctrl/⌘ + Enter"
                        >
                          <span className="rp-ui-btn__dot" aria-hidden="true" />
                          {saving ? "Saving…" : "Save Credit Note"}
                        </button>
                      </div>
                    </div>

                    <div className="rp-card-body">
                      <div className="rp-table-scroll">
                        <div className="rp-table-scroll__inner">
                          <table className="rp-table rp-table--premium">
                            <thead>
                              <tr>
                                <th style={{ width: 70 }}>SN</th>
                                <th style={{ minWidth: 280 }}>Product</th>

                                {/* ✅ invoice-like UOM+Qty */}
                                <th style={{ width: 220 }}>BOX / PCS</th>

                                {/* ✅ unit/box */}
                                <th className="rp-right" style={{ width: 140 }}>Unit/Box</th>

                                {/* ✅ total qty */}
                                <th className="rp-right" style={{ width: 140 }}>Total Qty</th>

                                <th style={{ minWidth: 280 }}>Description</th>

                                <th className="rp-right rp-col-hide-sm" style={{ width: 150 }}>Unit Ex</th>
                                <th className="rp-right rp-col-hide-sm" style={{ width: 120 }}>VAT</th>
                                <th className="rp-right rp-col-hide-sm" style={{ width: 150 }}>Unit Incl</th>
                                <th className="rp-right" style={{ width: 170 }}>Total</th>

                                <th style={{ width: 90 }} />
                              </tr>
                            </thead>

                            <tbody>
                              {items.map((r, i) => (
                                <tr key={r.id} className="rp-row-hover">
                                  <td className="rp-strong" style={{ textAlign: "center" }}>
                                    {i + 1}
                                  </td>

                                  <td>
                                    <select
                                      className={inputCls}
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

                                    <div className="rp-muted" style={{ marginTop: 6, fontWeight: 900 }}>
                                      SKU: <b style={{ fontWeight: 1000 }}>{r.sku || "—"}</b>
                                    </div>
                                  </td>

                                  {/* ✅ UOM + Qty */}
                                  <td>
                                    <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 8 }}>
                                      <select
                                        className={uomSelectCls}
                                        value={r.uom}
                                        onChange={(e) => setItem(r.id, { uom: e.target.value as UOM })}
                                      >
                                        <option value="BOX">BOX</option>
                                        <option value="PCS">PCS</option>
                                      </select>

                                      <input
                                        className={qtyInputCls}
                                        inputMode="numeric"
                                        value={r.box_qty}
                                        onChange={(e) => setItem(r.id, { box_qty: n2(e.target.value) })}
                                      />
                                    </div>
                                  </td>

                                  {/* ✅ Unit/Box */}
                                  <td className="rp-right rp-strong" style={{ fontVariantNumeric: "tabular-nums" }}>
                                    {r.uom === "BOX" ? r.units_per_box : "—"}
                                  </td>

                                  {/* ✅ Total Qty */}
                                  <td className="rp-right rp-strong" style={{ fontVariantNumeric: "tabular-nums" }}>
                                    {r.total_qty}
                                  </td>

                                  {/* ✅ Description auto */}
                                  <td style={{ fontWeight: 850 }}>{r.description || "—"}</td>

                                  {/* ✅ Unit Ex */}
                                  <td className="rp-right rp-col-hide-sm">
                                    <input
                                      className={qtyInputCls}
                                      inputMode="decimal"
                                      value={r.unitExcl}
                                      onChange={(e) => setItem(r.id, { unitExcl: n2(e.target.value) })}
                                    />
                                  </td>

                                  <td className="rp-right rp-col-hide-sm rp-strong">{money(r.unitVat)}</td>
                                  <td className="rp-right rp-col-hide-sm rp-strong">{money(r.unitIncl)}</td>

                                  <td className="rp-right rp-strong">{money(r.lineTotal)}</td>

                                  <td style={{ textAlign: "right" }}>
                                    {items.length > 1 && (
                                      <button type="button" className="rp-chip" onClick={() => removeRow(r.id)}>
                                        Remove
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Totals bar */}
                      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 340px", gap: 12, alignItems: "start" }}>
                        <div className="rp-muted" style={{ fontWeight: 900 }}>
                          Tip: Select product → Unit Ex fills. Choose BOX/PCS → Total Qty updates instantly.
                        </div>

                        <div className="rp-card" style={{ margin: 0 }}>
                          <div className="rp-card-body">
                            <div style={{ display: "grid", gap: 8 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 950 }}>
                                <span>SUBTOTAL</span>
                                <span>{money(totals.subtotal)}</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 950 }}>
                                <span>VAT (15%)</span>
                                <span>{money(totals.vat)}</span>
                              </div>
                              <div style={{ height: 1, background: "rgba(148,163,184,.35)" }} />
                              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 1000, fontSize: 16 }}>
                                <span>TOTAL</span>
                                <span>{money(totals.total)}</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => void save()}
                                disabled={saving}
                                style={{
                                  marginTop: 8,
                                  borderRadius: 14,
                                  border: "none",
                                  background: `linear-gradient(135deg, ${red}, #b4000b)`,
                                  color: "white",
                                  fontWeight: 1000,
                                  letterSpacing: ".02em",
                                  boxShadow: "0 18px 50px rgba(227,6,19,.25)",
                                  padding: "12px 14px",
                                  cursor: saving ? "not-allowed" : "pointer",
                                  opacity: saving ? 0.75 : 1,
                                }}
                                title="Ctrl/⌘ + Enter"
                              >
                                {saving ? "Saving…" : "Save Credit Note"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

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
              </div>
            </div>
          </section>

          <footer className="rp-footer rp-card-anim" style={{ animationDelay: "260ms" }}>
            © {new Date().getFullYear()} Ram Pottery Ltd • Built by <span>MoBiz.mu</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
