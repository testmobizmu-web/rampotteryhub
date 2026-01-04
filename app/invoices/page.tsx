"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { rpFetch } from "@/lib/rpFetch";

type RpSession = {
  id?: string;
  username?: string;
  name?: string;
  role?: string;
};

function roleUpper(r?: string) {
  return String(r || "").toUpperCase();
}
function isAdmin(r?: string) {
  return roleUpper(r) === "ADMIN";
}
function isManager(r?: string) {
  return roleUpper(r) === "MANAGER";
}
function canDuplicate(r?: string) {
  return isAdmin(r) || isManager(r);
}

const n = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const rs = (v: number) => `Rs ${n(v).toFixed(2)}`;

function fmtDate(d?: string | null) {
  if (!d) return "—";
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return d;
  const pad = (k: number) => String(k).padStart(2, "0");
  return `${pad(x.getDate())}/${pad(x.getMonth() + 1)}/${x.getFullYear()}`;
}

function fmtDateTime(d: Date) {
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function normalizeStatus(s?: string | null) {
  const v = String(s || "").toUpperCase();
  if (v === "PAID") return "Paid";
  if (v === "PARTIALLY_PAID" || v === "PARTIAL") return "Partially Paid";
  if (v === "VOID") return "Void";
  if (v === "UNPAID") return "Issued";
  return "Issued";
}

function statusBadgeClass(s?: string | null) {
  const st = normalizeStatus(s);
  return (
    "rp-badge " +
    (st === "Paid"
      ? "rp-badge--paid"
      : st === "Partially Paid"
      ? "rp-badge--partial"
      : st === "Void"
      ? "rp-badge--void"
      : "rp-badge--issued")
  );
}

export default function InvoicesPage() {
  const router = useRouter();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lastSync, setLastSync] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<RpSession | null>(null);

  const [rows, setRows] = useState<any[]>([]);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All" | "Issued" | "Paid" | "Partially Paid" | "Void">("All");

  const [openMenu, setOpenMenu] = useState<number | string | null>(null);

  // Payment modal
  const [payOpen, setPayOpen] = useState(false);
  const [payInvoice, setPayInvoice] = useState<any | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [paySaving, setPaySaving] = useState(false);

  const payInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);

    const saved = localStorage.getItem("rp_theme");
    const initial = saved === "dark" ? "dark" : "light";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;

    try {
      const raw = localStorage.getItem("rp_user");
      if (raw) setSession(JSON.parse(raw));
    } catch {
      setSession(null);
    }
  }, []);

  // lock scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // close menu on outside click
  useEffect(() => {
    const close = () => setOpenMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // global ESC behavior
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setDrawerOpen(false);
        if (payOpen && !paySaving) setPayOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [payOpen, paySaving]);

  const canSeeAdminNav = mounted && isAdmin(session?.role);

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

  const userLabel = useMemo(() => {
    const name = (session?.name || session?.username || "").trim();
    return name ? name : "User";
  }, [session]);

  const roleLabel = useMemo(() => roleUpper(session?.role) || "STAFF", [session]);

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

  async function load() {
    try {
      setLoading(true);
      setErr(null);

      const res = await rpFetch("/api/invoices", { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok === false) throw new Error(json?.error || "Failed to load invoices");

      setRows(json.invoices || []);
      setLastSync(fmtDateTime(new Date()));
    } catch (e: any) {
      setErr(e?.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function markAsPaid(id: number | string) {
    if (!confirm("Mark this invoice as PAID?")) return;
    const res = await rpFetch(`/api/invoices/${id}/mark-paid`, { method: "PATCH" });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || j?.ok === false) return alert(j?.error || "Failed to mark as paid");
    await load();
  }

  async function voidInvoice(id: number | string) {
    if (!confirm("Void this invoice? This cannot be undone.")) return;
    const res = await rpFetch(`/api/invoices/${id}/void`, { method: "POST" });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || j?.ok === false) return alert(j?.error || "Failed to void invoice");
    await load();
  }

  function duplicateInvoicePrefill(id: number | string) {
    router.push(`/invoices/new?duplicate=${encodeURIComponent(String(id))}`);
  }

  function openPaymentModal(inv: any) {
    setPayInvoice(inv);
    setPayAmount(n(inv.amount_paid));
    setPayOpen(true);
    setOpenMenu(null);
    setTimeout(() => payInputRef.current?.focus(), 30);
  }

  async function savePayment() {
    if (!payInvoice?.id) return;
    setPaySaving(true);
    try {
      const res = await rpFetch(`/api/invoices/${payInvoice.id}/set-payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountPaid: n(payAmount) }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j?.ok === false) throw new Error(j?.error || "Failed to set payment");

      setPayOpen(false);
      setPayInvoice(null);
      await load();
    } catch (e: any) {
      alert(e?.message || "Failed to set payment");
    } finally {
      setPaySaving(false);
    }
  }

  function applySearch() {
    setSearch(searchDraft.trim());
  }

  function clearSearch() {
    setSearchDraft("");
    setSearch("");
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const st = normalizeStatus(r.status);
      if (status !== "All" && st !== status) return false;
      if (!q) return true;
      const invNo = String(r.invoice_number || "").toLowerCase();
      const cust = String(r.customers?.name || "").toLowerCase();
      const code = String(r.customers?.customer_code || "").toLowerCase();
      return invNo.includes(q) || cust.includes(q) || code.includes(q);
    });
  }, [rows, search, status]);

  const kpis = useMemo(() => {
    const total = filtered.reduce((s, r) => s + n(r.total_amount), 0);
    const paid = filtered.reduce((s, r) => s + n(r.amount_paid), 0);
    const balance = filtered.reduce((s, r) => s + n(r.balance_remaining), 0);
    return { count: filtered.length, total, paid, balance };
  }, [filtered]);

  const SideCard = (
    <div
      className="rp-side-card rp-card-anim"
      style={{
        minHeight: "calc(100vh - 28px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
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
          <Link
            key={it.href}
            className={`rp-nav-btn ${it.href === "/invoices" ? "rp-nav-btn--active" : ""}`}
            href={it.href}
            onClick={() => setDrawerOpen(false)}
          >
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
          <b title={userLabel}>{mounted ? userLabel : "—"}</b>
        </div>
        <div className="rp-role" style={{ marginTop: 10 }}>
          <span>Role</span>
          <b>{mounted ? roleLabel : "—"}</b>
        </div>
      </div>
    </div>
  );

  return (
    <div className="rp-app">
      <div className="rp-bg" aria-hidden="true">
        <div className="rp-bg-orb rp-bg-orb--1" />
        <div className="rp-bg-orb rp-bg-orb--2" />
        <div className="rp-bg-orb rp-bg-orb--3" />
        <div className="rp-bg-grid" />
      </div>

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
            <div className="rp-mtop-sub">Invoices</div>
          </div>

          <button type="button" className="rp-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "☀" : "🌙"}
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
                <div className="rp-drawer-sub">Accounting & Stock System</div>
              </div>
            </div>

            <button type="button" className="rp-icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Close">
              ✕
            </button>
          </div>

          <div className="rp-drawer-body">{SideCard}</div>
        </aside>

        {/* Desktop sidebar */}
        <aside className="rp-side">{SideCard}</aside>

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
              <div className="rp-exec__title">Invoices</div>
              <div className="rp-exec__sub">Reprint • Duplicate • Payments • Mark Paid • Void (Admin)</div>
            </div>
            <div className="rp-exec__right">
              <span className={`rp-live ${loading ? "is-dim" : ""}`}>
                <span className="rp-live-dot" aria-hidden="true" />
                {loading ? "Syncing" : "Live"}
              </span>
              <span className={`rp-chip rp-chip--soft ${err ? "rp-chip--warn" : ""}`}>
                {err ? "Attention needed" : "All systems normal"}
              </span>
            </div>
          </section>

          {/* KPI row */}
          <section className="rp-kpi-pro rp-card-anim">
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Invoices</div>
              <div className="rp-kpi-pro__value">{kpis.count}</div>
              <div className="rp-kpi-pro__sub">Filtered results</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Total</div>
              <div className="rp-kpi-pro__value">{rs(kpis.total)}</div>
              <div className="rp-kpi-pro__sub">Total invoice value</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Paid</div>
              <div className="rp-kpi-pro__value">{rs(kpis.paid)}</div>
              <div className="rp-kpi-pro__sub">Collected</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Outstanding</div>
              <div className="rp-kpi-pro__value">{rs(kpis.balance)}</div>
              <div className="rp-kpi-pro__sub">Balance due</div>
            </div>
          </section>

          {/* Quick actions */}
          <section className="rp-actions rp-card-anim">
            <div className="rp-seg rp-seg--pro">
              <Link className="rp-seg-item rp-seg-item--brand" href="/invoices/new">
                <span className="rp-icbtn" aria-hidden="true">
                  🧾
                </span>
                New Invoice
              </Link>

              <button type="button" className="rp-seg-item rp-seg-item--brand" onClick={load} disabled={loading}>
                <span className="rp-icbtn" aria-hidden="true">
                  ⟳
                </span>
                {loading ? "Loading…" : "Refresh"}
              </button>
            </div>
          </section>

          {/* Search + filters */}
          <section className="rp-card rp-card-anim">
            <div className="rp-card-head rp-card-head--tight">
              <div>
                <div className="rp-card-title">Search & Filters</div>
                <div className="rp-card-sub">Invoice no • customer • code • status</div>
              </div>
            </div>

            <div className="rp-card-body">
              <div className="rp-filters-row">
                <input
                  className="rp-input rp-input--full"
                  placeholder="Search invoice or customer…"
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applySearch();
                    if (e.key === "Escape") clearSearch();
                  }}
                />

                <button type="button" className="rp-ui-btn rp-ui-btn--brand" onClick={applySearch}>
                  <span className="rp-ui-btn__dot" aria-hidden="true" />
                  Search
                </button>

                <button type="button" className="rp-ui-btn" onClick={clearSearch}>
                  <span className="rp-ui-btn__dot" aria-hidden="true" />
                  Clear
                </button>
              </div>

              <div className="rp-chip-row">
                {(["All", "Issued", "Paid", "Partially Paid", "Void"] as const).map((s) => (
                  <button
                    key={s}
                    className={`rp-filter-pill ${status === s ? "rp-filter-pill--active" : ""}`}
                    onClick={() => setStatus(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {err ? <div className="rp-note rp-note--warn">{err}</div> : null}
            </div>
          </section>

          {/* ===== SINGLE TABLE (desktop + mobile) ===== */}
          <section className="rp-card rp-card-anim">
            <div className="rp-card-head rp-card-head--tight">
              <div>
                <div className="rp-card-title">Invoice Register</div>
                <div className="rp-card-sub">Clean view • scroll on mobile • pinned first column</div>
              </div>
              <span className={`rp-chip ${loading ? "is-dim" : ""}`}>{loading ? "Loading…" : "Ready"}</span>
            </div>

            <div className="rp-card-body">
              {/* ✅ Premium wrapper + mobile scroll */}
              <div className="rp-table-wrap">
                <div className="rp-table-scroll">
                  <div className="rp-table-scroll__inner">
                    <table className="rp-table rp-table--premium">
                      <thead>
                        <tr>
                          {/* ✅ pinned first column */}
                          <th className="rp-pin" style={{ width: 140 }}>
                            Invoice
                          </th>
                          <th style={{ width: 120 }}>Date</th>
                          <th style={{ minWidth: 220 }}>Customer</th>
                          <th className="rp-right rp-col-hide-sm" style={{ width: 140 }}>
                            Total
                          </th>
                          <th className="rp-right rp-col-hide-sm" style={{ width: 140 }}>
                            Paid
                          </th>
                          <th className="rp-right rp-col-hide-sm" style={{ width: 150 }}>
                            Balance
                          </th>
                          <th style={{ width: 120 }}>Status</th>

                          {/* ✅ optional pinned right actions */}
                          <th className="rp-pin-right" style={{ width: 64 }} />
                        </tr>
                      </thead>

                      <tbody>
                        {filtered.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="rp-td-empty">
                              {loading ? "Loading invoices…" : "No invoices found."}
                            </td>
                          </tr>
                        ) : (
                          filtered.map((r) => {
                            const st = normalizeStatus(r.status);
                            const allowDuplicate = canDuplicate(session?.role);
                            const allowVoid = isAdmin(session?.role) && st !== "Void";

                            return (
                              <tr key={String(r.id)} className="rp-row-hover">
                                {/* ✅ pinned first column cell */}
                                <td className="rp-pin rp-strong">
                                  <button
                                    type="button"
                                    className="rp-row-link"
                                    onClick={() => router.push(`/invoices/${r.id}`)}
                                  >
                                    {r.invoice_number || `#${r.id}`}
                                  </button>
                                </td>

                                <td>{fmtDate(r.invoice_date)}</td>

                                <td>
                                  <div className="rp-strong">{r.customers?.name || "—"}</div>
                                  <div className="rp-muted">{r.customers?.customer_code || ""}</div>

                                  {/* Mobile compact amounts (shown only on small screens) */}
                                  <div className="rp-only-sm">
                                    <div className="rp-mini-row">
                                      <span>Total</span>
                                      <b>{rs(n(r.total_amount))}</b>
                                    </div>
                                    <div className="rp-mini-row">
                                      <span>Paid</span>
                                      <b>{rs(n(r.amount_paid))}</b>
                                    </div>
                                    <div className="rp-mini-row">
                                      <span>Balance</span>
                                      <b>{rs(n(r.balance_remaining))}</b>
                                    </div>
                                  </div>
                                </td>

                                <td className="rp-right rp-col-hide-sm">{rs(n(r.total_amount))}</td>
                                <td className="rp-right rp-col-hide-sm">{rs(n(r.amount_paid))}</td>
                                <td className="rp-right rp-col-hide-sm">{rs(n(r.balance_remaining))}</td>

                                <td>
                                  <span className={statusBadgeClass(r.status)}>{st}</span>
                                </td>

                                {/* ⋮ menu (same as current invoices) — pinned right */}
                                <td className="rp-actions-cell rp-pin-right">
                                  <button
                                    type="button"
                                    className="rp-row-actions-btn"
                                    aria-label="Invoice actions"
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
                                        onClick={() => {
                                          setOpenMenu(null);
                                          router.push(`/invoices/${r.id}`);
                                        }}
                                      >
                                        Reprint
                                      </button>

                                      {allowDuplicate && (
                                        <button onClick={() => duplicateInvoicePrefill(r.id)}>Duplicate</button>
                                      )}

                                      {st !== "Void" && (
                                        <>
                                          <div className="rp-row-actions-sep" />
                                          <button onClick={() => openPaymentModal(r)}>Set Payment…</button>
                                          {st !== "Paid" && <button onClick={() => markAsPaid(r.id)}>Mark as Paid</button>}
                                          {allowVoid && (
                                            <button className="danger" onClick={() => voidInvoice(r.id)}>
                                              Void Invoice
                                            </button>
                                          )}
                                        </>
                                      )}
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
              {/* /table-wrap */}
            </div>
          </section>

          <footer className="rp-footer">© {new Date().getFullYear()} Ram Pottery Ltd • Built by Mobiz.mu</footer>
        </main>
      </div>

      {/* ===== Payment Modal ===== */}
      {payOpen && (
        <>
          <button className="rp-modal-overlay" onClick={() => (!paySaving ? setPayOpen(false) : null)} />
          <div
            className="rp-modal"
            onKeyDown={(e) => {
              if (e.key === "Escape" && !paySaving) setPayOpen(false);
              if (e.key === "Enter" && !paySaving) savePayment();
            }}
          >
            <div className="rp-modal-head">
              <div>
                <div className="rp-modal-title">Set Payment</div>
                <div className="rp-modal-sub">
                  {payInvoice?.invoice_number || ""} • {payInvoice?.customers?.name || ""}
                </div>
              </div>
              <button className="rp-icon-btn" onClick={() => (!paySaving ? setPayOpen(false) : null)}>
                ✕
              </button>
            </div>

            <div className="rp-modal-body">
              <div className="rp-field">
                <label className="rp-label">Amount Paid</label>
                <input
                  ref={payInputRef}
                  className="rp-input rp-input--full rp-input--right"
                  value={payAmount}
                  onChange={(e) => setPayAmount(n(e.target.value))}
                />
                <div className="rp-help">
                  Total: <b>{rs(n(payInvoice?.gross_total ?? payInvoice?.total_amount))}</b> • Current paid:{" "}
                  <b>{rs(n(payInvoice?.amount_paid))}</b>
                </div>
              </div>

              <div className="rp-modal-actions">
                <button className="rp-ui-btn" onClick={() => setPayOpen(false)} disabled={paySaving}>
                  Cancel
                </button>
                <button className="rp-ui-btn rp-ui-btn--brand" onClick={savePayment} disabled={paySaving}>
                  {paySaving ? "Saving…" : "Save Payment"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
