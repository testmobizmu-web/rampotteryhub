"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  // if timestamp, keep YYYY-MM-DD
  const t = String(s);
  if (t.length >= 10) return t.slice(0, 10);
  return t;
}

function fmtDate(s?: string | null) {
  const key = fmtDateKey(s);
  if (!key) return "—";
  // key = YYYY-MM-DD
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

  const csv = [headers.map(esc).join(",")]
    .concat(rows.map((r) => r.map(esc).join(",")))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const pathname = usePathname();

  // ✅ hydration lock (must be AFTER hooks are declared)
  const [mounted, setMounted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState("—");

  const [invoicesAll, setInvoicesAll] = useState<InvoiceRow[]>([]);
  const [creditNotesAll, setCreditNotesAll] = useState<CreditNoteRow[]>([]);

  const [from, setFrom] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState<string>(() => new Date().toISOString().slice(0, 10));

  useEffect(() => setMounted(true), []);

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      // ✅ robust: works with your existing endpoints
      const invJson: any = await rpJson("/api/invoices/list", { cache: "no-store" });
      const cnJson: any = await rpJson("/api/credit-notes", { cache: "no-store" });

      const invList =
        invJson?.invoices ?? invJson?.data ?? invJson?.rows ?? invJson?.items ?? [];
      const cnList =
        cnJson?.creditNotes ?? cnJson?.data ?? cnJson?.rows ?? cnJson?.items ?? [];

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

  // ✅ hydration lock AFTER hooks
  if (!mounted) return null;

  return (
    <div className="rp-app rp-enter">
      <div className="rp-bg" aria-hidden="true">
        <div className="rp-bg-orb rp-bg-orb--1" />
        <div className="rp-bg-orb rp-bg-orb--2" />
        <div className="rp-bg-orb rp-bg-orb--3" />
        <div className="rp-bg-grid" />
      </div>

      <div className="rp-shell">
        {/* Sidebar (same premium style) */}
        <aside className="rp-side rp-side--desktop">
          <div className="rp-side-card rp-card-anim">
            <div className="rp-brand">
              <div className="rp-brand-logo rp-brand-logo--white">
                <img
                  src="/images/logo/logo.png"
                  alt="Ram Pottery"
                  width={40}
                  height={40}
                  style={{ display: "block", objectFit: "contain" }}
                />
              </div>
              <div>
                <div className="rp-brand-title">RamPotteryHUB</div>
                <div className="rp-brand-sub">Accounting • Stock • Invoicing</div>
              </div>
            </div>

            <nav className="rp-nav">
              <Link className={`rp-nav-btn ${pathname === "/" ? "rp-nav-btn--active" : ""}`} href="/" prefetch={false}>
                Dashboard
              </Link>
              <Link className={`rp-nav-btn ${pathname?.startsWith("/invoices") ? "rp-nav-btn--active" : ""}`} href="/invoices" prefetch={false}>
                Invoices
              </Link>
              <Link className={`rp-nav-btn ${pathname?.startsWith("/credit-notes") ? "rp-nav-btn--active" : ""}`} href="/credit-notes" prefetch={false}>
                Credit Notes
              </Link>
              <Link className={`rp-nav-btn ${pathname?.startsWith("/customers") ? "rp-nav-btn--active" : ""}`} href="/customers" prefetch={false}>
                Customers
              </Link>
              <Link className={`rp-nav-btn ${pathname?.startsWith("/products") ? "rp-nav-btn--active" : ""}`} href="/products" prefetch={false}>
                Products
              </Link>
              <Link className={`rp-nav-btn ${pathname?.startsWith("/reports") ? "rp-nav-btn--active" : ""}`} href="/reports" prefetch={false}>
                Reports & Statements
              </Link>
            </nav>

            <div className="rp-side-footer">
              <div className="rp-role">
                <span>Module</span>
                <b>REPORTS</b>
              </div>
            </div>
          </div>
        </aside>

        <main className="rp-main">
          {/* Header */}
          <header className="rp-top rp-top--saas rp-card-anim" style={{ animationDelay: "60ms" }}>
            {/* left */}
            <div className="rp-top-left--actions">
              <Link className="rp-ui-btn rp-ui-btn--soft rp-glow" href="/" prefetch={false}>
                ● Dashboard
              </Link>
              <span className="rp-top-pill">Reports</span>
            </div>

            {/* center */}
            <div className="rp-top-center--stacked">
              <div className="rp-top-logo rp-top-logo--xl">
                <img src="/images/logo/logo.png" alt="Ram Pottery" width={44} height={44} />
              </div>

              <div className="rp-top-center-text">
                <div className="rp-top-title">Reports & Statements</div>
                <div className="rp-top-subtitle">Period totals • exports • credit notes (VOID excluded)</div>
              </div>

              <div className="rp-breadcrumb">
                <span>Dashboard</span> → <b>Reports</b>
              </div>
            </div>

            {/* right */}
            <div className="rp-top-right--sync">
              <div className="rp-sync">
                <div className="rp-sync-label">Last sync :</div>
                <div className="rp-sync-time">{lastSync || "—"}</div>
              </div>
            </div>
          </header>

          {/* Date Range Card */}
          <section className="rp-panel rp-card-anim" style={{ animationDelay: "120ms" }}>
            <div className="rp-panel-head">
              <div>
                <div className="rp-panel-title">Date Range</div>
                <div className="rp-panel-sub">Adjust period and refresh</div>
              </div>
              <div className="rp-panel-badge">{loading ? "Syncing…" : "Ready"}</div>
            </div>

            <div className="rp-panel-body">
              <div className="rp-report-range">
                <label className="rp-field">
                  <span className="rp-label">From</span>
                  <input className="rp-input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </label>

                <label className="rp-field">
                  <span className="rp-label">To</span>
                  <input className="rp-input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </label>

                <button className="rp-ui-btn rp-ui-btn--danger rp-glow" type="button" onClick={load} disabled={loading}>
                  {loading ? "Loading…" : "Refresh"}
                </button>

                <div className="rp-report-note">
                  Showing <b>{totals.invCount}</b> invoices • <b>{totals.cnCount}</b> credit notes
                </div>
              </div>

              {err ? <div className="rp-error-line" style={{ marginTop: 10 }}>{err}</div> : null}
            </div>
          </section>

          {/* KPI Bar (red premium like dashboard) */}
          <section className="rp-stats rp-stats--reports rp-card-anim" style={{ animationDelay: "160ms" }}>
            <div className="rp-stat">
              <div className="rp-stat-k">Invoice Total</div>
              <div className="rp-stat-v">{formatRs(totals.invTotal)}</div>
              <div className="rp-stat-s">Sum of totals</div>
            </div>

            <div className="rp-stat">
              <div className="rp-stat-k">Paid</div>
              <div className="rp-stat-v">{formatRs(totals.invPaid)}</div>
              <div className="rp-stat-s">Collected</div>
            </div>

            <div className="rp-stat">
              <div className="rp-stat-k">Outstanding</div>
              <div className="rp-stat-v">{formatRs(totals.invDue)}</div>
              <div className="rp-stat-s">Balance remaining</div>
            </div>

            <div className="rp-stat">
              <div className="rp-stat-k">Credit Notes</div>
              <div className="rp-stat-v">{formatRs(totals.cnTotal)}</div>
              <div className="rp-stat-s">VOID excluded</div>
            </div>

            <div className="rp-stat rp-stat--dark">
              <div className="rp-stat-k">VOID Notes</div>
              <div className="rp-stat-v">{totals.voidCount}</div>
              <div className="rp-stat-s">Excluded • {formatRs(totals.voidTotal)}</div>
            </div>
          </section>

          {/* Exports */}
          <section className="rp-panel rp-card-anim" style={{ animationDelay: "210ms" }}>
            <div className="rp-panel-head">
              <div>
                <div className="rp-panel-title">Exports</div>
                <div className="rp-panel-sub">Download CSV for accounting / audits</div>
              </div>
              <div className="rp-panel-badge">CSV</div>
            </div>

            <div className="rp-panel-body">
              <div className="rp-report-actions">
                <button className="rp-ui-btn rp-ui-btn--soft rp-glow" type="button" onClick={exportInvoicesCsv}>
                  ⬇ Export Invoices CSV
                </button>
                <button className="rp-ui-btn rp-ui-btn--soft rp-glow" type="button" onClick={exportCreditNotesCsv}>
                  ⬇ Export Credit Notes CSV
                </button>
              </div>

              <div className="rp-muted" style={{ marginTop: 10 }}>
                Tip: Credit notes marked <b>VOID</b> are excluded from totals but tracked in KPI.
              </div>
            </div>
          </section>

          <footer className="rp-footer rp-card-anim" style={{ animationDelay: "300ms" }}>
            © 2026 Ram Pottery Ltd • Built by <span>MoBiz.mu</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
