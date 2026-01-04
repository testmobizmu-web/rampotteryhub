"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

type RpSession = {
  id?: string;
  username?: string;
  name?: string;
  role?: string;
};

function roleUpper(r?: string) {
  return String(r || "").toUpperCase();
}

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
function fmtDateTime(d: Date) {
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;
}
function sourceLabel(r: MovementRow) {
  if (!r.source_table) return "—";
  return `${r.source_table}${r.source_id != null ? ` #${r.source_id}` : ""}`;
}
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      return true;
    } catch {
      return false;
    }
  }
}

export default function StockMovementsClient() {
  // hydration + shell
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lastSync, setLastSync] = useState<string>("—");
  const [session, setSession] = useState<RpSession | null>(null);

  // toast
  const [toast, setToast] = useState<string | null>(null);
  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  }

  // data
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

  // ✅ EXACT invoice-style kebab state
  const [openMenu, setOpenMenu] = useState<number | string | null>(null);

  // ref for modal first field focus
  const modalFirstRef = useRef<HTMLSelectElement | null>(null);

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

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const saved = localStorage.getItem("rp_theme");
    const initial = saved === "dark" ? "dark" : "light";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;

    try {
      const raw = localStorage.getItem("rp_user");
      if (raw) setSession(JSON.parse(raw));
    } catch {
      // ignore
    }

    setLastSync(fmtDateTime(new Date()));
  }, []);

  // ✅ EXACT invoice-style: window click closes menu
  useEffect(() => {
    const close = () => setOpenMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("rp_theme", next);
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      localStorage.removeItem("rp_user");
      window.location.href = "/login";
    }
  }

  const userLabel = useMemo(() => {
    const name = (session?.name || session?.username || "").trim();
    return name || "User";
  }, [session]);

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
      const { data, error } = await supabase
        .from("stock_movements")
        .select("id, product_id, movement_date, movement_type, quantity, reference, notes, source_table, source_id")
        .order("movement_date", { ascending: false })
        .limit(500);

      if (error) throw error;
      setRows(((data as any) ?? []) as MovementRow[]);
      setLastSync(fmtDateTime(new Date()));
    } catch (e: any) {
      const msg = e?.message || e?.hint || e?.details || (typeof e === "string" ? e : JSON.stringify(e));
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
      const hay = [p?.item_code, p?.sku, p?.name, r.reference, r.notes, r.source_table]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(qq);
    });
  }, [rows, q, type, productMap]);

  function exportCsv() {
    const header = ["Date", "Type", "Qty", "Item Code", "SKU", "Product", "Reference", "Source Table", "Source Id", "Notes"];
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

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-movements-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);

    showToast("CSV exported ✅");
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

    // ADJUSTMENT direction stored in notes
    const finalNotes =
      mType === "ADJUSTMENT"
        ? `${qtyRaw < 0 ? "ADJUSTMENT (-)" : "ADJUSTMENT (+)"}${mNotes ? ` — ${mNotes}` : ""}`
        : mNotes || null;

    const payload: any = {
      product_id: pid,
      movement_type: mType,
      quantity: qty,
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

    await loadProducts();
    await loadMovements();
    showToast("Adjustment saved ✅");
  }

  // modal focus
  useEffect(() => {
    if (!open) return;
    window.setTimeout(() => modalFirstRef.current?.focus(), 60);
  }, [open]);

  // ESC closes modal / drawer / menu
  useEffect(() => {
    if (!mounted) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (openMenu != null) {
          e.preventDefault();
          setOpenMenu(null);
          return;
        }
        if (open) {
          e.preventDefault();
          setOpen(false);
          return;
        }
        if (drawerOpen) {
          e.preventDefault();
          setDrawerOpen(false);
          return;
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, open, drawerOpen, openMenu]);

  const canSeeAdminNav = mounted && roleUpper(session?.role) === "ADMIN";
  const navItems = useMemo(() => {
    const base = [
      { href: "/", label: "Dashboard" },
      { href: "/invoices", label: "Invoices" },
      { href: "/credit-notes", label: "Credit Notes" },
      { href: "/stock", label: "Stock & Categories" },
      { href: "/stock-movements", label: "Stock Movements" },
      { href: "/customers", label: "Customers" },
      { href: "/reports", label: "Reports & Statements" },
    ];
    if (canSeeAdminNav) base.push({ href: "/admin/users", label: "Users & Permissions" });
    return base;
  }, [canSeeAdminNav]);

  const roleLabel = useMemo(() => roleUpper(session?.role) || "STAFF", [session?.role]);

  if (!mounted) return null;

  return (
    <div className="rp-app">
      {/* Premium background */}
      <div className="rp-bg" aria-hidden="true">
        <div className="rp-bg-orb rp-bg-orb--1" />
        <div className="rp-bg-orb rp-bg-orb--2" />
        <div className="rp-bg-orb rp-bg-orb--3" />
        <div className="rp-bg-grid" />
      </div>

      {/* Toast */}
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
          <button
            type="button"
            className="rp-icon-btn rp-burger"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <span aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>

          <div className="rp-mtop-brand">
            <div className="rp-mtop-title">RampotteryHUB</div>
            <div className="rp-mtop-sub">Stock Movements</div>
          </div>

          <button type="button" className="rp-icon-btn" onClick={() => setOpen(true)} aria-label="Manual adjustment">
            ＋
          </button>
        </div>

        {/* Overlay + Drawer */}
        <button
          className={`rp-overlay ${drawerOpen ? "is-open" : ""}`}
          onClick={() => setDrawerOpen(false)}
          aria-label="Close menu"
        />
        <aside className={`rp-drawer ${drawerOpen ? "is-open" : ""}`}>
          <div className="rp-drawer-head">
            <div className="rp-drawer-brand">
              <div className="rp-drawer-logo">
                <Image src="/images/logo/logo.png" alt="Ram Pottery Ltd" width={28} height={28} priority />
              </div>
              <div>
                <div className="rp-drawer-title">RampotteryHUB</div>
                <div className="rp-drawer-sub">Inventory audit trail</div>
              </div>
            </div>

            <button type="button" className="rp-icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Close">
              ✕
            </button>
          </div>

          <div className="rp-drawer-body">
            <nav className="rp-nav">
              {navItems.map((it) => (
                <Link
                  key={it.href}
                  className={`rp-nav-btn ${it.href === "/stock-movements" ? "rp-nav-btn--active" : ""}`}
                  href={it.href}
                  onClick={() => setDrawerOpen(false)}
                  prefetch={false}
                >
                  <span className="rp-ic3d" aria-hidden="true">
                    ▶
                  </span>
                  {it.label}
                </Link>
              ))}
            </nav>

            <div className="rp-side-footer rp-side-footer--in">
              <div className="rp-role">
                <span>Signed in</span>
                <b title={userLabel}>{userLabel}</b>
              </div>
              <div className="rp-role" style={{ marginTop: 10 }}>
                <span>Role</span>
                <b>{roleLabel}</b>
              </div>
            </div>
          </div>
        </aside>

        {/* Desktop sidebar */}
        <aside className="rp-side">
          <div className="rp-side-card rp-card-anim">
            <div className="rp-brand">
              <div className="rp-brand-logo">
                <Image src="/images/logo/logo.png" alt="Ram Pottery Ltd" width={30} height={30} priority />
              </div>
              <div>
                <div className="rp-brand-title">RampotteryHUB</div>
                <div className="rp-brand-sub">Accounting & Stock System</div>
              </div>
            </div>

            <nav className="rp-nav">
              {navItems.map((it) => (
                <Link
                  key={it.href}
                  className={`rp-nav-btn ${it.href === "/stock-movements" ? "rp-nav-btn--active" : ""}`}
                  href={it.href}
                  prefetch={false}
                >
                  <span className="rp-ic3d" aria-hidden="true">
                    ▶
                  </span>
                  {it.label}
                </Link>
              ))}
            </nav>

            <div className="rp-side-footer rp-side-footer--in">
              <div className="rp-role">
                <span>Signed in</span>
                <b title={userLabel}>{userLabel}</b>
              </div>
              <div className="rp-role" style={{ marginTop: 10 }}>
                <span>Role</span>
                <b>{roleLabel}</b>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="rp-main">
          {/* Top bar */}
          <header className="rp-top rp-top--saas rp-card-anim" style={{ animationDelay: "60ms" }}>
            <div className="rp-top-left--actions">
              <button type="button" className="rp-ui-btn rp-ui-btn--brand" onClick={toggleTheme}>
                <span className="rp-ui-btn__dot" aria-hidden="true" />
                {theme === "dark" ? "☀ Light" : "🌙 Dark"}
              </button>

              <button type="button" className="rp-ui-btn rp-ui-btn--danger" onClick={handleLogout}>
                <span className="rp-ui-btn__dot" aria-hidden="true" />
                Log Out
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
                <div className="rp-sync-time">{lastSync || "—"}</div>
              </div>
            </div>
          </header>

          {/* Executive header */}
          <section className="rp-exec rp-card-anim">
            <div className="rp-exec__left">
              <div className="rp-exec__title">Stock Movements</div>
              <div className="rp-exec__sub">Track IN • OUT • Adjustments (latest 500)</div>
            </div>
            <div className="rp-exec__right">
              <span className={`rp-live ${loading ? "is-dim" : ""}`}>
                <span className="rp-live-dot" aria-hidden="true" />
                {loading ? "Syncing" : "Live"}
              </span>
              <span className="rp-chip rp-chip--soft">Inventory</span>
            </div>
          </section>

          {/* KPI row */}
          <section className="rp-kpi-pro rp-card-anim">
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Products</div>
              <div className="rp-kpi-pro__value">{kpi.products}</div>
              <div className="rp-kpi-pro__sub">Tracked</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Total Stock</div>
              <div className="rp-kpi-pro__value">{kpi.totalStock}</div>
              <div className="rp-kpi-pro__sub">pcs</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Valuation</div>
              <div className="rp-kpi-pro__value">{kpi.valuation.toFixed(2)}</div>
              <div className="rp-kpi-pro__sub">Rs (cost × stock)</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Loaded</div>
              <div className="rp-kpi-pro__value">{rows.length}</div>
              <div className="rp-kpi-pro__sub">Movements</div>
            </div>
          </section>

          {/* Actions */}
          <section className="rp-actions rp-card-anim">
            <div className="rp-seg rp-seg--pro">
              <button className="rp-seg-item rp-seg-item--brand" type="button" onClick={() => setOpen(true)}>
                <span className="rp-icbtn" aria-hidden="true">
                  ＋
                </span>
                Manual Adjustment
              </button>

              <button className="rp-seg-item rp-seg-item--brand" type="button" onClick={exportCsv}>
                <span className="rp-icbtn" aria-hidden="true">
                  ⇩
                </span>
                Export CSV
              </button>

              <button className="rp-seg-item rp-seg-item--brand" type="button" onClick={loadMovements} disabled={loading}>
                <span className="rp-icbtn" aria-hidden="true">
                  ⟳
                </span>
                {loading ? "Loading…" : "Refresh"}
              </button>

              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span className="rp-chip rp-chip--soft">
                  Showing <b style={{ marginLeft: 6 }}>{filtered.length}</b>
                </span>
                {err ? <span className="rp-chip rp-chip--warn">Error</span> : <span className="rp-chip">Ready</span>}
              </div>
            </div>
          </section>

          {/* History */}
          <section className="rp-card rp-card-anim">
            <div className="rp-card-head rp-card-head--tight">
              <div>
                <div className="rp-card-title">Movement History</div>
                <div className="rp-card-sub">Search item code / sku / product / reference</div>
              </div>

              <div className="rp-actions" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input className="rp-input" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} style={{ minWidth: 240 }} />

                <select className="rp-input" value={type} onChange={(e) => setType(e.target.value as any)}>
                  <option value="ALL">All</option>
                  <option value="IN">IN</option>
                  <option value="OUT">OUT</option>
                  <option value="ADJUSTMENT">ADJUSTMENT</option>
                </select>
              </div>
            </div>

            <div className="rp-card-body">
              {err && (
                <div className="rp-note rp-note--warn" style={{ marginBottom: 12, whiteSpace: "pre-wrap" }}>
                  <b>Cannot load movements:</b> {err}
                </div>
              )}

              {/* Mobile cards */}
              <div className="sm:hidden" style={{ display: "grid", gap: 10 }}>
                {filtered.map((r) => {
                  const p = productMap[r.product_id];
                  const code = p?.item_code || p?.sku || "—";
                  const img = p?.image_url || null;

                  const typeLabel = r.movement_type === "ADJUSTMENT" ? "ADJ" : r.movement_type;
                  const isAdjMinus = r.movement_type === "ADJUSTMENT" && (r.notes || "").includes("(-)");
                  const sign = r.movement_type === "OUT" ? "-" : r.movement_type === "IN" ? "+" : isAdjMinus ? "-" : "+";

                  const pillClass =
                    r.movement_type === "IN"
                      ? "rp-pill rp-pill--in"
                      : r.movement_type === "OUT"
                      ? "rp-pill rp-pill--out"
                      : "rp-pill rp-pill--adj";

                  return (
                    <div key={r.id} className="rp-rowcard">
                      <div className="rp-rowcard__top">
                        <div className="rp-rowcard__left">
                          <div className="rp-rowcard__title">{p?.name || "—"}</div>
                          <div className="rp-rowcard__sub">
                            <span className="rp-soft-pill">{code}</span>
                            <span className="rp-muted" style={{ marginLeft: 8 }}>
                              {fmtDate(r.movement_date)}
                            </span>
                          </div>
                        </div>

                        <div className="rp-rowcard__right">
                          <span className={pillClass}>{typeLabel}</span>
                          <div className="rp-rowcard__qty">
                            {sign}
                            {Number(r.quantity).toFixed(0)}
                          </div>
                        </div>
                      </div>

                      <div className="rp-rowcard__mid">
                        <div className="rp-rowcard__thumb">
                          {img ? (
                            <a className="rp-thumb" href={img} target="_blank" rel="noreferrer" title="Open image">
                              <Image src={img} alt={p?.name || code} fill className="rp-thumb-img" sizes="60px" />
                            </a>
                          ) : (
                            <div className="rp-thumb rp-thumb--empty">
                              <span>—</span>
                            </div>
                          )}
                        </div>

                        <div className="rp-rowcard__meta">
                          <div className="rp-rowcard__line">
                            <span className="rp-muted">Reference:</span> <b>{r.reference || "—"}</b>
                          </div>
                          <div className="rp-rowcard__line">
                            <span className="rp-muted">Source:</span>{" "}
                            {r.source_table ? <span className="rp-soft-pill">{sourceLabel(r)}</span> : <b>—</b>}
                          </div>
                          {r.notes ? (
                            <div className="rp-rowcard__notes">
                              <span className="rp-muted">Notes:</span> {r.notes}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {!filtered.length && (
                  <div className="rp-td-empty" style={{ padding: 14 }}>
                    No stock movements found.
                    <div className="rp-help" style={{ marginTop: 6 }}>
                      Tip: movements are logged automatically on invoice ISSUED (OUT), credit note ISSUED (IN), or via manual adjustments.
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop table */}
              <div className="rp-table-wrap hidden sm:block">
                <table className="rp-table rp-table--premium">
                  <thead>
                    <tr>
                      <th style={{ width: 190 }}>Date</th>
                      <th style={{ width: 110 }}>Type</th>
                      <th style={{ width: 110, textAlign: "right" }}>Qty</th>
                      <th style={{ width: 150 }}>Item Code</th>
                      <th style={{ width: 110 }}>Photo</th>
                      <th>Product</th>
                      <th style={{ width: 180 }}>Ref</th>
                      <th style={{ width: 64 }} />
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

                      const qtySign =
                        r.movement_type === "ADJUSTMENT" && r.notes?.includes("(-)")
                          ? "-"
                          : r.movement_type === "OUT"
                          ? "-"
                          : "+";

                      return (
                        <tr key={r.id} className="rp-row-hover">
                          <td>{fmtDate(r.movement_date)}</td>

                          <td>
                            <span className={pillClass}>{r.movement_type === "ADJUSTMENT" ? "ADJ" : r.movement_type}</span>
                          </td>

                          <td className="rp-strong" style={{ textAlign: "right" }}>
                            {qtySign}
                            {Number(r.quantity).toFixed(0)}
                          </td>

                          <td className="rp-strong">{code}</td>

                          <td>
                            {img ? (
                              <a className="rp-thumb" href={img} target="_blank" rel="noreferrer" title="Open image">
                                <Image src={img} alt={p?.name || code} fill className="rp-thumb-img" sizes="60px" />
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

                          <td>
                            {r.reference ? <span className="rp-soft-pill">{r.reference}</span> : <span className="rp-muted">—</span>}
                          </td>

                          {/* ✅ EXACT Invoices-style ⋮ */}
                          <td className="rp-actions-cell">
                            <button
                              type="button"
                              className="rp-row-actions-btn"
                              aria-label="Movement actions"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenu(openMenu === r.id ? null : r.id);
                              }}
                            >
                              ⋮
                            </button>

                            {openMenu === r.id && (
                              <div className="rp-row-actions-menu" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={async () => {
                                    setOpenMenu(null);
                                    const ok = await copyToClipboard(sourceLabel(r));
                                    showToast(ok ? "Source copied ✅" : "Copy failed");
                                  }}
                                >
                                  Copy Source
                                </button>

                                <button
                                  disabled={!r.reference}
                                  onClick={async () => {
                                    setOpenMenu(null);
                                    const ok = await copyToClipboard(r.reference || "");
                                    showToast(ok ? "Reference copied ✅" : "Copy failed");
                                  }}
                                >
                                  Copy Reference
                                </button>

                                <button
                                  disabled={!r.notes}
                                  onClick={async () => {
                                    setOpenMenu(null);
                                    const ok = await copyToClipboard(r.notes || "");
                                    showToast(ok ? "Notes copied ✅" : "Copy failed");
                                  }}
                                >
                                  Copy Notes
                                </button>

                                <div className="rp-row-actions-sep" />

                                <button
                                  className="danger"
                                  disabled={!img}
                                  onClick={() => {
                                    setOpenMenu(null);
                                    if (img) window.open(img, "_blank", "noopener,noreferrer");
                                  }}
                                >
                                  Open Photo
                                </button>
                              </div>
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
                            Tip: movements are logged automatically on invoice ISSUED (OUT), credit note ISSUED (IN), or via manual adjustments.
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

          <footer className="rp-footer">© {new Date().getFullYear()} Ram Pottery Ltd • Built by Mobiz.mu</footer>
        </main>
      </div>

      {/* Modal */}
      {open && (
        <div className="rp-modal-backdrop" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <div className="rp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rp-modal-head">
              <div>
                <div className="rp-modal-title">Manual Adjustment</div>
                <div className="rp-modal-sub">IN / OUT / ADJUSTMENT</div>
              </div>
              <button className="rp-ui-btn rp-ui-btn--brand" type="button" onClick={() => setOpen(false)}>
                <span className="rp-ui-btn__dot" aria-hidden="true" />✕ Close
              </button>
            </div>

            <div className="rp-modal-body">
              <div className="rp-form-grid">
                <label className="rp-field">
                  <span className="rp-label">Product</span>
                  <select
                    ref={modalFirstRef}
                    className="rp-input"
                    value={mProductId}
                    onChange={(e) => setMProductId(e.target.value ? Number(e.target.value) : "")}
                  >
                    <option value="">Select product…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {(p.item_code || p.sku || "—")} — {p.name || ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="rp-field">
                  <span className="rp-label">Type</span>
                  <select className="rp-input" value={mType} onChange={(e) => setMType(e.target.value as MovementType)}>
                    <option value="IN">IN (stock in)</option>
                    <option value="OUT">OUT (stock out)</option>
                    <option value="ADJUSTMENT">ADJUSTMENT (can be + or -)</option>
                  </select>
                </label>

                <label className="rp-field">
                  <span className="rp-label">Quantity</span>
                  <input className="rp-input" value={mQty} onChange={(e) => setMQty(e.target.value)} />
                  <div className="rp-help" style={{ marginTop: 6 }}>
                    For <b>ADJUSTMENT</b>, you can type <b>-5</b> or <b>+5</b>. DB stores quantity positive; direction kept in notes.
                  </div>
                </label>

                <label className="rp-field">
                  <span className="rp-label">Reference</span>
                  <input
                    className="rp-input"
                    value={mRef}
                    onChange={(e) => setMRef(e.target.value)}
                    placeholder="e.g. Stock count / Damage / Supplier"
                  />
                </label>

                <label className="rp-field" style={{ gridColumn: "1 / -1" }}>
                  <span className="rp-label">Notes</span>
                  <textarea
                    className="rp-input"
                    value={mNotes}
                    onChange={(e) => setMNotes(e.target.value)}
                    rows={3}
                    placeholder="Optional notes…"
                    style={{ resize: "vertical" }}
                  />
                </label>
              </div>
            </div>

            <div className="rp-modal-foot">
              <button className="rp-ui-btn" type="button" onClick={() => setOpen(false)} disabled={loading}>
                <span className="rp-ui-btn__dot" aria-hidden="true" />
                Cancel
              </button>
              <button className="rp-ui-btn rp-ui-btn--danger" type="button" onClick={saveManual} disabled={loading}>
                <span className="rp-ui-btn__dot" aria-hidden="true" />
                {loading ? "Saving…" : "Save Adjustment"}
              </button>
            </div>

            {/* Small extra polish + mobile cards */}
            <style jsx>{`
              .rp-form-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 12px;
              }
              @media (max-width: 780px) {
                .rp-form-grid {
                  grid-template-columns: 1fr;
                }
              }
              .rp-rowcard {
                border: 1px solid var(--rp-border);
                background: var(--rp-card);
                border-radius: 18px;
                padding: 12px;
                box-shadow: 0 14px 40px rgba(0, 0, 0, 0.08);
              }
              .rp-rowcard__top {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 10px;
              }
              .rp-rowcard__title {
                font-weight: 950;
                letter-spacing: -0.2px;
              }
              .rp-rowcard__sub {
                margin-top: 6px;
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 8px;
                font-weight: 850;
              }
              .rp-rowcard__right {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 8px;
                min-width: 92px;
              }
              .rp-rowcard__qty {
                font-weight: 980;
                font-size: 16px;
              }
              .rp-rowcard__mid {
                margin-top: 10px;
                display: grid;
                grid-template-columns: 72px 1fr;
                gap: 10px;
                align-items: start;
              }
              .rp-rowcard__thumb {
                width: 72px;
              }
              .rp-rowcard__meta {
                display: grid;
                gap: 6px;
              }
              .rp-rowcard__line {
                font-weight: 900;
              }
              .rp-rowcard__notes {
                margin-top: 4px;
                color: var(--rp-muted);
                font-weight: 850;
                line-height: 1.25rem;
              }
              .rp-modal-title {
                font-weight: 950;
                font-size: 18px;
                letter-spacing: -0.2px;
              }
              .rp-modal-sub {
                margin-top: 4px;
                color: var(--rp-muted);
                font-weight: 800;
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}

