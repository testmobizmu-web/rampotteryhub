"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { rpFetch } from "@/lib/rpFetch";

type Row = {
  product_id: number;
  sku: string;
  name: string;
  base_price: number;
  customer_price: number | null;
  effective_price: number;
  has_override: boolean;
};

function formatRs(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return `Rs ${v.toFixed(2)}`;
}

async function rpJson(url: string, init?: any) {
  const res = await rpFetch(url, init as any);
  return typeof (res as any)?.json === "function" ? await (res as any).json() : res;
}

function toCsv(rows: Row[]) {
  const header = ["product_id", "sku", "name", "base_price", "customer_price", "effective_price", "has_override"];
  const lines = [header.join(",")];

  for (const r of rows) {
    const line = [
      r.product_id,
      `"${(r.sku || "").replaceAll('"', '""')}"`,
      `"${(r.name || "").replaceAll('"', '""')}"`,
      r.base_price.toFixed(2),
      r.customer_price == null ? "" : r.customer_price.toFixed(2),
      r.effective_price.toFixed(2),
      r.has_override ? "1" : "0",
    ].join(",");
    lines.push(line);
  }

  return lines.join("\n");
}

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return [];

  // Simple CSV parser for our format (comma split; fields with quotes supported minimally)
  function splitLine(line: string) {
    const out: string[] = [];
    let cur = "";
    let q = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' ) {
        if (q && line[i + 1] === '"') { cur += '"'; i++; }
        else q = !q;
      } else if (ch === "," && !q) {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out.map(s => s.trim());
  }

  const header = splitLine(lines[0]).map(h => h.toLowerCase());
  const pidIdx = header.indexOf("product_id");
  const custIdx = header.indexOf("customer_price");

  if (pidIdx === -1 || custIdx === -1) {
    throw new Error("CSV must include product_id and customer_price columns.");
  }

  const items: { product_id: number; customer_price: number }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitLine(lines[i]);
    const pid = Number(cols[pidIdx]);
    const cp = Number(cols[custIdx]);

    if (!Number.isFinite(pid) || pid <= 0) continue;
    if (!Number.isFinite(cp) || cp < 0) continue; // ignore empty/invalid
    items.push({ product_id: pid, customer_price: cp });
  }

  return items;
}

export default function CustomerPricingPage() {
  const params = useParams();
  const id = params?.id as string;
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const [rows, setRows] = useState<Row[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const json = await rpJson(`/api/customers/${id}/pricing`, { cache: "no-store" });
      if (!json?.ok) throw new Error(json?.error || "Failed to load pricing");
      setRows(json.rows || []);
      setDraft({});
    } catch (e: any) {
      setErr(e?.message || "Failed to load pricing");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r =>
      (r.name || "").toLowerCase().includes(s) ||
      (r.sku || "").toLowerCase().includes(s) ||
      String(r.product_id).includes(s)
    );
  }, [rows, q]);

  function setOverride(pid: number, value: string) {
    setDraft(d => ({ ...d, [String(pid)]: value }));
  }

  function getShownCustomerPrice(r: Row) {
    const key = String(r.product_id);
    if (key in draft) return draft[key];
    return r.customer_price == null ? "" : String(r.customer_price);
  }

  function hasPendingChanges() {
    return Object.keys(draft).length > 0;
  }

  async function saveChanges() {
    setBusy(true);
    setErr(null);
    try {
      const items: { product_id: number; customer_price: number }[] = [];

      for (const [pid, val] of Object.entries(draft)) {
        const n = Number(val);
        if (!Number.isFinite(n) || n < 0) continue;
        items.push({ product_id: Number(pid), customer_price: n });
      }

      if (!items.length) {
        setDraft({});
        return;
      }

      const json = await rpJson(`/api/customers/${id}/pricing`, {
        method: "PUT",
        body: JSON.stringify({ items }),
      });

      if (!json?.ok) throw new Error(json?.error || "Save failed");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function removeOverride(pid: number) {
    setBusy(true);
    setErr(null);
    try {
      const json = await rpJson(`/api/customers/${id}/pricing?product_id=${pid}`, {
        method: "DELETE",
      });

      if (!json?.ok) throw new Error(json?.error || "Remove failed");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Remove failed");
    } finally {
      setBusy(false);
    }
  }

  function exportCsv() {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customer_${id}_pricing.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importCsvFile(file: File) {
    setBusy(true);
    setErr(null);
    try {
      const text = await file.text();
      const items = parseCsv(text);

      if (!items.length) throw new Error("No valid rows found in CSV (need product_id + customer_price).");

      const json = await rpJson(`/api/customers/${id}/pricing`, {
        method: "PUT",
        body: JSON.stringify({ items }),
      });

      if (!json?.ok) throw new Error(json?.error || "Import failed");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Import failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="rp-app rp-enter">
      <div className="rp-bg" aria-hidden="true">
        <div className="rp-bg-orb rp-bg-orb--1" />
        <div className="rp-bg-orb rp-bg-orb--2" />
        <div className="rp-bg-orb rp-bg-orb--3" />
        <div className="rp-bg-grid" />
      </div>

      <div className="rp-shell">
        {/* Sidebar (same as your dashboard) */}
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
              <Link className={`rp-nav-btn ${pathname?.startsWith("/customers") ? "rp-nav-btn--active" : ""}`} href="/customers" prefetch={false}>
                Customers
              </Link>
              <Link className={`rp-nav-btn ${pathname?.startsWith("/products") ? "rp-nav-btn--active" : ""}`} href="/products" prefetch={false}>
                Products
              </Link>
              <Link className={`rp-nav-btn ${pathname?.startsWith("/invoices") ? "rp-nav-btn--active" : ""}`} href="/invoices" prefetch={false}>
                Invoices
              </Link>
            </nav>

            <div className="rp-side-footer">
              <div className="rp-role">
                <span>Pricing</span>
                <b>Partywise</b>
              </div>
            </div>
          </div>
        </aside>

        <main className="rp-main">
          {/* Header */}
          <header className="rp-top rp-card-anim" style={{ animationDelay: "60ms" }}>
            <div>
              <Link className="rp-ui-btn rp-ui-btn--soft rp-glow" href={`/customers/${id}/edit`} prefetch={false}>
                ← Back to Customer
              </Link>
            </div>

            <div className="rp-top-center--stacked">
              <div className="rp-top-logo rp-top-logo--xl">
                <img src="/images/logo/logo.png" alt="Ram Pottery" width={44} height={44} />
              </div>

              <div className="rp-top-center-text">
                <div className="rp-top-title">Partywise Pricing</div>
                <div className="rp-top-subtitle">Customer-specific price overrides</div>
              </div>

              <div className="rp-breadcrumb">
                <span>Customers</span> → <span>Edit</span> → <b>Pricing</b>
              </div>
            </div>

            <div className="rp-top-right--sync">
              <button
                className={`rp-ui-btn rp-ui-btn--danger rp-glow ${hasPendingChanges() ? "rp-pulse" : ""}`}
                onClick={saveChanges}
                disabled={busy || !hasPendingChanges()}
              >
                Save Changes
              </button>
            </div>
          </header>

          {/* Actions */}
          <section className="rp-bar rp-card-anim" style={{ animationDelay: "110ms" }}>
            <input
              className="rp-input rp-input--full"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search product by name / SKU…"
              disabled={loading || busy}
            />

            <button className="rp-ui-btn rp-ui-btn--soft rp-glow" onClick={exportCsv} disabled={loading || busy}>
              Export CSV
            </button>

            <button
              className="rp-ui-btn rp-ui-btn--soft rp-glow"
              onClick={() => fileRef.current?.click()}
              disabled={loading || busy}
            >
              Import CSV
            </button>

            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importCsvFile(f);
              }}
            />

            <button className="rp-ui-btn rp-ui-btn--soft rp-glow" onClick={load} disabled={loading || busy}>
              Refresh
            </button>
          </section>

          {err && <div className="rp-error-line" style={{ marginTop: 10 }}>{err}</div>}

          {/* Table */}
          <section className="rp-panel rp-card-anim" style={{ animationDelay: "150ms" }}>
            <div className="rp-panel-head">
              <div>
                <div className="rp-panel-title">Products Pricing</div>
                <div className="rp-panel-sub">Edit customer price to override base price</div>
              </div>
              <div className="rp-panel-badge">
                {loading ? "Loading…" : `${filtered.length} products`}
              </div>
            </div>

            <div className="rp-panel-body" style={{ paddingTop: 10 }}>
              <div className="rp-table-wrap rp-table-wrap--premium">
                <table className="rp-table rp-table--premium">
                  <thead>
                    <tr>
                      <th style={{ width: 120 }}>SKU</th>
                      <th>Product</th>
                      <th style={{ width: 160 }}>Base</th>
                      <th style={{ width: 190 }}>Customer Price</th>
                      <th style={{ width: 170 }}>Effective</th>
                      <th style={{ width: 160 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} className="rp-td-empty">Loading pricing…</td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={6} className="rp-td-empty">No products found.</td></tr>
                    ) : (
                      filtered.map((r) => {
                        const val = getShownCustomerPrice(r);
                        const pending = String(r.product_id) in draft;

                        return (
                          <tr key={r.product_id} className="rp-row-hover">
                            <td className="rp-strong">{r.sku || "—"}</td>
                            <td style={{ fontWeight: 950 }}>{r.name || "—"}</td>
                            <td style={{ fontWeight: 950 }}>{formatRs(r.base_price)}</td>

                            <td>
                              <div className="rp-price-edit">
                                <input
                                  className={`rp-input rp-input--price ${pending ? "rp-input--pending" : ""}`}
                                  value={val}
                                  onChange={(e) => setOverride(r.product_id, e.target.value)}
                                  placeholder="(uses base)"
                                  disabled={busy}
                                />
                                <span className={`rp-badge ${r.has_override ? "rp-badge--on" : "rp-badge--off"}`}>
                                  {r.has_override ? "Override" : "Base"}
                                </span>
                              </div>
                            </td>

                            <td style={{ fontWeight: 950 }}>
                              {formatRs((val === "" ? r.base_price : Number(val)) || r.base_price)}
                            </td>

                            <td>
                              {r.has_override ? (
                                <button
                                  className="rp-ui-btn rp-ui-btn--danger rp-glow"
                                  onClick={() => removeOverride(r.product_id)}
                                  disabled={busy}
                                >
                                  Remove
                                </button>
                              ) : (
                                <span className="rp-muted">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 10 }} className="rp-muted">
                Tip: Leave Customer Price empty to use Base price. Use Export/Import for bulk updates.
              </div>
            </div>
          </section>

          <style jsx>{`
            .rp-price-edit {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .rp-input--price {
              width: 140px;
            }
            .rp-input--pending {
              outline: 2px solid rgba(184, 0, 0, 0.25);
            }
            .rp-badge {
              font-size: 12px;
              font-weight: 900;
              padding: 6px 10px;
              border-radius: 999px;
              border: 1px solid var(--rp-border);
              white-space: nowrap;
            }
            .rp-badge--on {
              background: rgba(184, 0, 0, 0.10);
            }
            .rp-badge--off {
              background: rgba(0,0,0,0.03);
            }
            :global(.rp-pulse) {
              position: relative;
            }
            :global(.rp-pulse::after) {
              content: "";
              position: absolute;
              inset: -2px;
              border-radius: 18px;
              border: 2px solid rgba(184, 0, 0, 0.25);
              opacity: 0;
              animation: pulse 1.2s ease-in-out infinite;
              pointer-events: none;
            }
            @keyframes pulse {
              0% { transform: scale(1); opacity: 0; }
              40% { opacity: 0.9; }
              100% { transform: scale(1.06); opacity: 0; }
            }
          `}</style>
        </main>
      </div>
    </div>
  );
}


