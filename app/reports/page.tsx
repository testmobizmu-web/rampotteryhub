"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { rpFetch } from "@/lib/rpFetch";

type InvoiceRow = {
  id: number | string;
  invoice_number?: string | null;
  invoice_date?: string | null; // yyyy-mm-dd or timestamp
  status?: string | null;
  total_amount?: number | string | null;
  amount_paid?: number | string | null;
  balance_remaining?: number | string | null;
  customers?: any; // { name? }
};

type CreditNoteRow = {
  id: number | string;
  credit_note_number?: string | null;
  credit_note_date?: string | null;
  status?: string | null;
  total_amount?: number | string | null;
  customers?: any;
};

type RpSession = {
  id?: string;
  username?: string;
  name?: string;
  role?: string;
};

function n2(v: any) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

function formatRs(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return `Rs ${v.toFixed(2)}`;
}

function fmtDateKey(s?: string | null) {
  if (!s) return "";
  const t = String(s);
  if (t.length >= 10) return t.slice(0, 10);
  return t;
}

function fmtDate(s?: string | null) {
  const key = fmtDateKey(s);
  if (!key) return "—";
  const [y, m, d] = key.split("-");
  if (!y || !m || !d) return key;
  return `${d}/${m}/${y}`;
}

function fmtDateTime(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${dd}/${mm}/${yy}, ${hh}:${mi}:${ss}`;
}

function normalizeCustomerName(customers: any) {
  if (!customers) return "";
  if (typeof customers === "string") return customers;
  if (Array.isArray(customers)) return customers?.[0]?.name || "";
  return customers?.name || "";
}

// rpFetch in your project can return json directly; keep it safe.
async function rpJson(url: string, options?: any) {
  const res = await rpFetch(url, options as any);
  return typeof (res as any)?.json === "function" ? await (res as any).json() : res;
}

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: any) => {
    const s = v == null ? "" : String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replaceAll('"', '""')}"`;
    return s;
  };

  const csv = [headers.map(esc).join(",")].concat(rows.map((r) => r.map(esc).join(","))).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function roleUpper(r?: string) {
  return String(r || "").toUpperCase();
}
function isAdmin(r?: string) {
  return roleUpper(r) === "ADMIN";
}

export default function ReportsPage() {
  const pathname = usePathname();
  const router = useRouter();

  // ✅ hydration lock (must be AFTER hooks are declared)
  const [mounted, setMounted] = useState(false);

  // Shell UI
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lastSync, setLastSync] = useState("—");
  const [session, setSession] = useState<RpSession | null>(null);

  // Data state
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [invoicesAll, setInvoicesAll] = useState<InvoiceRow[]>([]);
  const [creditNotesAll, setCreditNotesAll] = useState<CreditNoteRow[]>([]);

  const [from, setFrom] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState<string>(() => new Date().toISOString().slice(0, 10));

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    // theme
    const saved = localStorage.getItem("rp_theme");
    const initial = saved === "dark" ? "dark" : "light";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;

    // session
    try {
      const raw = localStorage.getItem("rp_user");
      if (!raw) {
        router.replace("/login");
        return;
      }
      const s = JSON.parse(raw);
      setSession(s);
    } catch {
      router.replace("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      // ✅ robust: works with your existing endpoints
      const invJson: any = await rpJson("/api/invoices/list", { cache: "no-store" });
      const cnJson: any = await rpJson("/api/credit-notes", { cache: "no-store" });

      const invList = invJson?.invoices ?? invJson?.data ?? invJson?.rows ?? invJson?.items ?? [];
      const cnList = cnJson?.creditNotes ?? cnJson?.data ?? cnJson?.rows ?? cnJson?.items ?? [];

      setInvoicesAll(Array.isArray(invList) ? invList : []);
      setCreditNotesAll(Array.isArray(cnList) ? cnList : []);

      setLastSync(fmtDateTime(new Date()));
    } catch (e: any) {
      setErr(e?.message || "Failed to load reports");
      setInvoicesAll([]);
      setCreditNotesAll([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter by date range (client-side, safe with list endpoints)
  const filtered = useMemo(() => {
    const fromKey = from || "0000-00-00";
    const toKey = to || "9999-12-31";

    const inv = invoicesAll.filter((r) => {
      const k = fmtDateKey(r.invoice_date);
      if (!k) return false;
      return k >= fromKey && k <= toKey;
    });

    const cn = creditNotesAll.filter((r) => {
      const k = fmtDateKey(r.credit_note_date);
      if (!k) return false;
      return k >= fromKey && k <= toKey;
    });

    const voidCN = cn.filter((r) => String(r.status || "").toUpperCase() === "VOID");
    const activeCN = cn.filter((r) => String(r.status || "").toUpperCase() !== "VOID");

    return { inv, activeCN, voidCN };
  }, [invoicesAll, creditNotesAll, from, to]);

  const totals = useMemo(() => {
    const invTotal = filtered.inv.reduce((a, r) => a + n2(r.total_amount), 0);
    const invPaid = filtered.inv.reduce((a, r) => a + n2(r.amount_paid), 0);
    const invDue = filtered.inv.reduce((a, r) => a + n2(r.balance_remaining), 0);

    const cnTotal = filtered.activeCN.reduce((a, r) => a + n2(r.total_amount), 0);

    const voidCount = filtered.voidCN.length;
    const voidTotal = filtered.voidCN.reduce((a, r) => a + n2(r.total_amount), 0);

    return {
      invCount: filtered.inv.length,
      invTotal,
      invPaid,
      invDue,
      cnCount: filtered.activeCN.length,
      cnTotal,
      voidCount,
      voidTotal,
    };
  }, [filtered]);

  function exportInvoicesCsv() {
    const headers = ["Invoice No", "Date", "Customer", "Total", "Paid", "Balance", "Status"];
    const rows = filtered.inv.map((r) => {
      const cname = normalizeCustomerName(r.customers);
      return [
        r.invoice_number || `#${r.id}`,
        fmtDate(r.invoice_date),
        cname || "",
        n2(r.total_amount).toFixed(2),
        n2(r.amount_paid).toFixed(2),
        n2(r.balance_remaining).toFixed(2),
        String(r.status || "").toUpperCase(),
      ];
    });

    downloadCsv(`reports_invoices_${from}_to_${to}.csv`, headers, rows);
  }

  function exportCreditNotesCsv() {
    const headers = ["Credit Note No", "Date", "Customer", "Total", "Status"];
    const rows = filtered.activeCN.map((r) => {
      const cname = normalizeCustomerName(r.customers);
      return [
        r.credit_note_number || `#${r.id}`,
        fmtDate(r.credit_note_date),
        cname || "",
        n2(r.total_amount).toFixed(2),
        String(r.status || "").toUpperCase(),
      ];
    });

    downloadCsv(`reports_credit_notes_${from}_to_${to}.csv`, headers, rows);
  }

  const userLabel = useMemo(() => {
    const name = (session?.name || session?.username || "").trim();
    return name ? name : "User";
  }, [session]);

  const roleLabel = useMemo(() => roleUpper(session?.role) || "STAFF", [session]);
  const canSeeAdminNav = mounted && isAdmin(session?.role);

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

  // ✅ hydration lock AFTER hooks
  if (!mounted) return null;

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
            <div className="rp-mtop-sub">Reports</div>
          </div>

          <button type="button" className="rp-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
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
              {navItems.map((it) => (
                <Link
                  key={it.href}
                  className={`rp-nav-btn ${it.href === "/reports" ? "rp-nav-btn--active" : ""}`}
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
                  className={`rp-nav-btn ${it.href === "/reports" ? "rp-nav-btn--active" : ""}`}
                  href={it.href}
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
              <div className="rp-exec__title">Reports & Statements</div>
              <div className="rp-exec__sub">Period totals • exports • credit notes (VOID excluded)</div>
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

          {/* KPI row (premium) */}
          <section className="rp-kpi-pro rp-card-anim">
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Invoice Total</div>
              <div className="rp-kpi-pro__value">{formatRs(totals.invTotal)}</div>
              <div className="rp-kpi-pro__sub">{totals.invCount} invoice(s)</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Paid</div>
              <div className="rp-kpi-pro__value">{formatRs(totals.invPaid)}</div>
              <div className="rp-kpi-pro__sub">Collected</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Outstanding</div>
              <div className="rp-kpi-pro__value">{formatRs(totals.invDue)}</div>
              <div className="rp-kpi-pro__sub">Balance remaining</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Credit Notes</div>
              <div className="rp-kpi-pro__value">{formatRs(totals.cnTotal)}</div>
              <div className="rp-kpi-pro__sub">{totals.cnCount} active</div>
            </div>
          </section>

          {/* Period controls */}
          <section className="rp-card rp-card-anim">
            <div className="rp-card-head rp-card-head--tight">
              <div>
                <div className="rp-card-title">Date Range</div>
                <div className="rp-card-sub">Adjust the period and refresh totals</div>
              </div>
              <span className={`rp-chip ${loading ? "is-dim" : ""}`}>{loading ? "Loading…" : "Ready"}</span>
            </div>

            <div className="rp-card-body">
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  alignItems: "end",
                }}
              >
                <label className="rp-field" style={{ minWidth: 220 }}>
                  <span className="rp-label">From</span>
                  <input className="rp-input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </label>

                <label className="rp-field" style={{ minWidth: 220 }}>
                  <span className="rp-label">To</span>
                  <input className="rp-input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </label>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="rp-ui-btn rp-ui-btn--danger" type="button" onClick={load} disabled={loading}>
                    <span className="rp-ui-btn__dot" aria-hidden="true" />
                    {loading ? "Loading…" : "Refresh"}
                  </button>

                  <Link className="rp-ui-btn rp-ui-btn--brand" href="/invoices" prefetch={false}>
                    <span className="rp-ui-btn__dot" aria-hidden="true" />
                    View Invoices
                  </Link>
                </div>

                <div className="rp-muted" style={{ fontWeight: 900 }}>
                  Showing <b>{totals.invCount}</b> invoices • <b>{totals.cnCount}</b> credit notes •{" "}
                  <b>{totals.voidCount}</b> VOID excluded
                </div>
              </div>

              {err ? (
                <div className="rp-note rp-note--warn" style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>
                  {err}
                </div>
              ) : null}
            </div>
          </section>

          {/* Exports */}
          <section className="rp-card rp-card-anim">
            <div className="rp-card-head rp-card-head--tight">
              <div>
                <div className="rp-card-title">Exports</div>
                <div className="rp-card-sub">Download CSV for accounting / audits</div>
              </div>
              <span className="rp-chip">CSV</span>
            </div>

            <div className="rp-card-body">
              <div className="rp-seg rp-seg--pro" style={{ justifyContent: "flex-start" }}>
                <button className="rp-seg-item rp-seg-item--brand" type="button" onClick={exportInvoicesCsv}>
                  <span className="rp-icbtn" aria-hidden="true">
                    ⬇
                  </span>
                  Export Invoices CSV
                </button>

                <button className="rp-seg-item rp-seg-item--brand" type="button" onClick={exportCreditNotesCsv}>
                  <span className="rp-icbtn" aria-hidden="true">
                    ⬇
                  </span>
                  Export Credit Notes CSV
                </button>
              </div>

              <div className="rp-muted" style={{ marginTop: 10 }}>
                Tip: Credit notes marked <b>VOID</b> are excluded from totals but tracked in KPI.
              </div>
            </div>
          </section>

          {/* VOID summary (premium callout) */}
          <section className="rp-card rp-card-anim" style={{ border: "1px solid rgba(255,107,107,.22)" }}>
            <div className="rp-card-head rp-card-head--tight">
              <div>
                <div className="rp-card-title">VOID Credit Notes</div>
                <div className="rp-card-sub">Excluded from totals (kept for audit trail)</div>
              </div>
              <span className="rp-chip rp-chip--warn">{totals.voidCount} VOID</span>
            </div>
            <div className="rp-card-body" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span className="rp-status rp-status-pending">
                <span className="rp-status-dot" />
                Count: <b>{totals.voidCount}</b>
              </span>
              <span className="rp-status rp-status-cancelled">
                <span className="rp-status-dot" />
                Amount: <b>{formatRs(totals.voidTotal)}</b>
              </span>
            </div>
          </section>

          <footer className="rp-footer">© {new Date().getFullYear()} Ram Pottery Ltd • Built by Mobiz.mu</footer>
        </main>
      </div>
    </div>
  );
}
