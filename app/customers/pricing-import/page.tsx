"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type ImportRow = {
  rowNo: number;
  customer_code: string;
  item_code: string;
  price_excl_vat: number;
  error?: string;
};

function num(v: unknown): number {
  const n = Number(String(v ?? "").replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}
function safeUpper(v: unknown) {
  return String(v ?? "").trim().toUpperCase();
}
function money(v: unknown) {
  return num(v).toFixed(2);
}

/** Small CSV parser (supports quotes, commas, CRLF) */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      continue;
    }

    if (c === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (c === "\n") {
      row.push(field);
      field = "";
      row = row.map((x) => (x.endsWith("\r") ? x.slice(0, -1) : x));
      const isEmpty = row.every((x) => !String(x ?? "").trim());
      if (!isEmpty) rows.push(row);
      row = [];
      continue;
    }

    field += c;
  }

  row.push(field);
  row = row.map((x) => (x.endsWith("\r") ? x.slice(0, -1) : x));
  const isEmpty = row.every((x) => !String(x ?? "").trim());
  if (!isEmpty) rows.push(row);

  return rows;
}

function normalizeHeader(h: string) {
  return String(h ?? "").trim().toLowerCase().replace(/\s+/g, "_");
}

export default function PricingImportManyPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  const [rows, setRows] = useState<ImportRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("rp_user");
    if (!raw) {
      router.replace("/login");
      return;
    }
    try {
      const user = JSON.parse(raw);
      const ok = String(user?.role || "").toLowerCase() === "admin" || Boolean(user?.permissions?.canEditStock);
      if (!ok) {
        alert("Access denied. Admin/Stock permission required.");
        router.replace("/customers");
      }
    } catch {
      router.replace("/login");
    }
  }, [router]);

  const summary = useMemo(() => {
    const total = rows.length;
    const ok = rows.filter((r) => !r.error).length;
    const bad = total - ok;
    return { total, ok, bad };
  }, [rows]);

  const filteredPreview = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => `${r.customer_code} ${r.item_code} ${r.price_excl_vat}`.toLowerCase().includes(s));
  }, [rows, q]);

  function downloadSample() {
    const csv = [
      "customer_code,item_code,price_excl_vat",
      "CUST-001,ITEM-001,120.00",
      "CUST-001,ITEM-002,85.50",
      "CUST-002,ITEM-001,118.00",
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pricing_bulk_many_customers_template.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function openImport() {
    setErr(null);
    setRows([]);
    setImportOpen(true);
    setTimeout(() => fileRef.current?.click(), 150);
  }

  async function handleFile(file: File) {
    setErr(null);
    setRows([]);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErr("Please upload a CSV file (.csv).");
      return;
    }

    try {
      const text = await file.text();
      const matrix = parseCsv(text);

      if (matrix.length < 2) {
        setErr("CSV is empty. Add rows with customer_code, item_code, price_excl_vat.");
        return;
      }

      const headers = matrix[0].map((h) => normalizeHeader(h));
      const idxCust = headers.findIndex((h) => h === "customer_code" || h === "customer");
      const idxItem = headers.findIndex((h) => h === "item_code" || h === "item" || h === "code");
      const idxPrice = headers.findIndex((h) => h === "price_excl_vat" || h === "price");

      if (idxCust === -1 || idxItem === -1 || idxPrice === -1) {
        setErr("CSV columns must include: customer_code, item_code, price_excl_vat");
        return;
      }

      const parsed: ImportRow[] = [];
      for (let i = 1; i < matrix.length; i++) {
        const r = matrix[i];

        const customer_code = safeUpper(r[idxCust]);
        const item_code = safeUpper(r[idxItem]);
        const price_excl_vat = num(r[idxPrice]);

        const row: ImportRow = { rowNo: i, customer_code, item_code, price_excl_vat };

        if (!customer_code) row.error = "Missing customer_code";
        else if (!item_code) row.error = "Missing item_code";
        else if (!(price_excl_vat > 0)) row.error = "Invalid price_excl_vat (must be > 0)";

        parsed.push(row);
      }

      setRows(parsed);
    } catch (e: any) {
      setErr(e?.message || "Failed to read CSV.");
    }
  }

  async function runImport() {
    setErr(null);

    const okRows = rows
      .filter((r) => !r.error)
      .map((r) => ({
        customer_code: r.customer_code,
        item_code: r.item_code,
        priceExclVat: r.price_excl_vat,
      }));

    if (okRows.length === 0) {
      setErr("No valid rows to import.");
      return;
    }

    setImporting(true);
    const raw = localStorage.getItem("rp_user") || "";

    const res = await fetch("/api/pricing/bulk-many", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-rp-user": raw },
      body: JSON.stringify({ rows: okRows }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      setImporting(false);
      setErr(json.error || "Bulk import failed.");
      return;
    }

    setImporting(false);

    alert(
      `Imported: ${json.imported}\n` +
        `Skipped: ${json.skipped}\n` +
        `Unknown customers: ${json.unknownCustomers}\n` +
        `Unknown items: ${json.unknownItems}`
    );

    setImportOpen(false);
    setRows([]);
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
          <button className="rp-nav-item" onClick={() => router.push("/")}>Dashboard</button>

          <div className="rp-nav-section-title">Sales</div>
          <button className="rp-nav-item" onClick={() => router.push("/invoices")}>Invoices</button>
          <button className="rp-nav-item" onClick={() => router.push("/credit-notes")}>Credit Notes</button>

          <div className="rp-nav-section-title">Catalog</div>
          <button className="rp-nav-item rp-nav-item-active" onClick={() => router.push("/customers")}>Customers</button>
          <button className="rp-nav-item" onClick={() => router.push("/products")}>Products</button>

          <div className="rp-nav-section-title">Reports</div>
          <button className="rp-nav-item" onClick={() => router.push("/reports")}>Reports &amp; Statements</button>
        </div>

        <div className="rp-sidebar-footer">Bulk pricing import • Many customers • rampottery.mu</div>
      </aside>

      <main className="rp-page">
        <div className="rp-container">
          <div className="rp-toolbar">
            <div>
              <h1 className="rp-h1" style={{ marginBottom: 6 }}>Bulk Pricing Import</h1>
              <p className="rp-subtitle" style={{ marginBottom: 0 }}>
                Upload one CSV for many customers: <b>customer_code + item_code + price_excl_vat</b>
              </p>
            </div>

            <div className="rp-actions">
              <button className="rp-btn-red-outline" type="button" onClick={() => router.push("/customers")}>
                ← Customers
              </button>
              <button className="rp-btn-red-outline" type="button" onClick={downloadSample}>
                ⬇ Sample CSV
              </button>
              <button className="rp-btn-red" type="button" onClick={openImport}>
                ⬆ Upload CSV
              </button>
            </div>
          </div>

          <div className="rp-card" style={{ marginTop: 14 }}>
            <div className="rp-card-head">
              <div className="rp-card-title">How it works</div>
              <div className="rp-card-tip">
                Matches <b>customer_code</b> to customers and <b>item_code</b> to products, then upserts pricing.
              </div>
            </div>

            <div style={{ padding: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <span className="rp-status rp-status-issued"><span className="rp-status-dot" />Required columns: customer_code, item_code, price_excl_vat</span>
              <span className="rp-status rp-status-approved"><span className="rp-status-dot" />Safe upsert (updates existing)</span>
              <span className="rp-status rp-status-pending"><span className="rp-status-dot" />Unknown customer/item rows skipped (reported)</span>
            </div>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          style={{ display: "none" }}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            await handleFile(file);
            e.currentTarget.value = "";
          }}
        />

        {importOpen && (
          <div className="rp-modal-backdrop" onMouseDown={() => setImportOpen(false)}>
            <div className="rp-modal" onMouseDown={(e) => e.stopPropagation()}>
              <div className="rp-modal-head">
                <div className="rp-modal-title">Bulk Import Preview (CSV)</div>
                <button className="rp-modal-x" onClick={() => setImportOpen(false)} aria-label="Close">✕</button>
              </div>

              <div className="rp-modal-body">
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                  <button className="rp-btn-red" type="button" onClick={() => fileRef.current?.click()}>
                    Choose CSV
                  </button>
                  <button className="rp-btn-red-outline" type="button" onClick={downloadSample}>
                    ⬇ Download Template
                  </button>

                  <div style={{ fontWeight: 950, color: "rgba(0,0,0,.62)", alignSelf: "center" }}>
                    Rows: <b>{summary.total}</b> • Valid: <b>{summary.ok}</b> • Errors: <b>{summary.bad}</b>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10, alignItems: "center" }}>
                  <input
                    className="rp-input-premium"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search in preview (customer_code / item_code)…"
                    style={{ width: 420 }}
                  />
                  <div style={{ fontWeight: 950, color: "rgba(0,0,0,.62)" }}>
                    Preview: <b>{Math.min(filteredPreview.length, 50)}</b> row(s)
                  </div>
                </div>

                {err && <div style={{ color: "rgba(227,6,19,0.95)", fontWeight: 950, marginBottom: 10 }}>{err}</div>}

                {rows.length > 0 && (
                  <div className="rp-table-wrap" style={{ border: "1px solid rgba(0,0,0,.08)", borderRadius: 14 }}>
                    <table className="rp-table">
                      <thead>
                        <tr>
                          <th style={{ width: 70 }}>Row</th>
                          <th style={{ width: 160 }}>Customer Code</th>
                          <th style={{ width: 160 }}>Item Code</th>
                          <th style={{ width: 160, textAlign: "right" }}>Price Excl VAT</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPreview.slice(0, 50).map((r) => (
                          <tr key={r.rowNo}>
                            <td>{r.rowNo}</td>
                            <td style={{ fontWeight: 950 }}>{r.customer_code || "—"}</td>
                            <td style={{ fontWeight: 950 }}>{r.item_code || "—"}</td>
                            <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{money(r.price_excl_vat)}</td>
                            <td>
                              {r.error ? (
                                <span className="rp-status rp-status-cancelled"><span className="rp-status-dot" />{r.error}</span>
                              ) : (
                                <span className="rp-status rp-status-approved"><span className="rp-status-dot" />Ready</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {rows.length > 50 && (
                  <div style={{ marginTop: 8, fontWeight: 950, color: "rgba(0,0,0,.6)" }}>
                    Preview limited to first 50 rows.
                  </div>
                )}
              </div>

              <div className="rp-modal-foot">
                <button className="rp-btn-red-outline" type="button" onClick={() => setImportOpen(false)} disabled={importing}>
                  Cancel
                </button>
                <button className="rp-btn-red" type="button" onClick={runImport} disabled={importing || summary.ok === 0}>
                  {importing ? "Importing…" : `Import ${summary.ok} Row(s)`}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

