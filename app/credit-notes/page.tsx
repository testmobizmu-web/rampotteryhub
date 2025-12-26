"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type CustomerMini = { name: string | null; customer_code: string | null };

type CreditNoteRow = {
  id: number;
  credit_note_number: string | null;
  credit_note_date: string | null;
  total_amount: number | null;
  status: string | null;
  customers: CustomerMini[] | CustomerMini | null;
};

type FilterKey = "ALL" | "ISSUED" | "PENDING" | "REFUNDED" | "VOID";

function fmtMoney(n: number | null | undefined) {
  const v = Number(n || 0);
  return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(s: string | null | undefined) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-GB");
}

function normalizeCustomer(c: CreditNoteRow["customers"]): CustomerMini | null {
  if (!c) return null;
  if (Array.isArray(c)) return c[0] || null;
  return c;
}

/**
 * Use dashboard badge system for consistency:
 * - ISSUED -> rp-badge--issued
 * - PENDING -> rp-badge--neutral
 * - REFUNDED -> rp-badge--refund
 * - VOID -> rp-badge--void
 */
function badgeForCredit(statusRaw: string | null | undefined) {
  const st = String(statusRaw || "").toUpperCase().trim();

  if (st === "VOID" || st === "VOIDED" || st === "CANCELLED") {
    return { label: "VOID", cls: "rp-badge rp-badge--void", key: "VOID" as const };
  }
  if (st === "REFUNDED") {
    return { label: "REFUNDED", cls: "rp-badge rp-badge--refund", key: "REFUNDED" as const };
  }
  if (st === "ISSUED") {
    return { label: "ISSUED", cls: "rp-badge rp-badge--issued", key: "ISSUED" as const };
  }
  if (!st || st === "PENDING") {
    return { label: "PENDING", cls: "rp-badge rp-badge--neutral", key: "PENDING" as const };
  }

  // unknown -> keep label, neutral badge, treat as pending for filter logic
  return { label: st.replaceAll("_", " "), cls: "rp-badge rp-badge--neutral", key: "PENDING" as const };
}

function toCsvValue(v: unknown) {
  const s = String(v ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, headers: string[], rows: Array<Array<unknown>>) {
  const csv = [headers, ...rows].map((r) => r.map(toCsvValue).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function CreditNotesPage() {
  const router = useRouter();

  const [rows, setRows] = useState<CreditNoteRow[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

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

  async function load() {
    setLoading(true);
    setErr(null);

    const { data, error } = await supabase
      .from("credit_notes")
      .select(
        `
        id,
        credit_note_number,
        credit_note_date,
        total_amount,
        status,
        customers ( name, customer_code )
      `
      )
      .order("id", { ascending: false });

    if (error) {
      setErr(error.message);
      setRows([]);
    } else {
      setRows((data as unknown as CreditNoteRow[]) || []);
    }

    const now = new Date();
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

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();

    return rows
      .filter((r) => {
        if (filter === "ALL") return true;
        const b = badgeForCredit(r.status);
        return b.key === filter;
      })
      .filter((r) => {
        if (!needle) return true;
        const c = normalizeCustomer(r.customers);
        const hay = [
          r.credit_note_number || "",
          r.credit_note_date || "",
          r.status || "",
          c?.name || "",
          c?.customer_code || "",
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(needle);
      });
  }, [rows, q, filter]);

  const totals = useMemo(() => {
    const sumTotal = filtered.reduce((a, r) => a + Number(r.total_amount || 0), 0);
    return { count: filtered.length, sumTotal };
  }, [filtered]);

  function exportCsv() {
    const headers = ["Credit Note No", "Date", "Customer", "Customer Code", "Total (Rs)", "Status"];
    const dataRows = filtered.map((r) => {
      const c = normalizeCustomer(r.customers);
      const badge = badgeForCredit(r.status);
      return [
        r.credit_note_number || `#${r.id}`,
        fmtDate(r.credit_note_date),
        c?.name || "",
        c?.customer_code || "",
        fmtMoney(r.total_amount),
        badge.label,
      ];
    });

    downloadCsv(`credit_notes_${new Date().toISOString().slice(0, 10)}.csv`, headers, dataRows);
  }

  const filterPills: Array<{ key: FilterKey; label: string }> = [
    { key: "ALL", label: "All" },
    { key: "ISSUED", label: "Issued" },
    { key: "PENDING", label: "Pending" },
    { key: "REFUNDED", label: "Refunded" },
    { key: "VOID", label: "Void" },
  ];

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("rp_theme", next ? "dark" : "light");
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
            <div className="rp-mtop-title">Credit Notes</div>
            <div className="rp-mtop-sub">Printable • Export • Print</div>
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

        {/* ===== MOBILE DRAWER ===== */}
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

            <button type="button" className="rp-icon-btn" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">
              ✕
            </button>
          </div>

          <nav className="rp-nav" onClick={() => setMobileNavOpen(false)}>
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
        </aside>

        {/* ===== DESKTOP SIDEBAR ===== */}
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
                <span>Module</span>
                <b>Sales</b>
              </div>
            </div>
          </div>
        </aside>

        {/* ===== MAIN ===== */}
        <main className="rp-main">
          {/* Header */}
          <div className="rp-top rp-card-anim" style={{ animationDelay: "60ms" }}>
            <div className="rp-title">
              <div className="rp-eyebrow">
                <span className="rp-tag">Printable • Export • Print</span>
                <span className="rp-tag">Tip: click credit note no</span>
              </div>
              <h1>Credit Notes</h1>
              <p>Premium list • fast filters • one-click printing (RamPotteryDoc)</p>
            </div>

            <div className="rp-top-right">
              <div className="rp-sync">
                <div className="rp-sync-label">Last sync</div>
                <div className="rp-sync-time">{lastSync}</div>
              </div>

              <button type="button" className="rp-theme-btn" onClick={toggleTheme}>
                {dark ? "☀️ Light" : "🌙 Dark"}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="rp-actions rp-card-anim" style={{ animationDelay: "120ms" }}>
            <div className="rp-seg">
              <Link className="rp-seg-item rp-seg-item--primary" href="/credit-notes/new">
                + New Credit Note
              </Link>
              <button className="rp-seg-item" type="button" onClick={exportCsv} disabled={loading}>
                ⬇ Export CSV
              </button>
              <button className="rp-seg-item" type="button" onClick={() => window.print()}>
                🖨 Print
              </button>
              <button className="rp-seg-item" type="button" onClick={load} disabled={loading}>
                {loading ? "Loading…" : "Refresh"}
              </button>
              <button className="rp-seg-item" type="button" onClick={() => router.push("/")}>
                ← Dashboard
              </button>
            </div>
          </div>

          {/* KPIs (small + premium) */}
          <section className="rp-kpis rp-card-anim" style={{ animationDelay: "170ms" }}>
            <div className="rp-kpi-card">
              <div className="rp-kpi-head">
                <span className="rp-kpi-ico">#</span>
                <span className="rp-kpi-title">Credit Notes</span>
              </div>
              <div className="rp-kpi-val">{totals.count}</div>
              <div className="rp-kpi-sub">Current view</div>
            </div>

            <div className="rp-kpi-card">
              <div className="rp-kpi-head">
                <span className="rp-kpi-ico">₹</span>
                <span className="rp-kpi-title">Total</span>
              </div>
              <div className="rp-kpi-val">Rs {fmtMoney(totals.sumTotal)}</div>
              <div className="rp-kpi-sub">Sum of totals</div>
            </div>

            <div className="rp-kpi-card">
              <div className="rp-kpi-head">
                <span className="rp-kpi-ico">⏳</span>
                <span className="rp-kpi-title">Pending</span>
              </div>
              <div className="rp-kpi-val">
                {filtered.filter((r) => badgeForCredit(r.status).key === "PENDING").length}
              </div>
              <div className="rp-kpi-sub">Awaiting action</div>
            </div>

            <div className="rp-kpi-card">
              <div className="rp-kpi-head">
                <span className="rp-kpi-ico">✓</span>
                <span className="rp-kpi-title">Issued</span>
              </div>
              <div className="rp-kpi-val">
                {filtered.filter((r) => badgeForCredit(r.status).key === "ISSUED").length}
              </div>
              <div className="rp-kpi-sub">Published</div>
            </div>
          </section>

          {/* Search + Filters */}
          <section className="rp-card rp-glass rp-card-anim" style={{ animationDelay: "220ms" }}>
            <div className="rp-card-head">
              <div>
                <div className="rp-card-title">Search & Filters</div>
                <div className="rp-card-sub">Credit note no • customer • status • code</div>
              </div>
              <span className="rp-pill">{loading ? "Syncing…" : "Ready"}</span>
            </div>

            <div className="rp-card-body">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <input
                  className="rp-input"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search credit note no, customer, status…"
                  style={{ flex: "1 1 280px" }}
                />

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {filterPills.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      className={`rp-chip ${filter === p.key ? "rp-chip--primary" : ""}`}
                      onClick={() => setFilter(p.key)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {err && (
                <div style={{ marginTop: 12, color: "rgba(227,6,19,0.95)", fontWeight: 900 }}>
                  {err}
                </div>
              )}
            </div>
          </section>

          {/* List */}
          <section className="rp-card rp-glass rp-card-anim" style={{ animationDelay: "280ms" }}>
            <div className="rp-card-head rp-card-head--tight">
              <div>
                <div className="rp-card-title">Credit Note List</div>
                <div className="rp-card-sub">Click credit note number to open printable document</div>
              </div>
              <span className="rp-soft-pill">
                Showing <b>{filtered.length}</b>
              </span>
            </div>

            <div className="rp-card-body" style={{ padding: 0 }}>
              <div className="rp-table-wrap">
                <table className="rp-table">
                  <thead>
                    <tr>
                      <th style={{ width: 200 }}>Credit Note No</th>
                      <th style={{ width: 140 }}>Date</th>
                      <th>Customer</th>
                      <th style={{ textAlign: "right", width: 170 }}>Total (Rs)</th>
                      <th style={{ width: 180 }}>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="rp-td-empty">
                          No credit notes found.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((r) => {
                        const c = normalizeCustomer(r.customers);
                        const badge = badgeForCredit(r.status);

                        return (
                          <tr key={r.id}>
                            <td className="rp-strong">
                              <Link className="rp-row-link" href={`/credit-notes/${r.id}`}>
                                {r.credit_note_number || `#${r.id}`}
                              </Link>
                            </td>
                            <td>{fmtDate(r.credit_note_date)}</td>
                            <td className="rp-strong">{c?.name || "—"}</td>
                            <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }} className="rp-strong">
                              {fmtMoney(r.total_amount)}
                            </td>
                            <td>
                              <span className={badge.cls}>{badge.label}</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <footer className="rp-footer rp-card-anim" style={{ animationDelay: "340ms" }}>
            © 2025 Ram Pottery Ltd • Built by <span>MoBiz.mu</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
