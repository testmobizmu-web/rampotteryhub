"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "../components/auth/LogoutButton";

/* ---------------- types ---------------- */
type SessionUser = {
  id: number | string;
  username: string;
  role?: string;
  permissions?: Record<string, any>;
};

type RecentInvoice = {
  id: number;
  invoice_number: string;
  invoice_date: string;
  total_amount: number;
  status: string;
  customers?: { name?: string } | null;
};

type DashboardSummary = {
  totalSalesToday: number;
  totalSalesMonth: number;
  outstanding: number;
  lowStock: Array<{
    id: number;
    sku: string | null;
    name: string | null;
    current_stock: number | null;
    reorder_level: number | null;
  }>;
  recentInvoices: RecentInvoice[];
  monthlyLabels: string[];
  monthlyValues: number[];
  customerLabels: string[];
  customerValues: number[];
  creditNotesTotal: number;
};

/* ---------------- utils ---------------- */
function formatRs(n: number) {
  const val = Number.isFinite(n) ? n : 0;
  return `Rs ${val.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(d: string) {
  if (!d) return "-";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString("en-GB"); // dd/mm/yyyy
  } catch {
    return d;
  }
}

function statusMeta(statusRaw: string) {
  const s = (statusRaw || "").toUpperCase().trim();

  if (s === "PAID") return { label: "PAID", className: "rp-badge rp-badge--paid" };
  if (s === "PARTIALLY_PAID" || s === "PARTIAL")
    return { label: "PARTIALLY PAID", className: "rp-badge rp-badge--partial" };
  if (s === "ISSUED") return { label: "ISSUED", className: "rp-badge rp-badge--issued" };
  if (s === "VOID" || s === "VOIDED") return { label: "VOID", className: "rp-badge rp-badge--void" };
  if (s === "REFUNDED") return { label: "REFUNDED", className: "rp-badge rp-badge--refund" };

  return { label: s || "UNKNOWN", className: "rp-badge rp-badge--neutral" };
}

/* ---------------- lightweight SVG charts (no deps) ---------------- */
function BarChartSvg({ labels, values }: { labels: string[]; values: number[] }) {
  const max = Math.max(1, ...values.map((v) => (Number.isFinite(v) ? v : 0)));
  const n = Math.max(1, values.length);

  const W = 980;
  const H = 300;
  const padL = 64;
  const padR = 18;
  const padT = 18;
  const padB = 52;

  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const step = innerW / n;
  const barW = Math.max(12, Math.min(56, step * 0.55));

  const ticks = 4;
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => (max * i) / ticks);

  return (
    <div className="rp-chart">
      <svg viewBox={`0 0 ${W} ${H}`} className="rp-svg" role="img" aria-label="Monthly sales bar chart">
        {tickVals.map((tv, i) => {
          const y = padT + innerH - (tv / max) * innerH;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} className="rp-gridline" />
              <text x={padL - 12} y={y + 4} textAnchor="end" className="rp-axis">
                {tv === 0 ? "0" : `Rs ${Math.round(tv).toLocaleString("en-US")}`}
              </text>
            </g>
          );
        })}

        {values.map((v, i) => {
          const val = Number.isFinite(v) ? v : 0;
          const h = (val / max) * innerH;
          const x = padL + i * step + (step - barW) / 2;
          const y = padT + innerH - h;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={h} rx={12} className="rp-bar" />
              <text x={padL + i * step + step / 2} y={H - 20} textAnchor="middle" className="rp-axis">
                {labels[i] || "-"}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="rp-chart-note">
        <span className="rp-dot" />
        Monthly Sales (Rs)
      </div>
    </div>
  );
}

function DonutChartSvg({ labels, values }: { labels: string[]; values: number[] }) {
  const safe = values.map((v) => (Number.isFinite(v) ? Math.max(0, v) : 0));
  const total = safe.reduce((a, b) => a + b, 0) || 1;

  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const r = 120;
  const stroke = 26;
  const C = 2 * Math.PI * r;

  let acc = 0;

  const top = (() => {
    let bestIdx = 0;
    let best = -1;
    safe.forEach((v, i) => {
      if (v > best) {
        best = v;
        bestIdx = i;
      }
    });
    return { name: labels[bestIdx] || "—", value: safe[bestIdx] || 0 };
  })();

  return (
    <div className="rp-donut-wrap">
      <div className="rp-donut">
        <svg viewBox={`0 0 ${size} ${size}`} className="rp-svg" role="img" aria-label="Sales by customer donut chart">
          <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth={stroke} className="rp-donut-track" />

          {safe.map((v, i) => {
            const frac = v / total;
            const dash = frac * C;
            const gap = C - dash;

            const offset = C * 0.25 - acc * C;
            acc += frac;

            const cls = `rp-donut-slice rp-donut-slice--${(i % 5) + 1}`;

            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                strokeWidth={stroke}
                strokeLinecap="round"
                className={cls}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={offset}
              />
            );
          })}

          <circle cx={cx} cy={cy} r={r - stroke / 2 - 12} className="rp-donut-center" />
          <text x={cx} y={cy - 10} textAnchor="middle" className="rp-donut-title">
            Top Customer
          </text>
          <text x={cx} y={cy + 18} textAnchor="middle" className="rp-donut-value">
            {top.name}
          </text>
          <text x={cx} y={cy + 44} textAnchor="middle" className="rp-donut-sub">
            {formatRs(top.value)}
          </text>
        </svg>
      </div>

      <div className="rp-legend">
        {safe.map((v, i) => (
          <div key={i} className="rp-legend-item">
            <span className={`rp-legend-dot rp-legend-dot--${(i % 5) + 1}`} />
            <div className="rp-legend-text">
              <div className="rp-legend-name">{labels[i] || "Unknown"}</div>
              <div className="rp-legend-val">{formatRs(v)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- page ---------------- */
export default function DashboardPage() {
  const router = useRouter();

  const [session, setSession] = useState<SessionUser | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const [dark, setDark] = useState(false);
  const [lastSync, setLastSync] = useState<string>("—");

  /* ✅ MOBILE DRAWER STATE */
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // lock background scroll when drawer is open
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

  // theme init
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("rp_theme") : null;
    const isDark = saved === "dark";
    setDark(isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, []);

  // session guard + summary load
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        const s1 = await fetch("/api/session", { cache: "no-store" })
          .then((r) => r.json())
          .catch(() => ({ ok: false }));

        if (!s1?.ok) {
          router.replace("/login");
          return;
        }

        if (!cancelled) setSession(s1.session);

        const s2 = await fetch("/api/dashboard/summary", { cache: "no-store" })
          .then((r) => r.json())
          .catch(() => null);

        if (!cancelled) setSummary(s2);

        const now = new Date();
        if (!cancelled) {
          setLastSync(
            now.toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const roleLabel = useMemo(() => {
    const r = (session?.role || "").toUpperCase().trim();
    return r || "UNKNOWN";
  }, [session?.role]);

  const monthlyLabels = summary?.monthlyLabels || [];
  const monthlyValues = summary?.monthlyValues || [];
  const customerLabels = summary?.customerLabels || [];
  const customerValues = summary?.customerValues || [];

  const kpiSalesToday = summary?.totalSalesToday ?? 0;
  const kpiSalesMonth = summary?.totalSalesMonth ?? 0;
  const kpiOutstanding = summary?.outstanding ?? 0;
  const kpiLowStock = (summary?.lowStock || []).length;

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("rp_theme", next ? "dark" : "light");
  }

  // Prevent UI flicker before redirect
  if (loading) {
    return <div style={{ padding: 20 }}>Loading…</div>;
  }
  if (!session) {
    return null;
  }

  return (
    <div className="rp-app">
      {/* animated luxury background */}
      <div className="rp-bg" aria-hidden="true">
        <span className="rp-bg-orb rp-bg-orb--1" />
        <span className="rp-bg-orb rp-bg-orb--2" />
        <span className="rp-bg-orb rp-bg-orb--3" />
        <span className="rp-bg-grid" />
      </div>

      <div className="rp-shell rp-enter">
        {/* ===== MOBILE TOP BAR ===== */}
        <div className="rp-mtop">
          <button
            type="button"
            className="rp-icon-btn"
            aria-label="Open menu"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen(true)}
          >
            <span className="rp-burger" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>

          <div className="rp-mtop-brand">
            <div className="rp-mtop-title">RamPotteryHub</div>
            <div className="rp-mtop-sub">Accounting & Stock</div>
          </div>

          <button type="button" className="rp-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {dark ? "☀️" : "🌙"}
          </button>
        </div>

        {/* ===== MOBILE OVERLAY ===== */}
        <button
          type="button"
          className={`rp-overlay ${mobileNavOpen ? "is-open" : ""}`}
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />

        {/* ===== MOBILE DRAWER (same sidebar content) ===== */}
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
                <div className="rp-drawer-sub">Online Accounting & Stock</div>
              </div>
            </div>

            <button
              type="button"
              className="rp-icon-btn"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* clicking a nav item closes drawer */}
          <nav className="rp-nav" onClick={() => setMobileNavOpen(false)}>
            <Link className="rp-nav-btn rp-nav-btn--active" href="/">
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
            <Link className="rp-nav-btn" href="/stock-movements">
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
              <span>Role</span>
              <b>{roleLabel}</b>
            </div>
          </div>
        </aside>

        {/* ===== DESKTOP SIDEBAR (unchanged) ===== */}
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
              <Link className="rp-nav-btn rp-nav-btn--active" href="/">
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
              <Link className="rp-nav-btn" href="/stock-movements">
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
                <span>Role</span>
                <b>{roleLabel}</b>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="rp-main">
          <div className="rp-top rp-card-anim" style={{ animationDelay: "60ms" }}>
            <div className="rp-title">
              <div className="rp-eyebrow">
                <span className="rp-tag">Secure • Cloud</span>
                <span className="rp-tag">VAT 15%</span>
              </div>
              <h1>RamPotteryHub</h1>
              <p>Accounting & stock — premium overview</p>
            </div>

            <div className="rp-top-right">
              <div className="rp-sync">
                <div className="rp-sync-label">Last sync</div>
                <div className="rp-sync-time">{lastSync}</div>
             <LogoutButton />
           </div>

              <button type="button" className="rp-theme-btn" onClick={toggleTheme}>
                {dark ? "☀️ Light" : "🌙 Dark"}
              </button>
            </div>
          </div>

          {/* segmented quick actions */}
          <div className="rp-actions rp-card-anim" style={{ animationDelay: "120ms" }}>
            <div className="rp-seg">
              <Link className="rp-seg-item rp-seg-item--primary" href="/invoices/new">
                + New Invoice
              </Link>
              <Link className="rp-seg-item" href="/invoices">
                Reprint / View Invoices
              </Link>
              <Link className="rp-seg-item" href="/credit-notes">
                Credit Notes
              </Link>
              <Link className="rp-seg-item" href="/products/import">
                Import Stock Excel
              </Link>
              <Link className="rp-seg-item" href="/customers">
                Customers
              </Link>
            </div>
          </div>

          {/* KPIs */}
          <section className="rp-kpis rp-card-anim" style={{ animationDelay: "180ms" }}>
            <div className="rp-kpi-card">
              <div className="rp-kpi-head">
                <span className="rp-kpi-ico">₹</span>
                <span className="rp-kpi-title">Sales Today</span>
              </div>
              <div className="rp-kpi-val">{formatRs(kpiSalesToday)}</div>
              <div className="rp-kpi-sub">Invoices dated today</div>
            </div>

            <div className="rp-kpi-card">
              <div className="rp-kpi-head">
                <span className="rp-kpi-ico">↗</span>
                <span className="rp-kpi-title">Sales This Month</span>
              </div>
              <div className="rp-kpi-val">{formatRs(kpiSalesMonth)}</div>
              <div className="rp-kpi-sub">Month-to-date</div>
            </div>

            <div className="rp-kpi-card">
              <div className="rp-kpi-head">
                <span className="rp-kpi-ico">!</span>
                <span className="rp-kpi-title">Outstanding</span>
              </div>
              <div className="rp-kpi-val">{formatRs(kpiOutstanding)}</div>
              <div className="rp-kpi-sub">Total balance due</div>
            </div>

            <div className="rp-kpi-card">
              <div className="rp-kpi-head">
                <span className="rp-kpi-ico">✓</span>
                <span className="rp-kpi-title">Low Stock</span>
              </div>
              <div className="rp-kpi-val">{kpiLowStock}</div>
              <div className="rp-kpi-sub">Reorder suggested</div>
            </div>
          </section>

          {/* GRID */}
          <section className="rp-grid rp-card-anim" style={{ animationDelay: "240ms" }}>
            {/* LEFT STACK */}
            <div className="rp-col rp-col--wide">
              <section className="rp-card rp-glass">
                <header className="rp-card-head">
                  <div>
                    <div className="rp-card-title">Sales — Last 6 Months</div>
                    <div className="rp-card-sub">Monthly totals (Rs)</div>
                  </div>
                  <span className="rp-pill">Bar</span>
                </header>

                <div className="rp-card-body">
                  {monthlyValues.length ? (
                    <BarChartSvg labels={monthlyLabels} values={monthlyValues} />
                  ) : (
                    <div className="rp-empty">
                      <b>No monthly sales data</b>
                      <span>Once invoices exist across months, the bar chart will appear here.</span>
                    </div>
                  )}
                </div>
              </section>

              <section className="rp-card rp-glass">
                <header className="rp-card-head">
                  <div>
                    <div className="rp-card-title">Sales by Customer (Top 5)</div>
                    <div className="rp-card-sub">Share of revenue</div>
                  </div>
                  <span className="rp-pill">Pie</span>
                </header>

                <div className="rp-card-body">
                  {customerValues.length ? (
                    <DonutChartSvg labels={customerLabels} values={customerValues} />
                  ) : (
                    <div className="rp-empty">
                      <b>No customer sales yet</b>
                      <span>As soon as invoices exist, the customer chart will show here.</span>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* RIGHT */}
            <div className="rp-col">
              <section className="rp-card rp-glass">
                <header className="rp-card-head rp-card-head--tight">
                  <div>
                    <div className="rp-card-title">Recent Invoices</div>
                    <div className="rp-card-sub">Latest 10</div>
                  </div>
                  <Link className="rp-link-btn" href="/invoices">
                    View all →
                  </Link>
                </header>

                <div className="rp-card-body">
                  <div className="rp-table-wrap">
                    <table className="rp-table">
                      <thead>
                        <tr>
                          <th style={{ width: 130 }}>No.</th>
                          <th style={{ width: 120 }}>Date</th>
                          <th>Customer</th>
                          <th style={{ width: 150, textAlign: "right" }}>Total</th>
                          <th style={{ width: 150 }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(summary?.recentInvoices || []).slice(0, 10).map((inv) => {
                          const st = statusMeta(inv.status);
                          return (
                            <tr key={inv.id}>
                              <td className="rp-strong">
                                <Link className="rp-row-link" href={`/invoices/${inv.id}`}>
                                  {inv.invoice_number}
                                </Link>
                              </td>
                              <td>{formatDate(inv.invoice_date)}</td>
                              <td className="rp-strong">{inv.customers?.name || "Unknown"}</td>
                              <td style={{ textAlign: "right" }} className="rp-strong">
                                {formatRs(inv.total_amount || 0)}
                              </td>
                              <td>
                                <span className={st.className}>{st.label}</span>
                              </td>
                            </tr>
                          );
                        })}

                        {!summary?.recentInvoices?.length && (
                          <tr>
                            <td colSpan={5} className="rp-td-empty">
                              No invoices found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              <section className="rp-card rp-glass">
                <header className="rp-card-head rp-card-head--tight">
                  <div>
                    <div className="rp-card-title">Stock & Quick Links</div>
                    <div className="rp-card-sub">Shortcuts</div>
                  </div>
                  <span className="rp-soft-pill">
                    Credit notes (month): <b>{formatRs(summary?.creditNotesTotal ?? 0)}</b>
                  </span>
                </header>

                <div className="rp-card-body">
                  <div className="rp-chip-row">
                    <Link className="rp-chip rp-chip--primary" href="/reports">
                      Reports
                    </Link>
                    <Link className="rp-chip" href="/customers">
                      Customer Pricing
                    </Link>
                    <Link className="rp-chip" href="/products">
                      Products
                    </Link>
                    <Link className="rp-chip" href="/stock-movements">
                      Stock Movements
                    </Link>
                  </div>
                </div>
              </section>

              <section className="rp-card rp-glass">
                <header className="rp-card-head rp-card-head--tight">
                  <div>
                    <div className="rp-card-title">Low Stock Products</div>
                    <div className="rp-card-sub">Reorder suggested</div>
                  </div>
                </header>

                <div className="rp-card-body">
                  {(summary?.lowStock || []).length ? (
                    <div className="rp-table-wrap">
                      <table className="rp-table">
                        <thead>
                          <tr>
                            <th style={{ width: 140 }}>Code</th>
                            <th>Product</th>
                            <th style={{ width: 110, textAlign: "right" }}>Stock</th>
                            <th style={{ width: 110, textAlign: "right" }}>Reorder</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(summary?.lowStock || []).slice(0, 8).map((p) => (
                            <tr key={p.id}>
                              <td className="rp-strong">{p.sku || "-"}</td>
                              <td>{p.name || "-"}</td>
                              <td style={{ textAlign: "right" }} className="rp-strong">
                                {p.current_stock ?? 0}
                              </td>
                              <td style={{ textAlign: "right" }}>{p.reorder_level ?? 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="rp-empty rp-empty--compact">
                      <b>No low stock items 🎉</b>
                      <span>Your inventory looks healthy.</span>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </section>

          <footer className="rp-footer rp-card-anim" style={{ animationDelay: "320ms" }}>
            © 2025 Ram Pottery Ltd • Built by <span>MoBiz.mu</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
