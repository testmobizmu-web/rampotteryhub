"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";

type MovementType = "IN" | "OUT" | "ADJUSTMENT";

type Product = {
  id: number;
  item_code: string | null;
  sku: string | null;
  name: string | null;
  image_url: string | null;
  current_stock: number | null;
  cost_price: number | null;
};

type MovementRow = {
  id: number;
  product_id: number;
  movement_date: string;
  movement_type: MovementType;
  quantity: number;
  reference: string | null;
  notes: string | null;
  source_table: string | null;
  source_id: number | null;
};

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
}
function num(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function escCsv(v: any) {
  const s = String(v ?? "");
  if (/[,"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export default function StockMovementsClient() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<MovementRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);

  // filters
  const [q, setQ] = useState("");
  const [type, setType] = useState<MovementType | "ALL">("ALL");

  // modal
  const [open, setOpen] = useState(false);
  const [mProductId, setMProductId] = useState<number | "">("");
  const [mType, setMType] = useState<MovementType>("IN");
  const [mQty, setMQty] = useState<string>("1");
  const [mRef, setMRef] = useState("");
  const [mNotes, setMNotes] = useState("");

  const productMap = useMemo(() => {
    const map: Record<number, Product> = {};
    for (const p of products) map[p.id] = p;
    return map;
  }, [products]);

  // KPIs
  const kpi = useMemo(() => {
    let valuation = 0;
    let totalStock = 0;

    for (const p of products) {
      const cs = num(p.current_stock);
      const cp = num(p.cost_price);
      totalStock += cs;
      valuation += cs * cp;
    }

    return {
      totalStock,
      valuation,
      products: products.length,
    };
  }, [products]);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("id, item_code, sku, name, image_url, current_stock, cost_price")
      .order("sku", { ascending: true });

    if (error) throw error;
    setProducts((data as any) ?? []);
  }

  async function loadMovements() {
    setLoading(true);
    setErr(null);

    try {
      // Avoid relational join to prevent {} errors if relationship/RLS breaks
      const { data, error } = await supabase
        .from("stock_movements")
        .select(
          "id, product_id, movement_date, movement_type, quantity, reference, notes, source_table, source_id"
        )
        .order("movement_date", { ascending: false })
        .limit(500);

      if (error) throw error;
      setRows(((data as any) ?? []) as MovementRow[]);
    } catch (e: any) {
      const msg =
        e?.message ||
        e?.hint ||
        e?.details ||
        (typeof e === "string" ? e : JSON.stringify(e));
      setErr(msg || "Cannot load movements");
      console.error("Stock movements load error:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        await loadProducts();
      } catch (e) {
        console.error(e);
      }
      await loadMovements();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (type !== "ALL" && r.movement_type !== type) return false;
      if (!qq) return true;

      const p = productMap[r.product_id];
      const hay = [
        p?.item_code,
        p?.sku,
        p?.name,
        r.reference,
        r.notes,
        r.source_table,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(qq);
    });
  }, [rows, q, type, productMap]);

  function exportCsv() {
    const header = [
      "Date",
      "Type",
      "Qty",
      "Item Code",
      "SKU",
      "Product",
      "Reference",
      "Source Table",
      "Source Id",
      "Notes",
    ];

    const lines = [header.join(",")];

    for (const r of filtered) {
      const p = productMap[r.product_id];
      lines.push(
        [
          escCsv(r.movement_date),
          escCsv(r.movement_type),
          escCsv(r.quantity),
          escCsv(p?.item_code ?? ""),
          escCsv(p?.sku ?? ""),
          escCsv(p?.name ?? ""),
          escCsv(r.reference ?? ""),
          escCsv(r.source_table ?? ""),
          escCsv(r.source_id ?? ""),
          escCsv(r.notes ?? ""),
        ].join(",")
      );
    }

    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-movements-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }

  async function saveManual() {
    if (!mProductId) {
      alert("Select a product");
      return;
    }

    const qtyRaw = Number(mQty);
    if (!Number.isFinite(qtyRaw) || qtyRaw === 0) {
      alert("Quantity must be a number (non-zero).");
      return;
    }

    const pid = Number(mProductId);

    // DB rule: quantity MUST be > 0 always
    const qty = Math.abs(qtyRaw);

    // For ADJUSTMENT, we keep movement_type = ADJUSTMENT and store direction in notes.
    // Because your CHECK does not allow negative quantity.
    const finalNotes =
      mType === "ADJUSTMENT"
        ? `${qtyRaw < 0 ? "ADJUSTMENT (-)" : "ADJUSTMENT (+)"}${
            mNotes ? ` — ${mNotes}` : ""
          }`
        : mNotes || null;

    const payload: any = {
      product_id: pid,
      movement_type: mType, // IN | OUT | ADJUSTMENT (matches DB)
      quantity: qty, // always positive (matches DB)
      reference: mRef || null,
      notes: finalNotes,
      source_table: "manual",
      source_id: null,
    };

    setLoading(true);
    setErr(null);

    const { error } = await supabase.from("stock_movements").insert(payload);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setOpen(false);
    setMProductId("");
    setMType("IN");
    setMQty("1");
    setMRef("");
    setMNotes("");

    // IMPORTANT: you have trg_apply_stock_movement() trigger,
    // so stock will be updated in DB automatically.
    // We just reload products + movements.
    await loadProducts();
    await loadMovements();
  }

  return (
    <div className="rp-app">
      {/* Background (same premium shell used on Products) */}
      <div className="rp-bg" aria-hidden="true">
        <span className="rp-bg-orb rp-bg-orb--1" />
        <span className="rp-bg-orb rp-bg-orb--2" />
        <span className="rp-bg-orb rp-bg-orb--3" />
        <span className="rp-bg-grid" />
      </div>

      {/* Mobile top */}
      <div className="rp-mtop">
        <a className="rp-icon-btn" href="#rp-drawer" aria-label="Open menu">
          <span className="rp-burger" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </a>

        <div className="rp-mtop-brand">
          <div className="rp-mtop-title">Stock Movements</div>
          <div className="rp-mtop-sub">IN • OUT • Adjustments</div>
        </div>

        <button
          className="rp-icon-btn"
          onClick={() => setOpen(true)}
          aria-label="Manual adjustment"
        >
          +
        </button>
      </div>

      {/* Mobile drawer */}
      <div id="rp-drawer" className="rp-drawer" role="dialog" aria-modal="true">
        <div className="rp-drawer-head">
          <div className="rp-drawer-brand">
            <div className="rp-drawer-logo">
              <Image
                src="/images/logo/logo.png"
                alt="Ram Pottery"
                width={34}
                height={34}
              />
            </div>
            <div>
              <div className="rp-drawer-title">Ram Pottery Ltd</div>
              <div className="rp-drawer-sub">Secure • Cloud</div>
            </div>
          </div>
          <a className="rp-icon-btn" href="#" aria-label="Close">
            ✕
          </a>
        </div>

        <div className="rp-side-card" style={{ margin: 12 }}>
          <nav className="rp-nav">
            <Link className="rp-nav-btn" href="/">
              Dashboard
            </Link>
            <Link className="rp-nav-btn" href="/invoices">
              Invoices
            </Link>
            <Link className="rp-nav-btn" href="/credit-notes">
              Credit Notes
            </Link>
            <Link className="rp-nav-btn" href="/products">
              Stock & Categories
            </Link>
            <Link className="rp-nav-btn rp-nav-btn--active" href="/stock-movements">
              Stock Movements
            </Link>
            <Link className="rp-nav-btn" href="/customers">
              Customers
            </Link>
            <Link className="rp-nav-btn" href="/suppliers">
              Suppliers
            </Link>
            <Link className="rp-nav-btn" href="/reports">
              Reports & Statements
            </Link>
            <Link className="rp-nav-btn" href="/admin/users">
              Users & Permissions
            </Link>
          </nav>
        </div>
      </div>

      <div className="rp-shell rp-enter">
        {/* Desktop sidebar */}
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
                <div className="rp-brand-sub">
                  Online Accounting & Stock Manager
                </div>
              </div>
            </div>

            <nav className="rp-nav">
              <Link className="rp-nav-btn" href="/">
                Dashboard
              </Link>
              <Link className="rp-nav-btn" href="/invoices">
                Invoices
              </Link>
              <Link className="rp-nav-btn" href="/credit-notes">
                Credit Notes
              </Link>
              <Link className="rp-nav-btn" href="/products">
                Stock & Categories
              </Link>
              <Link className="rp-nav-btn rp-nav-btn--active" href="/stock-movements">
                Stock Movements
              </Link>
              <Link className="rp-nav-btn" href="/customers">
                Customers
              </Link>
              <Link className="rp-nav-btn" href="/suppliers">
                Suppliers
              </Link>
              <Link className="rp-nav-btn" href="/reports">
                Reports & Statements
              </Link>
              <Link className="rp-nav-btn" href="/admin/users">
                Users & Permissions
              </Link>
            </nav>

            <div className="rp-side-footer">
              <div className="rp-role">
                <span>Module</span>
                <b>Inventory</b>
              </div>
            </div>
          </div>
        </aside>

        <main className="rp-main">
          {/* Top */}
          <div className="rp-top rp-card-anim" style={{ animationDelay: "40ms" }}>
            <div className="rp-title">
              <div className="rp-eyebrow">
                <span className="rp-tag">Inventory</span>
                <span className="rp-tag">Audit Trail</span>
                <span className="rp-tag">Auto from invoices</span>
              </div>
              <h1>Stock Movements</h1>
              <p>Track stock in, stock out, and adjustments.</p>
            </div>

            <div className="rp-top-right">
              <button
                className="rp-seg-item rp-seg-item--primary"
                onClick={() => setOpen(true)}
              >
                + Manual Adjustment
              </button>
              <button className="rp-seg-item" onClick={exportCsv}>
                Export CSV
              </button>
              <button
                className="rp-seg-item"
                onClick={loadMovements}
                disabled={loading}
              >
                {loading ? "Loading…" : "Refresh"}
              </button>
            </div>
          </div>

          {/* KPI */}
          <section className="rp-kpis rp-card-anim" style={{ animationDelay: "90ms" }}>
            <div className="rp-kpi rp-glass">
              <div className="rp-kpi-label">Products</div>
              <div className="rp-kpi-value">{kpi.products}</div>
            </div>
            <div className="rp-kpi rp-glass">
              <div className="rp-kpi-label">Total Stock (pcs)</div>
              <div className="rp-kpi-value">{kpi.totalStock}</div>
            </div>
            <div className="rp-kpi rp-glass">
              <div className="rp-kpi-label">Stock Valuation (Rs)</div>
              <div className="rp-kpi-value">{kpi.valuation.toFixed(2)}</div>
              <div className="rp-kpi-sub">Based on cost_price × current_stock</div>
            </div>
          </section>

          {/* Filters */}
          <section className="rp-card rp-glass rp-card-anim" style={{ animationDelay: "120ms" }}>
            <header className="rp-card-head rp-card-head--tight">
              <div>
                <div className="rp-card-title">Movement History</div>
                <div className="rp-card-sub">
                  Showing: {filtered.length} (latest 500 loaded)
                </div>
              </div>

              <div className="rp-actions">
                <div className="rp-filter">
                  <input
                    className="rp-input"
                    placeholder="Search item code / sku / product / reference…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>

                <select
                  className="rp-input"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                >
                  <option value="ALL">All</option>
                  <option value="IN">IN</option>
                  <option value="OUT">OUT</option>
                  <option value="ADJUSTMENT">ADJUSTMENT</option>
                </select>
              </div>
            </header>

            <div className="rp-card-body">
              {err && (
                <div className="rp-alert rp-alert--danger" style={{ marginBottom: 12 }}>
                  <b>Cannot load movements:</b> {err}
                </div>
              )}

              <div className="rp-table-wrap">
                <table className="rp-table">
                  <thead>
                    <tr>
                      <th style={{ width: 170 }}>Date</th>
                      <th style={{ width: 110 }}>Type</th>
                      <th style={{ width: 110, textAlign: "right" }}>Qty</th>
                      <th style={{ width: 140 }}>Item Code</th>
                      <th style={{ width: 110 }}>Photo</th>
                      <th>Product</th>
                      <th style={{ width: 180 }}>Reference</th>
                      <th style={{ width: 140 }}>Source</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((r) => {
                      const p = productMap[r.product_id];
                      const code = p?.item_code || p?.sku || "—";
                      const img = p?.image_url || null;

                      const pillClass =
                        r.movement_type === "IN"
                          ? "rp-pill rp-pill--in"
                          : r.movement_type === "OUT"
                          ? "rp-pill rp-pill--out"
                          : "rp-pill rp-pill--adj";

                      return (
                        <tr key={r.id}>
                          <td>{fmtDate(r.movement_date)}</td>

                          <td>
                            <span className={pillClass}>
                              {r.movement_type === "ADJUSTMENT" ? "ADJ" : r.movement_type}
                            </span>
                          </td>

                          <td style={{ textAlign: "right" }} className="rp-strong">
                            {r.movement_type === "ADJUSTMENT" && r.notes?.includes("(-)") ? "-" : "+"}
                            {Number(r.quantity).toFixed(0)}
                          </td>

                          <td className="rp-strong">{code}</td>

                          <td>
                            {img ? (
                              <a
                                className="rp-thumb"
                                href={img}
                                target="_blank"
                                rel="noreferrer"
                                title="Open image"
                              >
                                <Image
                                  src={img}
                                  alt={p?.name || code}
                                  fill
                                  className="rp-thumb-img"
                                  sizes="60px"
                                />
                              </a>
                            ) : (
                              <div className="rp-thumb rp-thumb--empty" title="No image">
                                <span>—</span>
                              </div>
                            )}
                          </td>

                          <td>
                            {p?.name || <span className="rp-muted">—</span>}
                            {r.notes ? (
                              <div className="rp-muted" style={{ marginTop: 4 }}>
                                {r.notes}
                              </div>
                            ) : null}
                          </td>

                          <td>{r.reference || <span className="rp-muted">—</span>}</td>

                          <td>
                            {r.source_table ? (
                              <span className="rp-soft-pill">
                                {r.source_table}
                                {r.source_id != null ? ` #${r.source_id}` : ""}
                              </span>
                            ) : (
                              <span className="rp-muted">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {!filtered.length && (
                      <tr>
                        <td colSpan={8} className="rp-td-empty">
                          No stock movements found.
                          <div className="rp-help" style={{ marginTop: 6 }}>
                            Tip: movements are logged automatically on invoice ISSUED (OUT), credit note ISSUED (IN),
                            or via manual adjustments.
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="rp-help" style={{ marginTop: 10 }}>
                Inventory movements are logged automatically on invoices and adjustments.
              </div>
            </div>
          </section>

          <footer className="rp-footer rp-card-anim" style={{ animationDelay: "200ms" }}>
            © 2025 Ram Pottery Ltd • Built by <span>MoBiz.mu</span>
          </footer>
        </main>
      </div>

      {/* Modal */}
      {open && (
        <div className="rp-modal-backdrop" role="dialog" aria-modal="true">
          <div className="rp-modal rp-glass">
            <div className="rp-modal-head">
              <div>
                <div className="rp-card-title">Manual Adjustment</div>
                <div className="rp-card-sub">IN / OUT / ADJUSTMENT</div>
              </div>
              <button
                className="rp-icon-btn"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="rp-modal-body">
              <div className="rp-form-grid">
                <div className="rp-field">
                  <label>Product</label>
                  <select
                    className="rp-input"
                    value={mProductId}
                    onChange={(e) =>
                      setMProductId(e.target.value ? Number(e.target.value) : "")
                    }
                  >
                    <option value="">Select product…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {(p.item_code || p.sku || "—")} — {p.name || ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rp-field">
                  <label>Type</label>
                  <select
                    className="rp-input"
                    value={mType}
                    onChange={(e) => setMType(e.target.value as MovementType)}
                  >
                    <option value="IN">IN (stock in)</option>
                    <option value="OUT">OUT (stock out)</option>
                    <option value="ADJUSTMENT">ADJUSTMENT (can be + or -)</option>
                  </select>
                </div>

                <div className="rp-field">
                  <label>Quantity</label>
                  <input
                    className="rp-input"
                    value={mQty}
                    onChange={(e) => setMQty(e.target.value)}
                  />
                  <div className="rp-help">
                    For <b>ADJUSTMENT</b>, you can type <b>-5</b> or <b>+5</b>.
                    Database stores quantity as positive; direction is kept in notes.
                  </div>
                </div>

                <div className="rp-field">
                  <label>Reference</label>
                  <input
                    className="rp-input"
                    value={mRef}
                    onChange={(e) => setMRef(e.target.value)}
                    placeholder="e.g. Stock count / Damage / Supplier"
                  />
                </div>

                <div className="rp-field" style={{ gridColumn: "1 / -1" }}>
                  <label>Notes</label>
                  <textarea
                    className="rp-input"
                    value={mNotes}
                    onChange={(e) => setMNotes(e.target.value)}
                    rows={3}
                    placeholder="Optional notes…"
                  />
                </div>
              </div>

              <div className="rp-modal-actions">
                <button className="rp-seg-item" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button
                  className="rp-seg-item rp-seg-item--primary"
                  onClick={saveManual}
                  disabled={loading}
                >
                  {loading ? "Saving…" : "Save Adjustment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
