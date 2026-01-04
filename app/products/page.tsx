"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { rpFetch } from "@/lib/rpFetch";

type Product = {
  id: number;
  item_code: string | null;
  sku: string | null;
  name: string | null;
  description: string | null;
  units_per_box: number | null;
  selling_price: number | null;
  is_active: boolean | null;
  image_url: string | null;
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
function n0(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function fmtRs(v: any) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return `Rs ${n.toFixed(2)}`;
}
function fmtDateTime(d: Date) {
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;
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

export default function ProductsPage() {
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lastSync, setLastSync] = useState<string>("—");
  const [session, setSession] = useState<RpSession | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  }

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [rows, setRows] = useState<Product[]>([]);

  const [q, setQ] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);

  // Invoice-style kebab
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const saved = localStorage.getItem("rp_theme");
    const initial = saved === "dark" ? "dark" : "light";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;

    try {
      const raw = localStorage.getItem("rp_user");
      if (raw) setSession(JSON.parse(raw));
    } catch {}

    setLastSync(fmtDateTime(new Date()));
  }, []);

  // close kebab on outside click
  useEffect(() => {
    const close = () => setOpenMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // ESC closes modal/drawer/menu; Enter saves in modal
  useEffect(() => {
    if (!mounted) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (openMenu != null) {
          e.preventDefault();
          setOpenMenu(null);
          return;
        }
        if (editOpen) {
          e.preventDefault();
          setEditOpen(false);
          setEditing(null);
          return;
        }
        if (drawerOpen) {
          e.preventDefault();
          setDrawerOpen(false);
          return;
        }
      }
      if (e.key === "Enter" && editOpen) {
        e.preventDefault();
        void saveEdit();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, openMenu, editOpen, drawerOpen, editing]);

  // lock scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

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

  const canSeeAdminNav = mounted && roleUpper(session?.role) === "ADMIN";
  const navItems = useMemo(() => {
    const base = [
      { href: "/", label: "Dashboard" },
      { href: "/invoices", label: "Invoices" },
      { href: "/credit-notes", label: "Credit Notes" },
      { href: "/products", label: "Stock & Categories" },
      { href: "/stock-movements", label: "Stock Movements" },
      { href: "/customers", label: "Customers" },
      { href: "/suppliers", label: "Suppliers" },
      { href: "/reports", label: "Reports & Statements" },
    ];
    if (canSeeAdminNav) base.push({ href: "/admin/users", label: "Users & Permissions" });
    return base;
  }, [canSeeAdminNav]);

  const roleLabel = useMemo(() => roleUpper(session?.role) || "STAFF", [session?.role]);

  // ✅ FIX: use rpFetch so x-rp-user is attached -> no Unauthorized
  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await rpFetch(`/api/products/list?activeOnly=${activeOnly ? "1" : "0"}&limit=5000`, {
        cache: "no-store",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed to load");

      setRows((json.products || []) as Product[]);
      setLastSync(fmtDateTime(new Date()));
    } catch (e: any) {
      setErr(e?.message || "Cannot load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOnly]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter((p) => {
      if (!qq) return true;
      const hay = [p.item_code, p.sku, p.name, p.description].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(qq);
    });
  }, [rows, q]);

  const kpis = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((p) => p.is_active).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [rows]);

  function openEdit(p: Product) {
    setEditing({ ...p });
    setEditOpen(true);
    setOpenMenu(null);
    window.setTimeout(() => nameRef.current?.focus(), 80);
  }

  // ✅ FIX: use rpFetch (auth header + redirect)
  async function saveEdit() {
    if (!editing) return;
    try {
      setSaving(true);

      const payload = {
        id: editing.id,
        item_code: (editing.item_code || "").trim() || null,
        sku: (editing.sku || "").trim() || null,
        name: (editing.name || "").trim() || null,
        description: (editing.description || "").trim() || null,
        units_per_box: editing.units_per_box == null ? null : n0(editing.units_per_box),
        selling_price: editing.selling_price == null ? null : Number(editing.selling_price),
        image_url: (editing.image_url || "").trim() || null,
        is_active: !!editing.is_active,
      };

      const res = await rpFetch("/api/products/update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed");

      setEditOpen(false);
      setEditing(null);
      showToast("Saved ✅");
      await load();
    } catch (e: any) {
      alert(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  // ✅ FIX: use rpFetch
  async function archive(p: Product) {
    const label = p.name || p.item_code || p.sku || `ID ${p.id}`;
    const ok = window.confirm(`Archive product: ${label} ?\n\n(Archive = set inactive, safe for invoices.)`);
    if (!ok) return;

    try {
      setLoading(true);
      const res = await rpFetch("/api/products/archive", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: p.id }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed");

      showToast("Archived ✅");
      await load();
    } catch (e: any) {
      alert(e?.message || "Archive failed");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <div className="rp-app">
      <div className="rp-bg" aria-hidden="true">
        <div className="rp-bg-orb rp-bg-orb--1" />
        <div className="rp-bg-orb rp-bg-orb--2" />
        <div className="rp-bg-orb rp-bg-orb--3" />
        <div className="rp-bg-grid" />
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
          <button type="button" className="rp-icon-btn rp-burger" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <span aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>

          <div className="rp-mtop-brand">
            <div className="rp-mtop-title">RampotteryHUB</div>
            <div className="rp-mtop-sub">Stock & Categories</div>
          </div>

          <button type="button" className="rp-icon-btn" onClick={() => void load()} aria-label="Refresh">
            ⟳
          </button>
        </div>

        {/* Overlay + Drawer */}
        <button className={`rp-overlay ${drawerOpen ? "is-open" : ""}`} onClick={() => setDrawerOpen(false)} aria-label="Close menu" />
        <aside className={`rp-drawer ${drawerOpen ? "is-open" : ""}`}>
          <div className="rp-drawer-head">
            <div className="rp-drawer-brand">
              <div className="rp-drawer-logo">
                <Image src="/images/logo/logo.png" alt="Ram Pottery Ltd" width={28} height={28} priority />
              </div>
              <div>
                <div className="rp-drawer-title">RampotteryHUB</div>
                <div className="rp-drawer-sub">Catalog & stock</div>
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
                  className={`rp-nav-btn ${it.href === "/products" ? "rp-nav-btn--active" : ""}`}
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
                <b>{roleUpper(session?.role) || "STAFF"}</b>
              </div>
            </div>
          </div>
        </aside>

        {/* Desktop sidebar */}
        <aside className="rp-side">
          <div className="rp-side-card rp-card-anim" style={{ minHeight: "calc(100vh - 28px)", display: "flex", flexDirection: "column" }}>
            <div className="rp-brand">
              <div className="rp-brand-logo">
                <Image src="/images/logo/logo.png" alt="Ram Pottery Ltd" width={30} height={30} priority />
              </div>
              <div>
                <div className="rp-brand-title">RampotteryHUB</div>
                <div className="rp-brand-sub">Accounting & Stock System</div>
              </div>
            </div>

            <nav className="rp-nav" style={{ flex: 1 }}>
              {navItems.map((it) => (
                <Link key={it.href} className={`rp-nav-btn ${it.href === "/products" ? "rp-nav-btn--active" : ""}`} href={it.href} prefetch={false}>
                  <span className="rp-ic3d" aria-hidden="true">
                    ▶
                  </span>
                  {it.label}
                </Link>
              ))}
            </nav>

            <div className="rp-side-footer rp-side-footer--in" style={{ marginTop: "auto" }}>
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
              <div className="rp-exec__title">Stock & Categories</div>
              <div className="rp-exec__sub">Catalog • pricing • thumbnails • bulk import</div>
            </div>
            <div className="rp-exec__right">
              <span className={`rp-live ${loading ? "is-dim" : ""}`}>
                <span className="rp-live-dot" aria-hidden="true" />
                {loading ? "Syncing" : "Live"}
              </span>
              <span className={`rp-chip rp-chip--soft ${err ? "rp-chip--warn" : ""}`}>{err ? "Attention needed" : "All systems normal"}</span>
            </div>
          </section>

          {/* KPI row */}
          <section className="rp-kpi-pro rp-card-anim">
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Total</div>
              <div className="rp-kpi-pro__value">{kpis.total}</div>
              <div className="rp-kpi-pro__sub">Products</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Active</div>
              <div className="rp-kpi-pro__value">{kpis.active}</div>
              <div className="rp-kpi-pro__sub">Sellable</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Inactive</div>
              <div className="rp-kpi-pro__value">{kpis.inactive}</div>
              <div className="rp-kpi-pro__sub">Archived</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">View</div>
              <div className="rp-kpi-pro__value">{activeOnly ? "Active" : "All"}</div>
              <div className="rp-kpi-pro__sub">Filter</div>
            </div>
          </section>

          {/* Controls */}
          <section className="rp-actions rp-card-anim">
            <div className="rp-seg rp-seg--pro">
              <button className="rp-seg-item rp-seg-item--brand" type="button" onClick={() => void load()} disabled={loading}>
                <span className="rp-icbtn" aria-hidden="true">
                  ⟳
                </span>
                {loading ? "Loading…" : "Refresh"}
              </button>

              {/* Import price list */}
              <Link className="rp-seg-item rp-seg-item--brand" href="/products/import" prefetch={false}>
                <span className="rp-icbtn" aria-hidden="true">
                  ⬆
                </span>
                Import price list
              </Link>

              <label className="rp-seg-item rp-seg-item--brand" style={{ cursor: "pointer" }}>
                <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} style={{ marginRight: 10 }} />
                Active only
              </label>

              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <input className="rp-input" placeholder="Search code / sku / name…" value={q} onChange={(e) => setQ(e.target.value)} style={{ minWidth: 260 }} />
                <span className="rp-chip rp-chip--soft">
                  Showing <b style={{ marginLeft: 6 }}>{filtered.length}</b>
                </span>
              </div>
            </div>
          </section>

          {/* Register */}
          <section className="rp-card rp-card-anim">
            <div className="rp-card-head rp-card-head--tight">
              <div>
                <div className="rp-card-title">Products & Prices</div>
                <div className="rp-card-sub">Mobile scroll • pinned first column • pinned actions</div>
              </div>
              <span className={`rp-chip ${loading ? "is-dim" : ""}`}>{loading ? "Loading…" : "Ready"}</span>
            </div>

            <div className="rp-card-body">
              {err && (
                <div className="rp-note rp-note--warn" style={{ marginBottom: 12, whiteSpace: "pre-wrap" }}>
                  <b>Cannot load products:</b> {err}
                </div>
              )}

              {/* ✅ Pinned-table wrapper */}
              <div className="rp-table-wrap">
                <div className="rp-table-scroll">
                  <div className="rp-table-scroll__inner">
                    <table className="rp-table rp-table--premium">
                      <thead>
                        <tr>
                          <th style={{ width: 70 }}>SN</th>

                          {/* ✅ pinned first column */}
                          <th className="rp-pin" style={{ width: 190 }}>
                            Product Ref
                          </th>

                          <th style={{ width: 110 }}>Photo</th>
                          <th style={{ minWidth: 260 }}>Description</th>
                          <th className="rp-right rp-col-hide-sm" style={{ width: 130 }}>
                            Units/Box
                          </th>
                          <th className="rp-right rp-col-hide-sm" style={{ width: 160 }}>
                            Price/Pcs
                          </th>
                          <th style={{ width: 120 }}>Status</th>

                          {/* ✅ pinned right actions */}
                          <th className="rp-pin-right" style={{ width: 64 }} />
                        </tr>
                      </thead>

                      <tbody>
                        {!filtered.length ? (
                          <tr>
                            <td colSpan={8} className="rp-td-empty">
                              {loading ? "Loading products…" : "No products found."}
                            </td>
                          </tr>
                        ) : (
                          filtered.map((p, idx) => {
                            const img = p.image_url || null;
                            const code = (p.item_code || p.sku || "—").trim() || "—";
                            const displayName = p.name || "—";

                            return (
                              <tr key={p.id} className="rp-row-hover">
                                <td className="rp-strong" style={{ textAlign: "center" }}>
                                  {idx + 1}
                                </td>

                                {/* ✅ pinned first cell */}
                                <td className="rp-pin rp-strong" style={{ fontVariantNumeric: "tabular-nums" }}>
                                  {code}
                                </td>

                                <td>
                                  {img ? (
                                    <a className="rp-thumb" href={img} target="_blank" rel="noreferrer" title="Open image">
                                      <Image src={img} alt={displayName} fill className="rp-thumb-img" sizes="60px" />
                                    </a>
                                  ) : (
                                    <div className="rp-thumb rp-thumb--empty" title="No image">
                                      <span>—</span>
                                    </div>
                                  )}
                                </td>

                                <td>
                                  <div style={{ fontWeight: 950 }}>{displayName}</div>
                                  {p.description ? (
                                    <div className="rp-muted" style={{ marginTop: 6 }}>
                                      {p.description}
                                    </div>
                                  ) : null}

                                  {/* Mobile compact values */}
                                  <div className="rp-only-sm">
                                    <div className="rp-mini-row">
                                      <span>Units/Box</span>
                                      <b>{p.units_per_box == null ? "—" : String(p.units_per_box)}</b>
                                    </div>
                                    <div className="rp-mini-row">
                                      <span>Price</span>
                                      <b>{fmtRs(p.selling_price)}</b>
                                    </div>
                                  </div>
                                </td>

                                <td className="rp-right rp-col-hide-sm rp-strong">{p.units_per_box == null ? "—" : String(p.units_per_box)}</td>
                                <td className="rp-right rp-col-hide-sm rp-strong">{fmtRs(p.selling_price)}</td>

                                <td>
                                  {p.is_active ? (
                                    <span className="rp-pill rp-pill--in">ACTIVE</span>
                                  ) : (
                                    <span className="rp-pill rp-pill--out">INACTIVE</span>
                                  )}
                                </td>

                                {/* ✅ pinned right ⋮ */}
                                <td className="rp-pin-right" style={{ textAlign: "right" }}>
                                  <button
                                    type="button"
                                    className="rp-row-actions-btn"
                                    aria-label="Product actions"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenu(openMenu === p.id ? null : p.id);
                                    }}
                                  >
                                    ⋮
                                  </button>

                                  {openMenu === p.id && (
                                    <div className="rp-row-actions-menu" onClick={(e) => e.stopPropagation()}>
                                      <button onClick={() => openEdit(p)}>Edit</button>

                                      <button
                                        onClick={async () => {
                                          const ok = await copyToClipboard(code);
                                          showToast(ok ? "Copied ✅" : "Copy failed");
                                          setOpenMenu(null);
                                        }}
                                      >
                                        Copy code
                                      </button>

                                      <button
                                        disabled={!img}
                                        onClick={() => {
                                          setOpenMenu(null);
                                          if (img) window.open(img, "_blank", "noopener,noreferrer");
                                        }}
                                      >
                                        Open image
                                      </button>

                                      <div className="rp-row-actions-sep" />

                                      <button
                                        className="danger"
                                        onClick={() => {
                                          setOpenMenu(null);
                                          void archive(p);
                                        }}
                                      >
                                        Archive
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <p className="rp-help" style={{ marginTop: 10 }}>
                Tip: Use <b>Import price list</b> to update product prices in bulk (CSV/XLSX).
              </p>
            </div>
          </section>

          <footer className="rp-footer">© {new Date().getFullYear()} Ram Pottery Ltd • Built by Mobiz.mu</footer>
        </main>
      </div>

      {/* Edit modal */}
      {editOpen && editing && (
        <>
          <button
            className="rp-modal-overlay"
            onClick={() => {
              if (saving) return;
              setEditOpen(false);
              setEditing(null);
            }}
          />

          <div
            className="rp-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape" && !saving) {
                setEditOpen(false);
                setEditing(null);
              }
              if (e.key === "Enter" && !saving) void saveEdit();
            }}
          >
            <div className="rp-modal-head">
              <div>
                <div className="rp-modal-title">Edit Product</div>
                <div className="rp-modal-sub">Enter = Save • Esc = Cancel</div>
              </div>
              <button
                className="rp-icon-btn"
                type="button"
                onClick={() => {
                  if (saving) return;
                  setEditOpen(false);
                  setEditing(null);
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="rp-modal-body">
              <div className="rp-form-grid">
                <label className="rp-field">
                  <span className="rp-label">Name</span>
                  <input ref={nameRef} className="rp-input" value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </label>

                <label className="rp-field">
                  <span className="rp-label">Item Code</span>
                  <input className="rp-input" value={editing.item_code ?? ""} onChange={(e) => setEditing({ ...editing, item_code: e.target.value })} />
                </label>

                <label className="rp-field">
                  <span className="rp-label">SKU</span>
                  <input className="rp-input" value={editing.sku ?? ""} onChange={(e) => setEditing({ ...editing, sku: e.target.value })} />
                </label>

                <label className="rp-field">
                  <span className="rp-label">Units / Box</span>
                  <input className="rp-input" value={editing.units_per_box ?? ""} onChange={(e) => setEditing({ ...editing, units_per_box: e.target.value as any })} />
                </label>

                <label className="rp-field">
                  <span className="rp-label">Price / Pcs</span>
                  <input className="rp-input" value={editing.selling_price ?? ""} onChange={(e) => setEditing({ ...editing, selling_price: e.target.value as any })} />
                </label>

                <label className="rp-field" style={{ gridColumn: "1 / -1" }}>
                  <span className="rp-label">Description</span>
                  <textarea className="rp-input" rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                </label>

                <label className="rp-field" style={{ gridColumn: "1 / -1" }}>
                  <span className="rp-label">Image URL</span>
                  <input className="rp-input" value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
                </label>

                <label className="rp-field" style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="checkbox" checked={!!editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                  <span className="rp-label" style={{ margin: 0 }}>
                    Active (sellable)
                  </span>
                </label>
              </div>
            </div>

            <div className="rp-modal-actions">
              <button
                className="rp-ui-btn"
                type="button"
                onClick={() => {
                  if (saving) return;
                  setEditOpen(false);
                  setEditing(null);
                }}
                disabled={saving}
              >
                Cancel
              </button>

              <button className="rp-ui-btn rp-ui-btn--brand" type="button" onClick={() => void saveEdit()} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
