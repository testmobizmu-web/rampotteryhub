"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { rpFetch } from "@/lib/rpFetch";

type LowStockItem = {
  id?: number | string;
  item_code?: string | null;
  name?: string | null;
  qty?: number | null;
  stock_qty?: number | null;
  min_qty?: number | null;
  uom?: string | null;
};

type DashboardSummary = {
  totalSalesToday: number;
  totalSalesMonth: number;
  outstanding: number;
  lowStock: LowStockItem[];
  recentInvoices: Array<{
    id: number | string;
    invoice_number?: string | null;
    invoice_date?: string | null;
    total_amount?: number | null;
    status?: string | null;
    customers?: { name?: string | null } | null;
  }>;
};

type RpSession = {
  id?: string;
  username?: string;
  name?: string;
  role?: string;
};

function formatRs(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return `Rs ${v.toFixed(2)}`;
}

function fmtDateTime(d: Date) {
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function normalizeStatus(s?: string | null) {
  const v = (s || "").toLowerCase();
  if (v.includes("paid")) return "paid";
  if (v.includes("partial")) return "partial";
  if (v.includes("void") || v.includes("cancel")) return "void";
  if (v.includes("refund")) return "refund";
  return v || "issued";
}

function StatusBadge({ status }: { status?: string | null }) {
  const st = normalizeStatus(status);
  const cls =
    st === "paid"
      ? "rp-badge rp-badge--paid"
      : st === "partial"
      ? "rp-badge rp-badge--partial"
      : st === "void"
      ? "rp-badge rp-badge--void"
      : st === "refund"
      ? "rp-badge rp-badge--refund"
      : "rp-badge rp-badge--issued";

  const label =
    st === "paid"
      ? "Paid"
      : st === "partial"
      ? "Partial"
      : st === "void"
      ? "Void"
      : st === "refund"
      ? "Refund"
      : "Issued";

  return <span className={cls}>{label}</span>;
}

function rolePretty(role?: string) {
  const r = String(role || "STAFF").toUpperCase();
  if (r === "STAFF") return "STAFF";
  if (r === "ADMIN") return "ADMIN";
  if (r === "MANAGER") return "MANAGER";
  return r;
}

function isAdminRole(role?: string) {
  return String(role || "").toUpperCase() === "ADMIN";
}

function lowQty(item: LowStockItem) {
  const q = item.qty ?? item.stock_qty ?? 0;
  return Number.isFinite(Number(q)) ? Number(q) : 0;
}

export default function DashboardPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lastSync, setLastSync] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // ✅ SSR-safe session: start null, then read localStorage after mount
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<RpSession | null>(null);

  useEffect(() => {
    setMounted(true);

    // theme
    const saved = localStorage.getItem("rp_theme");
    const initial = saved === "dark" ? "dark" : "light";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;

    // session
    try {
      const raw = localStorage.getItem("rp_user");
      if (raw) setSession(JSON.parse(raw));
    } catch {
      setSession(null);
    }
  }, []);

  const roleLabel = useMemo(() => rolePretty(session?.role), [session]);
  const userLabel = useMemo(() => {
    const name = (session?.name || session?.username || "").trim();
    return name ? name : "User";
  }, [session]);

  // ✅ only compute admin after mounted so server/client trees match
  const canSeeAdminNav = mounted && isAdminRole(session?.role);

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

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const res = await rpFetch("/api/dashboard/summary", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
           let msg = "";
           try {
            const j = await res.json();
            msg = j?.error || j?.message || "";
           } catch {
            msg = await res.text().catch(() => "");
           }
            throw new Error(msg || `Dashboard load failed (${res.status})`);
           }

        const json = (await res.json()) as DashboardSummary;
        setData(json);
        setLastSync(fmtDateTime(new Date()));
      } catch (e: any) {
        if (controller.signal.aborted) return;
        setErr(e?.message || "Failed to load dashboard");
      } finally {
        if (controller.signal.aborted) return;
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const salesToday = data?.totalSalesToday ?? 0;
  const salesMonth = data?.totalSalesMonth ?? 0;
  const outstanding = data?.outstanding ?? 0;
  const lowStockItems = Array.isArray(data?.lowStock) ? data!.lowStock : [];
  const lowStockCount = lowStockItems.length;

  const recent = data?.recentInvoices ?? [];

  const lowStockTop = useMemo(() => {
    const copy = [...lowStockItems];
    copy.sort((a, b) => lowQty(a) - lowQty(b));
    return copy.slice(0, 6);
  }, [lowStockItems]);

  // ✅ Stable base nav (same on server and first client render)
  const baseNav = [
    { href: "/", label: "Dashboard" },
    { href: "/invoices", label: "Invoices" },
    { href: "/credit-notes", label: "Credit Notes" },
    { href: "/stock", label: "Stock & Categories" },
    { href: "/stock-movements", label: "Stock Movements" },
    { href: "/customers", label: "Customers" },
    { href: "/reports", label: "Reports & Statements" },
  ];

  // ✅ Admin nav appended ONLY after mount to avoid hydration mismatch
  const navItems = useMemo(() => {
    const list = [...baseNav];
    if (canSeeAdminNav) list.push({ href: "/admin/users", label: "Users & Permissions" });
    return list;
  }, [canSeeAdminNav]);

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
            <div className="rp-mtop-sub">Accounting & Stock</div>
          </div>

          <button type="button" className="rp-icon-btn" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
            {theme === "dark" ? "☀" : "🌙"}
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
                <div className="rp-drawer-sub">Accounting & Stock System</div>
              </div>
            </div>

            <button type="button" className="rp-icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Close">
              ✕
            </button>
          </div>

          <div className="rp-drawer-body">
            <nav className="rp-nav">
              {navItems.map((n) => (
                <Link
                  key={n.href}
                  className={`rp-nav-btn ${n.href === "/" ? "rp-nav-btn--active" : ""}`}
                  href={n.href}
                  onClick={() => setDrawerOpen(false)}
                >
                  <span className="rp-ic3d" aria-hidden="true">▶</span>
                  {n.label}
                </Link>
              ))}
            </nav>

            <div className="rp-side-footer rp-side-footer--in">
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
              {navItems.map((n) => (
                <Link key={n.href} className={`rp-nav-btn ${n.href === "/" ? "rp-nav-btn--active" : ""}`} href={n.href}>
                  <span className="rp-ic3d" aria-hidden="true">▶</span>
                  {n.label}
                </Link>
              ))}
            </nav>

            <div className="rp-side-footer rp-side-footer--in">
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
        </aside>

        {/* Main */}
        <main className="rp-main">
          <header className="rp-top rp-top--saas rp-card-anim" style={{ animationDelay: "60ms" }}>
            <div className="rp-top-left--actions">
              <button type="button" className="rp-ui-btn rp-ui-btn--brand" onClick={toggleTheme} title="Toggle theme">
                <span className="rp-ui-btn__dot" aria-hidden="true" />
                {theme === "dark" ? "☀ Light" : "🌙 Dark"}
              </button>

              <button type="button" className="rp-ui-btn rp-ui-btn--danger" onClick={handleLogout} title="Logout">
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

          <section className="rp-exec rp-card-anim">
            <div className="rp-exec__left">
              <div className="rp-exec__title">Executive Overview</div>
              <div className="rp-exec__sub">Fast overview + operational alerts</div>
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

          <section className="rp-actions rp-card-anim">
            <div className="rp-seg rp-seg--pro">
              <Link className="rp-seg-item rp-seg-item--brand" href="/invoices/new">
                <span className="rp-icbtn" aria-hidden="true">🧾</span>
                New Invoice
              </Link>
              <Link className="rp-seg-item rp-seg-item--brand" href="/invoices">
                <span className="rp-icbtn" aria-hidden="true">🖨️</span>
                Reprint Invoices
              </Link>
              <Link className="rp-seg-item rp-seg-item--brand" href="/credit-notes">
                <span className="rp-icbtn" aria-hidden="true">🧾</span>
                Credit Notes
              </Link>
              <Link className="rp-seg-item rp-seg-item--brand" href="/stock">
                <span className="rp-icbtn" aria-hidden="true">📦</span>
                Import Stock
              </Link>
            </div>
          </section>

          <section className="rp-kpi-pro rp-card-anim">
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Sales Today</div>
              <div className="rp-kpi-pro__value">{formatRs(salesToday)}</div>
              <div className="rp-kpi-pro__sub">Invoices dated today</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Sales This Month</div>
              <div className="rp-kpi-pro__value">{formatRs(salesMonth)}</div>
              <div className="rp-kpi-pro__sub">Month to date</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Outstanding</div>
              <div className="rp-kpi-pro__value">{formatRs(outstanding)}</div>
              <div className="rp-kpi-pro__sub">Total balance due</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Low Stock</div>
              <div className="rp-kpi-pro__value">{lowStockCount}</div>
              <div className="rp-kpi-pro__sub">Reorder suggested</div>
            </div>
          </section>

          <section className="rp-grid2 rp-card-anim">
            <div className="rp-card rp-glass">
              <div className="rp-card-head">
                <div>
                  <div className="rp-card-title">Low Stock Alerts</div>
                  <div className="rp-card-sub">Top items needing reorder</div>
                </div>
                <Link className="rp-link-btn" href="/stock">Open stock →</Link>
              </div>

              <div className="rp-card-body">
                {loading ? (
                  <div className="rp-empty">
                    <b>Loading…</b>
                    <span>Checking inventory levels.</span>
                  </div>
                ) : err ? (
                  <div className="rp-empty">
                    <b>Could not load stock alerts</b>
                    <span>{err}</span>
                  </div>
                ) : lowStockTop.length === 0 ? (
                  <div className="rp-empty">
                    <b>All good</b>
                    <span>No low-stock items detected.</span>
                  </div>
                ) : (
                  <div className="rp-alerts">
                    {lowStockTop.map((p, idx) => {
                      const code = (p.item_code || "").trim() || `ITEM-${idx + 1}`;
                      const name = (p.name || "").trim() || "Unnamed product";
                      const qty = lowQty(p);
                      const min = Number(p.min_qty ?? 0) || 0;

                      return (
                        <div className="rp-alert-row" key={`${code}-${idx}`}>
                          <div className="rp-alert-left">
                            <div className="rp-alert-code">{code}</div>
                            <div className="rp-alert-name" title={name}>{name}</div>
                          </div>

                          <div className="rp-alert-right">
                            <span className={`rp-pill2 ${qty <= 0 ? "rp-pill2--danger" : "rp-pill2--warn"}`}>
                              {qty} in stock
                            </span>
                            <span className="rp-pill2 rp-pill2--soft">Min {min}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="rp-card rp-glass">
              <div className="rp-card-head">
                <div>
                  <div className="rp-card-title">System Status</div>
                  <div className="rp-card-sub">Operational overview</div>
                </div>
                <span className="rp-pill">Secure</span>
              </div>

              <div className="rp-card-body">
                <div className="rp-status">
                  <div className="rp-status-row">
                    <span className="rp-status-k">Data sync</span>
                    <span className={`rp-status-v ${loading ? "is-dim" : ""}`}>{loading ? "Syncing…" : "OK"}</span>
                  </div>
                  <div className="rp-status-row">
                    <span className="rp-status-k">Invoices</span>
                    <span className="rp-status-v">Ready</span>
                  </div>
                  <div className="rp-status-row">
                    <span className="rp-status-k">Stock</span>
                    <span className="rp-status-v">{lowStockCount > 0 ? "Attention" : "OK"}</span>
                  </div>
                  <div className="rp-status-row">
                    <span className="rp-status-k">Role</span>
                    <span className="rp-status-v">{mounted ? roleLabel : "—"}</span>
                  </div>
                </div>

                <div className="rp-status-note">
                  Premium lightweight dashboard — no heavy charts, only essential control.
                </div>
              </div>
            </div>
          </section>

          <section className="rp-card rp-card-anim">
            <div className="rp-card-head rp-card-head--tight">
              <div>
                <div className="rp-card-title">Recent Invoices</div>
                <div className="rp-card-sub">Latest 10</div>
              </div>
              <Link className="rp-link-btn" href="/invoices">View all →</Link>
            </div>

            <div className="rp-card-body">
              {loading ? (
                <div className="rp-empty">
                  <b>Loading recent invoices…</b>
                  <span>Please wait.</span>
                </div>
              ) : err ? (
                <div className="rp-empty">
                  <b>Could not load invoices</b>
                  <span>{err}</span>
                </div>
              ) : (
                <div className="rp-table-wrap">
                  <table className="rp-table">
                    <thead>
                      <tr>
                        <th>Invoice</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.length === 0 ? (
                        <tr>
                          <td className="rp-td-empty" colSpan={5}>No invoices yet.</td>
                        </tr>
                      ) : (
                        recent.map((inv) => (
                          <tr key={String(inv.id)}>
                            <td className="rp-strong">
                              <Link className="rp-row-link" href={`/invoices/${inv.id}`}>
                                {inv.invoice_number || `#${inv.id}`}
                              </Link>
                            </td>
                            <td>{inv.invoice_date || "—"}</td>
                            <td>{inv.customers?.name || "—"}</td>
                            <td className="rp-strong">{formatRs(Number(inv.total_amount || 0))}</td>
                            <td><StatusBadge status={inv.status} /></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <footer className="rp-footer">
            © 2026 Ram Pottery Ltd - <span>Built by Mobiz.mu</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

