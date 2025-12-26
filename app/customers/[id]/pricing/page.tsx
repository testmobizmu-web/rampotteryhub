"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Customer = {
  id: number;
  name: string | null;
  customer_code: string | null;
};

type Product = {
  id: number;
  item_code: string | null;
  name: string | null;
  price_excl_vat?: number | null;
  unit_price?: number | null;
  price?: number | null;
};

type PriceRowApi = {
  customer_id: number;
  product_id: number;
  price_excl_vat?: number | null;
  price?: number | null;
};

type ImportRow = {
  rowNo: number;
  item_code: string;
  price_excl_vat: number;
  productId?: number;
  productName?: string;
  error?: string;
};

function num(v: unknown): number {
  const n = Number(String(v ?? "").replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}
function money(v: unknown) {
  return num(v).toFixed(2);
}
function safeStr(v: unknown) {
  return String(v ?? "").trim();
}

function getDefaultProductPrice(p: Product) {
  return p.price_excl_vat ?? p.unit_price ?? p.price ?? 0;
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
        // Escaped quote
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
      // trim CR from last field if CRLF
      row = row.map((x) => (x.endsWith("\r") ? x.slice(0, -1) : x));
      // skip fully empty line
      const isEmpty = row.every((x) => !safeStr(x));
      if (!isEmpty) rows.push(row);
      row = [];
      continue;
    }

    field += c;
  }

  // last field
  row.push(field);
  row = row.map((x) => (x.endsWith("\r") ? x.slice(0, -1) : x));
  const isEmpty = row.every((x) => !safeStr(x));
  if (!isEmpty) rows.push(row);

  return rows;
}

function normalizeHeader(h: string) {
  return safeStr(h).toLowerCase().replace(/\s+/g, "_");
}

export default function CustomerPricingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const customerId = Number(params.id);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [priceMap, setPriceMap] = useState<Record<number, number>>({});
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  // Bulk import UI
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importErr, setImportErr] = useState<string | null>(null);

  // UI permission check (admin or canEditStock)
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

  async function loadPricingOverrides() {
    const raw = localStorage.getItem("rp_user") || "";
    const res = await fetch(`/api/pricing?customerId=${customerId}`, {
      method: "GET",
      headers: { "x-rp-user": raw },
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      setPriceMap({});
      return;
    }

    const rows: PriceRowApi[] = Array.isArray(json.rows) ? json.rows : [];
    const map: Record<number, number> = {};
    for (const r of rows) {
      const v = r.price_excl_vat ?? r.price ?? null;
      if (v !== null && v !== undefined) map[Number(r.product_id)] = Number(v);
    }
    setPriceMap(map);
  }

  async function loadAll() {
    setLoading(true);

    // customer
    const { data: c } = await supabase
      .from("customers")
      .select("id,name,customer_code")
      .eq("id", customerId)
      .maybeSingle();

    setCustomer((c as any) || null);

    // products
    const { data: p } = await supabase
      .from("products")
      .select("id,item_code,name,price_excl_vat,unit_price,price")
      .order("name", { ascending: true });

    setProducts((p as any) || []);

    await loadPricingOverrides();

    setLoading(false);
  }

  useEffect(() => {
    if (!customerId) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) => `${p.item_code || ""} ${p.name || ""}`.toLowerCase().includes(s));
  }, [products, q]);

  async function saveOverride(productId: number, priceExclVat: number) {
    setSavingId(productId);
    const raw = localStorage.getItem("rp_user") || "";

    const res = await fetch("/api/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-rp-user": raw },
      body: JSON.stringify({ customerId, productId, priceExclVat }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      alert(json.error || "Failed to save price");
      setSavingId(null);
      return;
    }

    setPriceMap((m) => ({ ...m, [productId]: priceExclVat }));
    setSavingId(null);
  }

  async function removeOverride(productId: number) {
    setSavingId(productId);
    const raw = localStorage.getItem("rp_user") || "";

    const res = await fetch("/api/pricing", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-rp-user": raw },
      body: JSON.stringify({ customerId, productId }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      alert(json.error || "Failed to remove price");
      setSavingId(null);
      return;
    }

    setPriceMap((m) => {
      const copy = { ...m };
      delete copy[productId];
      return copy;
    });
    setSavingId(null);
  }

  // CSV template download
  function downloadSample() {
    const lines = ["item_code,price_excl_vat", "ITEM-001,120.00", "ITEM-002,85.50"].join("\n");
    const blob = new Blob([lines], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customer_pricing_template.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function openImport() {
    setImportErr(null);
    setImportRows([]);
    setImportOpen(true);
    setTimeout(() => fileRef.current?.click(), 150);
  }

  async function handleFile(file: File) {
    setImportErr(null);
    setImportRows([]);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setImportErr("Please upload a CSV file (.csv).");
      return;
    }

    try {
      const text = await file.text();
      const matrix = parseCsv(text);

      if (matrix.length < 2) {
        setImportErr("CSV is empty. Add rows with item_code and price_excl_vat.");
        return;
      }

      const headers = matrix[0].map((h) => normalizeHeader(h));
      const idxItem = headers.findIndex((h) => h === "item_code" || h === "code" || h === "item");
      const idxPrice = headers.findIndex(
        (h) =>
          h === "price_excl_vat" ||
          h === "price" ||
          h === "unit_price" ||
          h === "price_ex_vat" ||
          h === "price_excl"
      );

      if (idxItem === -1 || idxPrice === -1) {
        setImportErr("CSV columns must include: item_code and price_excl_vat");
        return;
      }

      const byCode = new Map<string, Product>();
      for (const p of products) {
        const code = safeStr(p.item_code).toUpperCase();
        if (code) byCode.set(code, p);
      }

      const rows: ImportRow[] = [];
      for (let i = 1; i < matrix.length; i++) {
        const r = matrix[i];
        const code = safeStr(r[idxItem]).toUpperCase();
        const price = num(r[idxPrice]);

        const row: ImportRow = { rowNo: i, item_code: code, price_excl_vat: price };

        if (!code) row.error = "Missing item_code";
        if (!row.error && !(price > 0)) row.error = "Invalid price_excl_vat (must be > 0)";

        if (!row.error) {
          const prod = byCode.get(code);
          if (!prod) row.error = `Unknown item_code: ${code}`;
          else {
            row.productId = prod.id;
            row.productName = prod.name || "";
          }
        }

        rows.push(row);
      }

      setImportRows(rows);
    } catch (e: any) {
      setImportErr(e?.message || "Failed to read CSV.");
    }
  }

  const importSummary = useMemo(() => {
    const total = importRows.length;
    const ok = importRows.filter((r) => !r.error && r.productId && r.price_excl_vat > 0).length;
    const bad = total - ok;
    return { total, ok, bad };
  }, [importRows]);

  async function runImport() {
    setImportErr(null);

    const okRows = importRows
      .filter((r) => !r.error && r.productId && r.price_excl_vat > 0)
      .map((r) => ({ productId: r.productId as number, priceExclVat: r.price_excl_vat }));

    if (okRows.length === 0) {
      setImportErr("No valid rows to import.");
      return;
    }

    setImporting(true);
    const raw = localStorage.getItem("rp_user") || "";

    const res = await fetch("/api/pricing/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-rp-user": raw },
      body: JSON.stringify({ customerId, rows: okRows }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      setImporting(false);
      setImportErr(json.error || "Bulk import failed.");
      return;
    }

    setImporting(false);
    setImportOpen(false);
    setImportRows([]);
    await loadPricingOverrides();
    alert(`Imported ${json.imported || okRows.length} price(s) successfully.`);
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
          <button className="rp-nav-item" onClick={() => router.push("/suppliers")}>Suppliers</button>

          <div className="rp-nav-section-title">Reports</div>
          <button className="rp-nav-item" onClick={() => router.push("/reports")}>Reports &amp; Statements</button>
        </div>

        <div className="rp-sidebar-footer">Customer pricing • Partywise rates • rampottery.mu</div>
      </aside>

      <main className="rp-page">
        <div className="rp-container">
          <div className="rp-toolbar">
            <div>
              <h1 className="rp-h1" style={{ marginBottom: 6 }}>Partywise Pricing</h1>
              <p className="rp-subtitle" style={{ marginBottom: 0 }}>
                Customer: <b>{customer?.name || "—"}</b>{" "}
                {customer?.customer_code ? <>• Code: <b>{customer.customer_code}</b></> : null}
              </p>
            </div>

            <div className="rp-actions">
              <button className="rp-btn-red-outline" type="button" onClick={() => router.push("/customers")}>
                ← Customers
              </button>

              <button className="rp-btn-red-outline" type="button" onClick={downloadSample}>
                ⬇ Sample CSV
              </button>

              <button className="rp-btn-red" type="button" onClick={openImport} disabled={loading}>
                ⬆ Bulk Import CSV
              </button>

              <button className="rp-btn-red" type="button" onClick={loadPricingOverrides} disabled={loading}>
                Refresh Prices
              </button>
            </div>
          </div>

          <div className="rp-card" style={{ marginTop: 14 }}>
            <div className="rp-card-head">
              <div className="rp-card-title">Products</div>
              <div className="rp-card-tip">Override price only when this customer has special rates.</div>
            </div>

            <div style={{ padding: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <input
                className="rp-input-premium"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search product code or name…"
                style={{ width: 440 }}
              />
              <div style={{ fontWeight: 950, color: "rgba(0,0,0,0.62)" }}>
                Showing: <b>{filtered.length}</b> / {products.length} • Overrides: <b>{Object.keys(priceMap).length}</b>
              </div>
            </div>

            <div className="rp-table-wrap">
              <table className="rp-table">
                <thead>
                  <tr>
                    <th style={{ width: 140 }}>Code</th>
                    <th>Product</th>
                    <th style={{ width: 160, textAlign: "right" }}>Default</th>
                    <th style={{ width: 200, textAlign: "right" }}>Customer Price</th>
                    <th style={{ width: 320 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 18, fontWeight: 950, color: "rgba(0,0,0,0.6)" }}>
                        Loading…
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 18, fontWeight: 950, color: "rgba(0,0,0,0.6)" }}>
                        No products found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => {
                      const defaultPrice = getDefaultProductPrice(p);
                      const hasOverride = priceMap[p.id] !== undefined;
                      const customerPrice = hasOverride ? priceMap[p.id] : defaultPrice;

                      return (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 950 }}>{p.item_code || `#${p.id}`}</td>
                          <td>{p.name || "—"}</td>
                          <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{money(defaultPrice)}</td>

                          <td style={{ textAlign: "right" }}>
                            <input
                              className="rp-input-premium"
                              style={{ width: 170, textAlign: "right", padding: "9px 10px" }}
                              defaultValue={money(customerPrice)}
                              onBlur={(e) => {
                                const v = num(e.target.value);
                                if (Math.abs(v - customerPrice) > 0.00001) saveOverride(p.id, v);
                              }}
                            />
                          </td>

                          <td>
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                              <button
                                className="rp-btn-red"
                                type="button"
                                onClick={() => saveOverride(p.id, num(customerPrice))}
                                disabled={savingId === p.id}
                              >
                                {savingId === p.id ? "Saving…" : "Save"}
                              </button>

                              {hasOverride ? (
                                <button
                                  className="rp-btn-red-outline"
                                  type="button"
                                  onClick={() => removeOverride(p.id)}
                                  disabled={savingId === p.id}
                                >
                                  Use Default
                                </button>
                              ) : (
                                <span className="rp-status rp-status-approved">
                                  <span className="rp-status-dot" />
                                  Default
                                </span>
                              )}

                              {hasOverride ? (
                                <span className="rp-status rp-status-issued">
                                  <span className="rp-status-dot" />
                                  Customer price applied
                                </span>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ padding: 14, display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 950, color: "rgba(0,0,0,.62)" }}>
                Tip: customer prices will be auto-picked in <b>New Invoice</b>.
              </div>
              <button className="rp-btn-red-outline" type="button" onClick={() => router.push("/invoices/new")}>
                → Create Invoice
              </button>
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
                <div className="rp-modal-title">Bulk Import Customer Pricing (CSV)</div>
                <button className="rp-modal-x" onClick={() => setImportOpen(false)} aria-label="Close">✕</button>
              </div>

              <div className="rp-modal-body">
                <div style={{ fontWeight: 950, marginBottom: 10 }}>
                  Upload a CSV with columns: <b>item_code</b>, <b>price_excl_vat</b>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                  <button className="rp-btn-red" type="button" onClick={() => fileRef.current?.click()}>
                    Choose CSV
                  </button>
                  <button className="rp-btn-red-outline" type="button" onClick={downloadSample}>
                    ⬇ Download Template
                  </button>

                  <div style={{ fontWeight: 950, color: "rgba(0,0,0,.62)", alignSelf: "center" }}>
                    Rows: <b>{importSummary.total}</b> • Valid: <b>{importSummary.ok}</b> • Errors: <b>{importSummary.bad}</b>
                  </div>
                </div>

                {importErr && (
                  <div style={{ color: "rgba(227,6,19,0.95)", fontWeight: 950, marginBottom: 10 }}>
                    {importErr}
                  </div>
                )}

                {importRows.length > 0 && (
                  <div className="rp-table-wrap" style={{ border: "1px solid rgba(0,0,0,.08)", borderRadius: 14 }}>
                    <table className="rp-table">
                      <thead>
                        <tr>
                          <th style={{ width: 70 }}>Row</th>
                          <th style={{ width: 140 }}>Item Code</th>
                          <th>Product</th>
                          <th style={{ width: 160, textAlign: "right" }}>Price Excl VAT</th>
                          <th style={{ width: 260 }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importRows.slice(0, 50).map((r) => (
                          <tr key={r.rowNo}>
                            <td>{r.rowNo}</td>
                            <td style={{ fontWeight: 950 }}>{r.item_code || "—"}</td>
                            <td>{r.productName || "—"}</td>
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

                {importRows.length > 50 && (
                  <div style={{ marginTop: 8, fontWeight: 950, color: "rgba(0,0,0,.6)" }}>
                    Preview limited to first 50 rows.
                  </div>
                )}
              </div>

              <div className="rp-modal-foot">
                <button className="rp-btn-red-outline" type="button" onClick={() => setImportOpen(false)} disabled={importing}>
                  Cancel
                </button>
                <button className="rp-btn-red" type="button" onClick={runImport} disabled={importing || importSummary.ok === 0}>
                  {importing ? "Importing…" : `Import ${importSummary.ok} Row(s)`}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
