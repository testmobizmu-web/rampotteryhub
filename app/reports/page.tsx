// app/reports/page.tsx
"use client";

import Image from "next/image";
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

  function downloadCsv(filenameBase: string, summaryLines: any[][], header: string[], rows: any[][]) {
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
      ["Mode", commissionMode === "ALL" ? "PAID + UNPAID (Projection)" : "PAID only"],
      ["Period", fromDate && toDate ? `${fromDate} to ${toDate} (to exclusive)` : month],
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

  return (
    <div className="rp-app">
      <aside className="rp-sidebar">
        <div className="rp-sidebar-logo">
          <Image src="/images/logo/logo.png" alt="Ram Pottery Logo" width={34} height={34} />
          <div>
            <div className="rp-sidebar-logo-title">Ram Pottery Ltd</div>
            <div className="rp-sidebar-logo-sub">Online Accounting &amp; Stock Manager</div>
          </div>
        </div>

        <div className="rp-sidebar-nav">
          <div className="rp-nav-section-title">Overview</div>
          <button className="rp-nav-item" onClick={() => router.push("/")}>
            <span>Dashboard</span>
          </button>

          <div className="rp-nav-section-title">Sales</div>
          <button className="rp-nav-item" onClick={() => router.push("/invoices")}>
            <span>Invoices</span>
          </button>

          <div className="rp-nav-section-title">Reports</div>
          <button className="rp-nav-item rp-nav-item-active" onClick={() => router.push("/reports")}>
            <span>Reports &amp; Statements</span>
          </button>
        </div>

        <div className="rp-sidebar-footer">Reports module • VAT + Sales • rampottery.mu</div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-inner">
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">Reports</h1>
              <p className="dashboard-subtitle">
                Export: Commission CSV + VAT CSV + Sales CSV (All vs Paid).
              </p>
            </div>

            <div className="dashboard-header-right">
              <div className="dashboard-quick-buttons">
                <button className="primary" onClick={() => router.push("/invoices/new")}>
                  + New Invoice
                </button>
                <button onClick={() => window.print()}>🖨 Print</button>
              </div>
              <div className="rp-user-badge">R</div>
            </div>
          </div>

          {/* Filters */}
          <div className="card" style={{ marginTop: 14 }}>
            <div className="form-row">
              <div>
                <label className="form-label">Select month (quick)</label>
                <input
                  type="month"
                  className="form-input"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  disabled={!!(fromDate || toDate)}
                />
              </div>

              <div style={{ display: "flex", alignItems: "end", gap: 8 }}>
                <button className="btn btn-primary" onClick={() => loadReports(month)} disabled={loading}>
                  {loading ? "Loading…" : "Refresh"}
                </button>
                <button className="btn btn-ghost" onClick={() => router.push("/")}>
                  ← Back
                </button>
              </div>
            </div>

            <div className="form-row" style={{ marginTop: 10 }}>
              <div>
                <label className="form-label">From (YYYY-MM-DD)</label>
                <input type="date" className="form-input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>

              <div>
                <label className="form-label">To (exclusive end)</label>
                <input type="date" className="form-input" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>

              <div style={{ display: "flex", alignItems: "end", gap: 8 }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setFromDate("");
                    setToDate("");
                    loadReports(month);
                  }}
                  disabled={loading}
                >
                  Clear Range
                </button>
              </div>
            </div>

            <div className="form-row" style={{ marginTop: 10 }}>
              <div>
                <label className="form-label">Customer</label>
                <select className="form-input" value={filterCustomerId} onChange={(e) => setFilterCustomerId(e.target.value)}>
                  <option value="">All customers</option>
                  {customers.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Sales Representative</label>
                <select className="form-input" value={filterSalesRep} onChange={(e) => setFilterSalesRep(e.target.value)}>
                  <option value="">All reps</option>
                  {salesReps.map((rep) => (
                    <option key={rep} value={rep}>
                      {rep}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "end", gap: 8 }}>
                <button
                  className="btn btn-ghost"
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

            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 10 }}>
              Tip: after changing filters, click <strong>Refresh</strong>.
            </div>
          </div>

          {error && (
            <p style={{ color: "#b91c1c", marginTop: 10, fontSize: 13 }}>
              {error}
            </p>
          )}

          {/* Commission + Export buttons */}
          <div className="card" style={{ marginTop: 14 }}>
            <div
              className="panel-title"
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}
            >
              <span>Commission Calculator (Subtotal excl VAT)</span>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btn btn-ghost" onClick={exportSalesAllCsv} disabled={!sales || loading}>
                  ⬇ Export Sales CSV (ALL)
                </button>
                <button className="btn btn-ghost" onClick={exportSalesPaidCsv} disabled={!sales || loading}>
                  ⬇ Export Sales CSV (PAID)
                </button>
                <button className="btn btn-primary" onClick={exportCommissionCsv} disabled={!sales || loading}>
                  ⬇ Export Commission CSV
                </button>
              </div>
            </div>

            <div className="form-row" style={{ marginTop: 10 }}>
              <div>
                <label className="form-label">Commission Mode</label>
                <select className="form-input" value={commissionMode} onChange={(e) => setCommissionMode(e.target.value as any)}>
                  <option value="PAID_ONLY">PAID invoices only</option>
                  <option value="ALL">PAID + UNPAID (Projection)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Commission %</label>
                <input
                  className="form-input"
                  inputMode="decimal"
                  placeholder="e.g. 5"
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">
                  Base ({commissionMode === "ALL" ? "All invoices" : "Paid invoices"})
                </label>
                <input className="form-input" value={`Rs ${commissionBase.toFixed(2)}  •  ${commissionInvoiceCount} invoices`} readOnly />
              </div>

              <div>
                <label className="form-label">Commission Amount</label>
                <input className="form-input" value={`Rs ${commissionAmount.toFixed(2)}`} readOnly />
              </div>
            </div>

            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
              Export buttons use the same filters/period you loaded in this page.
            </div>
          </div>

          {/* Tables */}
          <section className="tables-grid" style={{ marginTop: 14 }}>
            {/* Commission Table */}
            <div className="table-card">
              <div className="table-title">
                Commission Invoices ({commissionMode === "ALL" ? "PAID + UNPAID" : "PAID only"})
              </div>
              <table>
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
                  {commissionInvoices.map((r) => (
                    <tr key={r.id} onClick={() => router.push(`/invoices/${r.id}`)} style={{ cursor: "pointer" }}>
                      <td>{r.invoice_number}</td>
                      <td>{new Date(r.invoice_date).toLocaleDateString("en-GB")}</td>
                      <td>{r.customer_name || "-"}</td>
                      <td>{r.sales_rep || "—"}</td>
                      <td style={{ textAlign: "right" }}>{Number(r.subtotal || 0).toFixed(2)}</td>
                      <td style={{ textAlign: "right" }}>{Number(r.total_amount || 0).toFixed(2)}</td>
                      <td>{String(r.status || "UNPAID").toUpperCase()}</td>
                    </tr>
                  ))}
                  {!loading && sales && commissionInvoices.length === 0 && (
                    <tr>
                      <td colSpan={7}>No invoices found for this selection.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* VAT Table + Export */}
            <div className="table-card">
              <div
                className="table-title"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}
              >
                <span>VAT Report (Invoices)</span>
                <button className="btn btn-ghost" onClick={exportVatCsv} disabled={!vat || loading}>
                  ⬇ Export VAT CSV
                </button>
              </div>

              <table>
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
                    <tr key={r.id} onClick={() => router.push(`/invoices/${r.id}`)} style={{ cursor: "pointer" }}>
                      <td>{r.invoice_number}</td>
                      <td>{new Date(r.invoice_date).toLocaleDateString("en-GB")}</td>
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
                      <td colSpan={8}>No invoices found for this selection.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <footer style={{ marginTop: 16, fontSize: 11, color: "#6b7280", textAlign: "center" }}>
            © {new Date().getFullYear()} Ram Pottery Ltd • Reports module
          </footer>
        </div>
      </main>
    </div>
  );
}



