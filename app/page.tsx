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

type SalesMonthPoint = { ym: string; label: string; total: number };

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

function monthLabel(d: Date) {
  // Short, executive, consistent (Jan, Feb, …)
  const m = d.toLocaleString("en-GB", { month: "short" });
  return m;
}
function ymKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
function lastNMonths(n: number) {
  const out: { d: Date; ym: string; label: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ d, ym: ymKey(d), label: `${monthLabel(d)} ${String(d.getFullYear()).slice(-2)}` });
  }
  return out;
}

export default function DashboardPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lastSync, setLastSync] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // chart
  const [sales6m, setSales6m] = useState<SalesMonthPoint[] | null>(null);
  const [sales6mLoading, setSales6mLoading] = useState(false);

  // ✅ SSR-safe session
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

  // lock background scroll when drawer open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // close drawer on ESC
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  const roleLabel = useMemo(() => rolePretty(session?.role), [session]);
  const userLabel = useMemo(() => {
    const name = (session?.name || session?.username || "").trim();
    return name ? name : "User";
  }, [session]);

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

  async function loadDashboard() {
    const controller = new AbortController();

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
      setErr(e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }

  async function loadSalesChart() {
    // Best-effort:
    // 1) Try API: /api/reports/sales-6m (or you can implement server route later)
    // 2) If not found / fails, fallback to placeholder bars using month total in current month.
    setSales6mLoading(true);

    const months = lastNMonths(6);
    const fallback: SalesMonthPoint[] = months.map((m, idx) => ({
      ym: m.ym,
      label: m.label,
      total: idx === months.length - 1 ? Number(data?.totalSalesMonth || 0) : 0,
    }));

    try {
      const res = await rpFetch("/api/reports/sales-6m", { cache: "no-store" });
      if (!res.ok) throw new Error("sales-6m not available");
      const j = await res.json();
      // Expect: { ok:true, series:[{ym:"2026-01", total:1234.56}, ...] }
      const series = Array.isArray(j?.series) ? j.series : [];
      const map = new Map<string, number>();
      for (const p of series) {
        if (p?.ym) map.set(String(p.ym), Number(p.total || 0));
      }
      const merged: SalesMonthPoint[] = months.map((m) => ({
        ym: m.ym,
        label: m.label,
        total: Number(map.get(m.ym) || 0),
      }));
      setSales6m(merged);
    } catch {
      setSales6m(fallback);
    } finally {
      setSales6mLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load chart after dashboard loads (so fallback has current month total)
  useEffect(() => {
    if (!mounted) return;
    void loadSalesChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, data?.totalSalesMonth]);

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

  // ✅ Base nav (stable server/client)
  const baseNav = [
    { href: "/", label: "Dashboard" },
    { href: "/invoices", label: "Invoices" },
    { href: "/credit-notes", label: "Credit Notes" },

    // ✅ updated route
    { href: "/products", label: "Stock & Categories" },

    { href: "/stock-movements", label: "Stock Movements" },
    { href: "/customers", label: "Customers" },

    // ✅ new
    { href: "/suppliers", label: "Suppliers" },

    { href: "/reports", label: "Reports & Statements" },
  ];

  const navItems = useMemo(() => {
    const list = [...baseNav];
    if (canSeeAdminNav) list.push({ href: "/admin/users", label: "Users & Permissions" });
    return list;
  }, [canSeeAdminNav]);

  // chart derived UI
  const chart = sales6m || lastNMonths(6).map((m) => ({ ym: m.ym, label: m.label, total: 0 }));
  const chartMax = Math.max(1, ...chart.map((p) => Number(p.total || 0)));

  const SideContent = (
    <div
      className="rp-side-card rp-card-anim"
      style={{
        // ✅ make sidebar background longer and footer stick to bottom
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
        {navItems.map((n) => (
          <Link
            key={n.href}
            className={`rp-nav-btn ${n.href === "/" ? "rp-nav-btn--active" : ""}`}
            href={n.href}
            onClick={() => setDrawerOpen(false)}
            prefetch={false}
          >
            <span className="rp-ic3d" aria-hidden="true">
              ▶
            </span>
            {n.label}
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
            <div className="rp-mtop-sub">Executive Dashboard</div>
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

          <div className="rp-drawer-body">{SideContent}</div>
        </aside>

        {/* Desktop sidebar */}
        <aside className="rp-side">{SideContent}</aside>

        {/* Main */}
        <main className="rp-main">
          {/* Top bar */}
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

          {/* Executive header */}
          <section className="rp-exec rp-card-anim">
            <div className="rp-exec__left">
              <div className="rp-exec__title">Executive Overview</div>
              <div className="rp-exec__sub">Sales performance + operational alerts + quick actions</div>
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

          {/* Actions */}
          <section className="rp-actions rp-card-anim">
            <div className="rp-seg rp-seg--pro">
              <Link className="rp-seg-item rp-seg-item--brand" href="/invoices/new">
                <span className="rp-icbtn" aria-hidden="true">
                  🧾
                </span>
                New Invoice
              </Link>

              <Link className="rp-seg-item rp-seg-item--brand" href="/invoices">
                <span className="rp-icbtn" aria-hidden="true">
                  🖨️
                </span>
                Reprint Invoices
              </Link>

              <Link className="rp-seg-item rp-seg-item--brand" href="/credit-notes">
                <span className="rp-icbtn" aria-hidden="true">
                  🧾
                </span>
                Credit Notes
              </Link>

              <Link className="rp-seg-item rp-seg-item--brand" href="/products/import">
                <span className="rp-icbtn" aria-hidden="true">
                  📦
                </span>
                Import Stock
              </Link>

              <Link className="rp-seg-item rp-seg-item--brand" href="/suppliers">
                <span className="rp-icbtn" aria-hidden="true">
                  🤝
                </span>
                Suppliers
              </Link>

              <button
                type="button"
                className="rp-seg-item"
                onClick={() => {
                  void loadDashboard();
                  void loadSalesChart();
                }}
              >
                <span className="rp-icbtn" aria-hidden="true">
                  ⟳
                </span>
                Refresh
              </button>
            </div>
          </section>

          {/* KPIs */}
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

          {/* Sales chart + Alerts + Status */}
          <section className="rp-grid2 rp-card-anim">
            {/* LEFT STACK */}
            <div className="rp-stack">
              {/* Sales Chart (above stock alerts) */}
              <div className="rp-card rp-glass">
                <div className="rp-card-head">
                  <div>
                    <div className="rp-card-title">Sales Trend</div>
                    <div className="rp-card-sub">Last 6 months (auto)</div>
                  </div>
                  <span className="rp-pill">
                    {sales6mLoading ? "Updating…" : "Executive view"}
                  </span>
                </div>

                <div className="rp-card-body">
                  <div className="rp-chart">
                    {chart.map((p) => {
                      const v = Number(p.total || 0);
                      const pct = Math.max(3, Math.round((v / chartMax) * 100)); // keep tiny bars visible
                      return (
                        <div key={p.ym} className="rp-chart-col">
                          <div className="rp-chart-top">
                            <span className="rp-chart-val">{formatRs(v)}</span>
                          </div>
                          <div className="rp-chart-barwrap">
                            <div className="rp-chart-bar" style={{ height: `${pct}%` }} />
                          </div>
                          <div className="rp-chart-label">{p.label}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rp-chart-foot">
                    <span className="rp-soft-pill">Max: {formatRs(chartMax)}</span>
                    <span className="rp-soft-pill">This month: {formatRs(salesMonth)}</span>
                    <span className="rp-soft-pill">Today: {formatRs(salesToday)}</span>
                  </div>
                </div>
              </div>

              {/* Low Stock Alerts */}
              <div className="rp-card rp-glass" style={{ marginTop: 14 }}>
                <div className="rp-card-head">
                  <div>
                    <div className="rp-card-title">Low Stock Alerts</div>
                    <div className="rp-card-sub">Top items needing reorder</div>
                  </div>
                  <Link className="rp-link-btn" href="/products">
                    Open stock →
                  </Link>
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
                              <div className="rp-alert-name" title={name}>
                                {name}
                              </div>
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
            </div>

            {/* RIGHT: System Status */}
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
                    <span className="rp-status-k">Suppliers</span>
                    <span className="rp-status-v">Ready</span>
                  </div>
                  <div className="rp-status-row">
                    <span className="rp-status-k">Role</span>
                    <span className="rp-status-v">{mounted ? roleLabel : "—"}</span>
                  </div>
                </div>

                <div className="rp-status-note">
                  Premium executive dashboard — lightweight, fast, and focused on action.
                </div>

                <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                  <Link className="rp-link-btn" href="/products">
                    Stock & Categories →
                  </Link>
                  <Link className="rp-link-btn" href="/suppliers">
                    Suppliers →
                  </Link>
                  <Link className="rp-link-btn" href="/reports">
                    Reports & Statements →
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Recent invoices */}
          <section className="rp-card rp-card-anim">
            <div className="rp-card-head rp-card-head--tight">
              <div>
                <div className="rp-card-title">Recent Invoices</div>
                <div className="rp-card-sub">Latest 10</div>
              </div>
              <Link className="rp-link-btn" href="/invoices">
                View all →
              </Link>
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
                          <td className="rp-td-empty" colSpan={5}>
                            No invoices yet.
                          </td>
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
                            <td>
                              <StatusBadge status={inv.status} />
                            </td>
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

          {/* Premium chart styles (local only) */}
          <style jsx>{`
            .rp-stack {
              display: flex;
              flex-direction: column;
            }

            .rp-chart {
              display: grid;
              grid-template-columns: repeat(6, minmax(0, 1fr));
              gap: 10px;
              align-items: end;
              padding: 8px 2px 0;
            }

            .rp-chart-col {
              display: grid;
              gap: 8px;
              align-items: end;
              min-height: 220px;
            }

            .rp-chart-top {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 20px;
            }

            .rp-chart-val {
              font-weight: 950;
              font-size: 12px;
              color: rgba(0, 0, 0, 0.62);
            }

            :global([data-theme="dark"]) .rp-chart-val {
              color: rgba(255, 255, 255, 0.72);
            }

            .rp-chart-barwrap {
              height: 170px;
              border-radius: 16px;
              border: 1px solid rgba(0, 0, 0, 0.08);
              background: rgba(255, 255, 255, 0.55);
              overflow: hidden;
              position: relative;
              display: flex;
              align-items: flex-end;
              box-shadow: 0 18px 50px rgba(0, 0, 0, 0.08);
            }

            :global([data-theme="dark"]) .rp-chart-barwrap {
              background: rgba(255, 255, 255, 0.06);
              border-color: rgba(255, 255, 255, 0.12);
            }

            .rp-chart-bar {
              width: 100%;
              border-radius: 16px;
              background: linear-gradient(180deg, rgba(227, 6, 19, 0.92), rgba(150, 0, 10, 0.95));
              box-shadow: inset 0 8px 18px rgba(255, 255, 255, 0.22);
              animation: rise 720ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
              transform-origin: bottom;
            }

            @keyframes rise {
              from {
                transform: scaleY(0.15);
                filter: blur(0.2px);
              }
              to {
                transform: scaleY(1);
                filter: blur(0);
              }
            }

            .rp-chart-label {
              text-align: center;
              font-weight: 950;
              font-size: 12px;
              color: rgba(0, 0, 0, 0.55);
            }

            :global([data-theme="dark"]) .rp-chart-label {
              color: rgba(255, 255, 255, 0.7);
            }

            .rp-chart-foot {
              display: flex;
              gap: 8px;
              flex-wrap: wrap;
              margin-top: 12px;
            }

            @media (max-width: 860px) {
              .rp-chart {
                grid-template-columns: repeat(3, minmax(0, 1fr));
              }
              .rp-chart-col {
                min-height: 180px;
              }
              .rp-chart-barwrap {
                height: 140px;
              }
            }
          `}</style>
        </main>
      </div>
    </div>
  );
}
