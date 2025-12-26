// app/reports/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Customer = { id: number; name: string };

type VatInvoiceRow = {
  id: number;
  invoice_number: string;
  invoice_date: string;
  customer_id: number;
  sales_rep: string;
  customer_name: string | null;
  subtotal: number;
  vat_amount: number;
  total_amount: number;
  status: string | null;
};

type VatReport = {
  period: { from: string; toExclusive: string };
  totals: { subtotal: number; vat: number; total: number; invoiceCount: number };
  invoices: VatInvoiceRow[];
};

type SalesInvoiceRow = {
  id: number;
  invoice_number: string;
  invoice_date: string;
  customer_id: number;
  customer_name: string | null;
  subtotal: number;
  total_amount: number;
  sales_rep: string;
  status: string | null;
};

type SalesReport = {
  period: { from: string; toExclusive: string };
  totals: {
    invoiceCountAll: number;
    subtotalExclVatAll: number;
    totalSalesAll: number;

    invoiceCountPaid: number;
    subtotalExclVatPaid: number;
    totalSalesPaid: number;
  };
  invoicesAll: SalesInvoiceRow[];
  invoicesPaid: SalesInvoiceRow[];
};

function monthNow(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function csvEscape(v: any) {
  const s = String(v ?? "");
  if (/[,"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function ymd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function ReportsPage() {
  const router = useRouter();

  const [month, setMonth] = useState<string>(monthNow());
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filterCustomerId, setFilterCustomerId] = useState<string>("");
  const [filterSalesRep, setFilterSalesRep] = useState<string>("");

  const [commissionPercent, setCommissionPercent] = useState<string>("");

  const [commissionMode, setCommissionMode] = useState<"PAID_ONLY" | "ALL">(
    "PAID_ONLY"
  );

  const [vat, setVat] = useState<VatReport | null>(null);
  const [sales, setSales] = useState<SalesReport | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Mobile drawer
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

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("customers")
        .select("id, name")
        .order("name");
      setCustomers((data ?? []) as Customer[]);
    })();
  }, []);

  const salesReps = useMemo(() => {
    const reps = new Set<string>();
    (sales?.invoicesAll || []).forEach((r) => {
      if (r.sales_rep) reps.add(r.sales_rep);
    });
    return Array.from(reps).sort((a, b) => a.localeCompare(b));
  }, [sales]);

  function buildQuery(selectedMonth: string) {
    const parts: string[] = [];

    if (fromDate && toDate) {
      parts.push(`from=${encodeURIComponent(fromDate)}`);
      parts.push(`to=${encodeURIComponent(toDate)}`);
    } else {
      parts.push(`month=${encodeURIComponent(selectedMonth)}`);
    }

    if (filterCustomerId)
      parts.push(`customerId=${encodeURIComponent(filterCustomerId)}`);
    if (filterSalesRep)
      parts.push(`salesRep=${encodeURIComponent(filterSalesRep)}`);

    return parts.join("&");
  }

  async function loadReports(selectedMonth: string) {
    setLoading(true);
    setError(null);

    try {
      const qs = buildQuery(selectedMonth);

      const [vatRes, salesRes] = await Promise.all([
        fetch(`/api/reports/vat?${qs}`),
        fetch(`/api/reports/sales?${qs}`),
      ]);

      const vatJson = await vatRes.json();
      const salesJson = await salesRes.json();

      if (!vatRes.ok || !vatJson.ok) {
        throw new Error(vatJson.error || "Failed to load VAT report");
      }
      if (!salesRes.ok || !salesJson.ok) {
        throw new Error(salesJson.error || "Failed to load Sales report");
      }

      setVat(vatJson.report);
      setSales(salesJson.report);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to load reports");
      setVat(null);
      setSales(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (fromDate || toDate) return;
    loadReports(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const commissionPct = Number(commissionPercent || 0);

  const commissionBase =
    commissionMode === "ALL"
      ? sales?.totals?.subtotalExclVatAll ?? 0
      : sales?.totals?.subtotalExclVatPaid ?? 0;

  const commissionInvoiceCount =
    commissionMode === "ALL"
      ? sales?.totals?.invoiceCountAll ?? 0
      : sales?.totals?.invoiceCountPaid ?? 0;

  const commissionAmount =
    commissionPct > 0 ? +(commissionBase * (commissionPct / 100)).toFixed(2) : 0;

  const commissionInvoices =
    commissionMode === "ALL"
      ? sales?.invoicesAll ?? []
      : sales?.invoicesPaid ?? [];

  function periodLabel() {
    return fromDate && toDate ? `${fromDate}_to_${toDate}` : month;
  }

  function customerNameFromFilter() {
    if (!filterCustomerId) return "";
    return customers.find((c) => String(c.id) === filterCustomerId)?.name || "";
  }

  function downloadCsv(
    filenameBase: string,
    summaryLines: any[][],
    header: string[],
    rows: any[][]
  ) {
    const filename = `${filenameBase}__${periodLabel()}.csv`
      .replace(/[\/\\:*?"<>|]/g, "-")
      .slice(0, 180);

    const csv =
      summaryLines.map((line) => line.map(csvEscape).join(",")).join("\n") +
      "\n" +
      header.map(csvEscape).join(",") +
      "\n" +
      rows.map((r) => r.map(csvEscape).join(",")).join("\n") +
      "\n";

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

  // ✅ Export 1: Commission invoices (whatever is shown)
  function exportCommissionCsv() {
    if (!sales) return;

    const customerName = customerNameFromFilter();

    const summaryLines = [
      ["Report", "Commission Invoices"],
      ["Generated", ymd(new Date())],
      [
        "Mode",
        commissionMode === "ALL"
          ? "PAID + UNPAID (Projection)"
          : "PAID only",
      ],
      [
        "Period",
        fromDate && toDate ? `${fromDate} to ${toDate} (to exclusive)` : month,
      ],
      ["Customer Filter", customerName || "All customers"],
      ["Sales Rep Filter", filterSalesRep || "All reps"],
      ["Commission %", commissionPercent || "0"],
      ["Commission Base (Subtotal excl VAT)", commissionBase.toFixed(2)],
      ["Commission Amount", commissionAmount.toFixed(2)],
      [],
    ];

    const header = [
      "Invoice No",
      "Invoice Date",
      "Customer",
      "Sales Rep",
      "Subtotal (Excl VAT)",
      "Total (Incl VAT)",
      "Status",
    ];

    const rows = commissionInvoices.map((r) => [
      r.invoice_number,
      r.invoice_date,
      r.customer_name || "",
      r.sales_rep || "",
      Number(r.subtotal || 0).toFixed(2),
      Number(r.total_amount || 0).toFixed(2),
      String(r.status || "UNPAID").toUpperCase(),
    ]);

    const fname =
      commissionMode === "ALL"
        ? "commission_invoices__projection_all"
        : "commission_invoices__paid_only";

    downloadCsv(fname, summaryLines, header, rows);
  }

  // ✅ Export 2: VAT table
  function exportVatCsv() {
    if (!vat) return;

    const customerName = customerNameFromFilter();

    const summaryLines = [
      ["Report", "VAT Invoices"],
      ["Generated", ymd(new Date())],
      ["Period", `${vat.period.from} to ${vat.period.toExclusive} (to exclusive)`],
      ["Customer Filter", customerName || "All customers"],
      ["Sales Rep Filter", filterSalesRep || "All reps"],
      ["Invoice Count", String(vat.totals.invoiceCount)],
      ["Subtotal Total", vat.totals.subtotal.toFixed(2)],
      ["VAT Total", vat.totals.vat.toFixed(2)],
      ["Grand Total", vat.totals.total.toFixed(2)],
      [],
    ];

    const header = [
      "Invoice No",
      "Invoice Date",
      "Customer",
      "Sales Rep",
      "Subtotal (Excl VAT)",
      "VAT",
      "Total (Incl VAT)",
      "Status",
    ];

    const rows = (vat.invoices || []).map((r) => [
      r.invoice_number,
      r.invoice_date,
      r.customer_name || "",
      r.sales_rep || "",
      Number(r.subtotal || 0).toFixed(2),
      Number(r.vat_amount || 0).toFixed(2),
      Number(r.total_amount || 0).toFixed(2),
      String(r.status || "UNPAID").toUpperCase(),
    ]);

    downloadCsv("vat_invoices", summaryLines, header, rows);
  }

  // ✅ Export 3A: Sales invoices ALL
  function exportSalesAllCsv() {
    if (!sales) return;

    const customerName = customerNameFromFilter();

    const summaryLines = [
      ["Report", "Sales Invoices (ALL)"],
      ["Generated", ymd(new Date())],
      ["Period", `${sales.period.from} to ${sales.period.toExclusive} (to exclusive)`],
      ["Customer Filter", customerName || "All customers"],
      ["Sales Rep Filter", filterSalesRep || "All reps"],
      ["Invoice Count (ALL)", String(sales.totals.invoiceCountAll)],
      ["Subtotal excl VAT (ALL)", Number(sales.totals.subtotalExclVatAll || 0).toFixed(2)],
      ["Total incl VAT (ALL)", Number(sales.totals.totalSalesAll || 0).toFixed(2)],
      [],
    ];

    const header = [
      "Invoice No",
      "Invoice Date",
      "Customer",
      "Sales Rep",
      "Subtotal (Excl VAT)",
      "Total (Incl VAT)",
      "Status",
    ];

    const rows = (sales.invoicesAll || []).map((r) => [
      r.invoice_number,
      r.invoice_date,
      r.customer_name || "",
      r.sales_rep || "",
      Number(r.subtotal || 0).toFixed(2),
      Number(r.total_amount || 0).toFixed(2),
      String(r.status || "UNPAID").toUpperCase(),
    ]);

    downloadCsv("sales_invoices__all", summaryLines, header, rows);
  }

  // ✅ Export 3B: Sales invoices PAID only
  function exportSalesPaidCsv() {
    if (!sales) return;

    const customerName = customerNameFromFilter();

    const summaryLines = [
      ["Report", "Sales Invoices (PAID only)"],
      ["Generated", ymd(new Date())],
      ["Period", `${sales.period.from} to ${sales.period.toExclusive} (to exclusive)`],
      ["Customer Filter", customerName || "All customers"],
      ["Sales Rep Filter", filterSalesRep || "All reps"],
      ["Invoice Count (PAID)", String(sales.totals.invoiceCountPaid)],
      ["Subtotal excl VAT (PAID)", Number(sales.totals.subtotalExclVatPaid || 0).toFixed(2)],
      ["Total incl VAT (PAID)", Number(sales.totals.totalSalesPaid || 0).toFixed(2)],
      [],
    ];

    const header = [
      "Invoice No",
      "Invoice Date",
      "Customer",
      "Sales Rep",
      "Subtotal (Excl VAT)",
      "Total (Incl VAT)",
      "Status",
    ];

    const rows = (sales.invoicesPaid || []).map((r) => [
      r.invoice_number,
      r.invoice_date,
      r.customer_name || "",
      r.sales_rep || "",
      Number(r.subtotal || 0).toFixed(2),
      Number(r.total_amount || 0).toFixed(2),
      String(r.status || "UNPAID").toUpperCase(),
    ]);

    downloadCsv("sales_invoices__paid_only", summaryLines, header, rows);
  }

  function formatDateGB(dateStr: string) {
    // invoices sometimes are "YYYY-MM-DD" which is safe to display raw; still format if possible
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("en-GB");
  }

  const SideContent = (
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
        <Link className="rp-nav-btn" href="/" onClick={() => setMobileNavOpen(false)}>
          Dashboard
        </Link>
        <Link className="rp-nav-btn" href="/invoices" onClick={() => setMobileNavOpen(false)}>
          Invoices
        </Link>
        <Link className="rp-nav-btn" href="/credit-notes" onClick={() => setMobileNavOpen(false)}>
          Credit Notes
        </Link>
        <Link className="rp-nav-btn" href="/products" onClick={() => setMobileNavOpen(false)}>
          Stock & Categories
        </Link>
        <Link className="rp-nav-btn" href="/stock-movements" onClick={() => setMobileNavOpen(false)}>
          Stock Movements
        </Link>
        <Link className="rp-nav-btn" href="/customers" onClick={() => setMobileNavOpen(false)}>
          Customers
        </Link>
        <Link className="rp-nav-btn" href="/suppliers" onClick={() => setMobileNavOpen(false)}>
          Suppliers
        </Link>
        <Link
          className="rp-nav-btn rp-nav-btn--active"
          href="/reports"
          onClick={() => setMobileNavOpen(false)}
        >
          Reports & Statements
        </Link>
        <Link className="rp-nav-btn" href="/admin/users" onClick={() => setMobileNavOpen(false)}>
          Users & Permissions
        </Link>
      </nav>

      <div className="rp-side-footer">
        <div className="rp-role">
          <span>Module</span>
          <b>Reports</b>
        </div>
      </div>
    </div>
  );

  return (
    <div className="rp-app">
      {/* Luxury animated background */}
      <div className="rp-bg" aria-hidden="true">
        <span className="rp-bg-orb rp-bg-orb--1" />
        <span className="rp-bg-orb rp-bg-orb--2" />
        <span className="rp-bg-orb rp-bg-orb--3" />
        <span className="rp-bg-grid" />
      </div>

      {/* Mobile top bar */}
      <div className="rp-mtop">
        <button
          className="rp-icon-btn"
          type="button"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
        >
          <span className="rp-burger" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </button>

        <div className="rp-mtop-brand">
          <div className="rp-mtop-title">Reports</div>
          <div className="rp-mtop-sub">VAT • Sales • Commission</div>
        </div>

        <button className="rp-icon-btn" type="button" onClick={() => window.print()} aria-label="Print">
          🖨
        </button>
      </div>

      {/* Mobile overlay + drawer */}
      <div className={`rp-overlay ${mobileNavOpen ? "is-open" : ""}`} onClick={() => setMobileNavOpen(false)} />
      <div className={`rp-drawer ${mobileNavOpen ? "is-open" : ""}`} role="dialog" aria-modal="true">
        <div className="rp-drawer-head">
          <div className="rp-drawer-brand">
            <div className="rp-drawer-logo">
              <Image src="/images/logo/logo.png" alt="Ram Pottery" width={34} height={34} />
            </div>
            <div>
              <div className="rp-drawer-title">Ram Pottery Ltd</div>
              <div className="rp-drawer-sub">Secure • Cloud</div>
            </div>
          </div>

          <button className="rp-icon-btn" type="button" onClick={() => setMobileNavOpen(false)} aria-label="Close">
            ✕
          </button>
        </div>

        {SideContent}
      </div>

      <div className="rp-shell rp-enter">
        {/* Desktop sidebar */}
        <aside className="rp-side">{SideContent}</aside>

        {/* Main */}
        <main className="rp-main">
          {/* Header */}
          <div className="rp-top rp-card-anim" style={{ animationDelay: "40ms" }}>
            <div className="rp-title">
              <div className="rp-eyebrow">
                <span className="rp-tag">Secure • Cloud</span>
                <span className="rp-tag">VAT 15%</span>
                <span className="rp-tag">Export CSV</span>
              </div>
              <h1>Reports</h1>
              <p>Export: Commission CSV + VAT CSV + Sales CSV (All vs Paid).</p>
            </div>

            <div className="rp-top-right">
              <div className="rp-seg" style={{ gap: 10 }}>
                <button
                  className="rp-seg-item rp-seg-item--primary"
                  type="button"
                  onClick={() => router.push("/invoices/new")}
                >
                  + New Invoice
                </button>

                <button className="rp-seg-item" type="button" onClick={() => window.print()}>
                  🖨 Print
                </button>

                <button
                  className="rp-theme-btn"
                  type="button"
                  onClick={() => loadReports(month)}
                  disabled={loading}
                  style={{ minWidth: 118 }}
                >
                  {loading ? "Loading…" : "Refresh"}
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <section className="rp-card rp-glass rp-card-anim" style={{ animationDelay: "90ms" }}>
            <div className="rp-card-head">
              <div>
                <div className="rp-card-title">Filters</div>
                <div className="rp-card-sub">
                  Tip: after changing filters/range, click <b>Refresh</b>.
                </div>
              </div>
              <span className="rp-soft-pill">
                Period: <b>{fromDate && toDate ? `${fromDate} → ${toDate}` : month}</b>
              </span>
            </div>

            <div className="rp-card-body">
              <div className="rp-form-grid">
                <div>
                  <div className="rp-label">Select month (quick)</div>
                  <input
                    type="month"
                    className="rp-input"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    disabled={!!(fromDate || toDate)}
                  />
                </div>

                <div>
                  <div className="rp-label">From (YYYY-MM-DD)</div>
                  <input
                    type="date"
                    className="rp-input"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>

                <div>
                  <div className="rp-label">To (exclusive end)</div>
                  <input
                    type="date"
                    className="rp-input"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>

                <div>
                  <div className="rp-label">Customer</div>
                  <select
                    className="rp-input"
                    value={filterCustomerId}
                    onChange={(e) => setFilterCustomerId(e.target.value)}
                  >
                    <option value="">All customers</option>
                    {customers.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="rp-label">Sales Representative</div>
                  <select
                    className="rp-input"
                    value={filterSalesRep}
                    onChange={(e) => setFilterSalesRep(e.target.value)}
                  >
                    <option value="">All reps</option>
                    {salesReps.map((rep) => (
                      <option key={rep} value={rep}>
                        {rep}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "end", flexWrap: "wrap" }}>
                  <button
                    className="rp-link-btn"
                    type="button"
                    onClick={() => loadReports(month)}
                    disabled={loading}
                  >
                    {loading ? "Loading…" : "Refresh"}
                  </button>

                  <button
                    className="rp-link-btn"
                    type="button"
                    onClick={() => {
                      setFromDate("");
                      setToDate("");
                      loadReports(month);
                    }}
                    disabled={loading}
                  >
                    Clear Range
                  </button>

                  <button
                    className="rp-link-btn"
                    type="button"
                    onClick={() => {
                      setFilterCustomerId("");
                      setFilterSalesRep("");
                    }}
                    disabled={loading}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {error ? (
                <div
                  className="rp-alert rp-alert--danger"
                  style={{ marginTop: 12 }}
                >
                  {error}
                </div>
              ) : null}
            </div>
          </section>

          {/* Commission + Export */}
          <section className="rp-card rp-glass rp-card-anim" style={{ animationDelay: "130ms" }}>
            <div className="rp-card-head">
              <div>
                <div className="rp-card-title">Commission Calculator</div>
                <div className="rp-card-sub">Base = Subtotal excl VAT</div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="rp-link-btn" type="button" onClick={exportSalesAllCsv} disabled={!sales || loading}>
                  ⬇ Export Sales CSV (ALL)
                </button>
                <button className="rp-link-btn" type="button" onClick={exportSalesPaidCsv} disabled={!sales || loading}>
                  ⬇ Export Sales CSV (PAID)
                </button>
                <button className="rp-seg-item rp-seg-item--primary" type="button" onClick={exportCommissionCsv} disabled={!sales || loading}>
                  ⬇ Export Commission CSV
                </button>
              </div>
            </div>

            <div className="rp-card-body">
              <div className="rp-form-grid">
                <div>
                  <div className="rp-label">Commission Mode</div>
                  <select
                    className="rp-input"
                    value={commissionMode}
                    onChange={(e) => setCommissionMode(e.target.value as any)}
                  >
                    <option value="PAID_ONLY">PAID invoices only</option>
                    <option value="ALL">PAID + UNPAID (Projection)</option>
                  </select>
                </div>

                <div>
                  <div className="rp-label">Commission %</div>
                  <input
                    className="rp-input"
                    inputMode="decimal"
                    placeholder="e.g. 5"
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(e.target.value)}
                  />
                </div>

                <div>
                  <div className="rp-label">Base</div>
                  <input
                    className="rp-input"
                    value={`Rs ${commissionBase.toFixed(2)}  •  ${commissionInvoiceCount} invoices`}
                    readOnly
                  />
                </div>

                <div>
                  <div className="rp-label">Commission Amount</div>
                  <input className="rp-input" value={`Rs ${commissionAmount.toFixed(2)}`} readOnly />
                </div>
              </div>
            </div>
          </section>

          {/* Tables */}
          <section className="rp-grid rp-card-anim" style={{ animationDelay: "170ms" }}>
            {/* Commission invoices */}
            <div className="rp-card rp-glass">
              <div className="rp-card-head rp-card-head--tight">
                <div>
                  <div className="rp-card-title">
                    Commission Invoices{" "}
                    <span className="rp-muted" style={{ fontSize: 12, fontWeight: 900 }}>
                      ({commissionMode === "ALL" ? "PAID + UNPAID" : "PAID only"})
                    </span>
                  </div>
                  <div className="rp-card-sub">Click a row to open invoice</div>
                </div>
              </div>

              <div className="rp-table-wrap">
                <table className="rp-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Sales Rep</th>
                      <th style={{ textAlign: "right" }}>Subtotal (Excl VAT)</th>
                      <th style={{ textAlign: "right" }}>Total (Incl VAT)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(commissionInvoices || []).map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => router.push(`/invoices/${r.id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <td className="rp-strong">{r.invoice_number}</td>
                        <td>{formatDateGB(r.invoice_date)}</td>
                        <td>{r.customer_name || "-"}</td>
                        <td>{r.sales_rep || "—"}</td>
                        <td style={{ textAlign: "right" }}>{Number(r.subtotal || 0).toFixed(2)}</td>
                        <td style={{ textAlign: "right" }}>{Number(r.total_amount || 0).toFixed(2)}</td>
                        <td>{String(r.status || "UNPAID").toUpperCase()}</td>
                      </tr>
                    ))}

                    {!loading && sales && commissionInvoices.length === 0 && (
                      <tr>
                        <td colSpan={7} className="rp-td-empty">
                          No invoices found for this selection.
                        </td>
                      </tr>
                    )}

                    {loading && (
                      <tr>
                        <td colSpan={7} className="rp-td-empty">
                          Loading…
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* VAT table */}
            <div className="rp-card rp-glass">
              <div className="rp-card-head rp-card-head--tight">
                <div>
                  <div className="rp-card-title">VAT Report (Invoices)</div>
                  <div className="rp-card-sub">
                    Totals: Subtotal <b>{(vat?.totals?.subtotal ?? 0).toFixed(2)}</b> • VAT{" "}
                    <b>{(vat?.totals?.vat ?? 0).toFixed(2)}</b> • Total{" "}
                    <b>{(vat?.totals?.total ?? 0).toFixed(2)}</b>
                  </div>
                </div>

                <button className="rp-link-btn" type="button" onClick={exportVatCsv} disabled={!vat || loading}>
                  ⬇ Export VAT CSV
                </button>
              </div>

              <div className="rp-table-wrap">
                <table className="rp-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Sales Rep</th>
                      <th style={{ textAlign: "right" }}>Subtotal</th>
                      <th style={{ textAlign: "right" }}>VAT</th>
                      <th style={{ textAlign: "right" }}>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(vat?.invoices || []).map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => router.push(`/invoices/${r.id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <td className="rp-strong">{r.invoice_number}</td>
                        <td>{formatDateGB(r.invoice_date)}</td>
                        <td>{r.customer_name || "-"}</td>
                        <td>{r.sales_rep || "—"}</td>
                        <td style={{ textAlign: "right" }}>{Number(r.subtotal || 0).toFixed(2)}</td>
                        <td style={{ textAlign: "right" }}>{Number(r.vat_amount || 0).toFixed(2)}</td>
                        <td style={{ textAlign: "right" }}>{Number(r.total_amount || 0).toFixed(2)}</td>
                        <td>{String(r.status || "UNPAID").toUpperCase()}</td>
                      </tr>
                    ))}

                    {!loading && vat && (vat.invoices || []).length === 0 && (
                      <tr>
                        <td colSpan={8} className="rp-td-empty">
                          No invoices found for this selection.
                        </td>
                      </tr>
                    )}

                    {loading && (
                      <tr>
                        <td colSpan={8} className="rp-td-empty">
                          Loading…
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <footer className="rp-footer rp-card-anim" style={{ animationDelay: "220ms" }}>
            © {new Date().getFullYear()} Ram Pottery Ltd • Built by <span>MoBiz.mu</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
