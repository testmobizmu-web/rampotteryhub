"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { rpFetch } from "@/lib/rpFetch";
import Image from "next/image";

type Row = {
  item_code?: string;
  sku?: string;
  selling_price: number;
  _raw?: any;
};

type RpSession = {
  id?: string;
  username?: string;
  name?: string;
  role?: string;
};

function roleUpper(r?: string) {
  return String(r || "").toUpperCase();
}
function fmtDateTime(d: Date) {
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;
}
function n(v: any) {
  const x = Number(String(v ?? "").trim().replace(",", "."));
  return Number.isFinite(x) ? x : NaN;
}
function norm(v: any) {
  return String(v ?? "").trim();
}

function downloadText(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ProductsImportPage() {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lastSync, setLastSync] = useState<string>("—");
  const [session, setSession] = useState<RpSession | null>(null);

  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [loadingFile, setLoadingFile] = useState(false);
  const [importing, setImporting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  }

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const saved = localStorage.getItem("rp_theme");
    const initial = saved === "dark" ? "dark" : "light";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;

    try {
      const raw = localStorage.getItem("rp_user");
      if (raw) setSession(JSON.parse(raw));
    } catch {}

    setLastSync(fmtDateTime(new Date()));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // quick clear
        if (rows.length) {
          e.preventDefault();
          setRows([]);
          setErr(null);
          setQ("");
          showToast("Cleared ✅");
        }
      }
      if (e.key === "Enter") {
        // Enter imports (only if ready and not typing in input)
        const tag = (document.activeElement as any)?.tagName?.toLowerCase?.() || "";
        if (tag === "input" || tag === "textarea" || tag === "select") return;
        if (!importing && stats.ok > 0) {
          e.preventDefault();
          void importNow();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, rows.length, importing]);

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

  const userLabel = useMemo(() => {
    const name = (session?.name || session?.username || "").trim();
    return name || "User";
  }, [session]);

  const stats = useMemo(() => {
    const total = rows.length;
    const ok = rows.filter((r) => Number.isFinite(r.selling_price) && (!!r.item_code || !!r.sku)).length;
    const bad = total - ok;
    return { total, ok, bad };
  }, [rows]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rows;
    return rows.filter((r) => {
      const ref = `${r.item_code || ""} ${r.sku || ""}`.toLowerCase();
      return ref.includes(qq);
    });
  }, [rows, q]);

  async function parseFile(file: File) {
    setErr(null);
    setLoadingFile(true);
    setRows([]);
    setQ("");

    try {
      const name = file.name.toLowerCase();

      // CSV
      if (name.endsWith(".csv")) {
        const text = await file.text();
        const parsed = Papa.parse<Record<string, any>>(text, {
          header: true,
          skipEmptyLines: true,
        });

        const data = (parsed.data || []) as Record<string, any>[];
        const out: Row[] = data.map((r) => ({
          item_code: norm(r.item_code || r.code || r.itemCode) || undefined,
          sku: norm(r.sku) || undefined,
          selling_price: n(r.selling_price ?? r.price ?? r.sellingPrice ?? r.selling_price_rs),
          _raw: r,
        }));

        setRows(out);
        setLastSync(fmtDateTime(new Date()));
        showToast("File loaded ✅");
        return;
      }

      // XLSX
      if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });

        const out: Row[] = (json || []).map((r) => ({
          item_code: norm(r.item_code || r.code || r.itemCode) || undefined,
          sku: norm(r.sku) || undefined,
          selling_price: n(r.selling_price ?? r.price ?? r.sellingPrice ?? r.selling_price_rs),
          _raw: r,
        }));

        setRows(out);
        setLastSync(fmtDateTime(new Date()));
        showToast("File loaded ✅");
        return;
      }

      setErr("Unsupported file type. Please upload CSV or XLSX.");
    } catch (e: any) {
      setErr(e?.message || "Failed to read file");
    } finally {
      setLoadingFile(false);
    }
  }

  async function importNow() {
    setErr(null);
    setImporting(true);
    try {
      const clean = rows
        .filter((r) => Number.isFinite(r.selling_price) && (!!r.item_code || !!r.sku))
        .map((r) => ({
          item_code: (r.item_code || "").trim() || undefined,
          sku: (r.sku || "").trim() || undefined,
          selling_price: Number(r.selling_price),
        }));

      const res = await rpFetch("/api/products/import-prices", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rows: clean }),
      });

      const json = await res.json().catch(() => ({} as any));
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Import failed");

      showToast("Import done ✅");

      if (json.errors?.length) {
        setErr(
          `Imported: ${json.updated}\n\nWarnings:\n- ${json.errors
            .slice(0, 30)
            .join("\n- ")}${json.errors.length > 30 ? `\n… +${json.errors.length - 30} more` : ""}`
        );
      } else {
        setErr(null);
      }
    } catch (e: any) {
      setErr(e?.message || "Import failed");
    } finally {
      setImporting(false);
    }
  }

  function downloadTemplate() {
    const tpl =
      "item_code,sku,selling_price\n" +
      "P001,,12.50\n" +
      ",SKU-ABC,9.99\n";
    downloadText("price_import_template.csv", tpl, "text/csv");
    showToast("Template downloaded ✅");
  }

  if (!mounted) return null;

  return (
    <div className="rp-app">
      <div className="rp-bg" aria-hidden="true">
        <div className="rp-bg-orb rp-bg-orb--1" />
        <div className="rp-bg-orb rp-bg-orb--2" />
        <div className="rp-bg-orb rp-bg-orb--3" />
        <div className="rp-bg-grid" />
      </div>

      {toast && <div className="rp-toast">{toast}</div>}

      <div className="rp-shell rp-enter">
        {/* Sidebar (kept consistent with your premium pages) */}
        <aside className="rp-side">
          <div
            className="rp-side-card rp-card-anim"
            style={{ minHeight: "calc(100vh - 28px)", display: "flex", flexDirection: "column" }}
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
              <Link className="rp-nav-btn" href="/" prefetch={false}><span className="rp-ic3d">▶</span>Dashboard</Link>
              <Link className="rp-nav-btn" href="/invoices" prefetch={false}><span className="rp-ic3d">▶</span>Invoices</Link>
              <Link className="rp-nav-btn" href="/credit-notes" prefetch={false}><span className="rp-ic3d">▶</span>Credit Notes</Link>
              <Link className="rp-nav-btn rp-nav-btn--active" href="/products" prefetch={false}><span className="rp-ic3d">▶</span>Stock & Categories</Link>
              <Link className="rp-nav-btn" href="/stock-movements" prefetch={false}><span className="rp-ic3d">▶</span>Stock Movements</Link>
              <Link className="rp-nav-btn" href="/customers" prefetch={false}><span className="rp-ic3d">▶</span>Customers</Link>
              <Link className="rp-nav-btn" href="/suppliers" prefetch={false}><span className="rp-ic3d">▶</span>Suppliers</Link>
              <Link className="rp-nav-btn" href="/reports" prefetch={false}><span className="rp-ic3d">▶</span>Reports & Statements</Link>
            </nav>

            <div className="rp-side-footer rp-side-footer--in" style={{ marginTop: "auto" }}>
              <div className="rp-role">
                <span>Signed in</span>
                <b title={userLabel}>{userLabel}</b>
              </div>
              <div className="rp-role" style={{ marginTop: 10 }}>
                <span>Role</span>
                <b>{roleUpper(session?.role) || "STAFF"}</b>
              </div>
            </div>
          </div>
        </aside>

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
              <div className="rp-exec__title">Import Price List</div>
              <div className="rp-exec__sub">CSV / XLSX • Preview • Apply to products</div>
            </div>
            <div className="rp-exec__right">
              <span className={`rp-live ${loadingFile || importing ? "is-dim" : ""}`}>
                <span className="rp-live-dot" aria-hidden="true" />
                {loadingFile ? "Reading" : importing ? "Importing" : "Ready"}
              </span>
              <span className={`rp-chip rp-chip--soft ${err ? "rp-chip--warn" : ""}`}>
                {err ? "Attention needed" : "All good"}
              </span>
            </div>
          </section>

          {/* Actions */}
          <section className="rp-actions rp-card-anim">
            <div className="rp-seg rp-seg--pro">
              <Link className="rp-seg-item rp-seg-item--brand" href="/products" prefetch={false}>
                <span className="rp-icbtn" aria-hidden="true">←</span>
                Back to products
              </Link>

              <button
                className="rp-seg-item rp-seg-item--brand"
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={loadingFile || importing}
              >
                <span className="rp-icbtn" aria-hidden="true">⬆</span>
                {loadingFile ? "Loading file…" : "Choose file"}
              </button>

              <button
                className="rp-seg-item rp-seg-item--brand"
                type="button"
                onClick={downloadTemplate}
                disabled={loadingFile || importing}
              >
                <span className="rp-icbtn" aria-hidden="true">⤓</span>
                Download template
              </button>

              <button
                className="rp-seg-item rp-seg-item--brand"
                type="button"
                onClick={() => void importNow()}
                disabled={importing || stats.ok === 0}
                style={{ marginLeft: "auto" }}
              >
                <span className="rp-icbtn" aria-hidden="true">✓</span>
                {importing ? "Importing…" : `Import (${stats.ok})`}
              </button>

              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void parseFile(f);
                }}
              />
            </div>
          </section>

          {err && (
            <div className="rp-note rp-note--warn" style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>
              {err}
            </div>
          )}

          {/* Preview */}
          <section className="rp-card rp-card-anim" style={{ marginTop: 12 }}>
            <div className="rp-card-head rp-card-head--tight">
              <div>
                <div className="rp-card-title">Preview</div>
                <div className="rp-card-sub">
                  Supported columns: <b>item_code</b> or <b>sku</b> + <b>selling_price</b>
                  {" "}• Enter = Import • Esc = Clear
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span className="rp-chip rp-chip--soft">
                  Valid <b style={{ marginLeft: 6 }}>{stats.ok}</b> / {stats.total}
                </span>
                <input
                  className="rp-input"
                  placeholder="Search item_code / sku…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  style={{ minWidth: 240 }}
                />
              </div>
            </div>

            <div className="rp-card-body">
              <div className="rp-table-wrap">
                <div className="rp-table-scroll">
                  <div className="rp-table-scroll__inner">
                    <table className="rp-table rp-table--premium">
                      <thead>
                        <tr>
                          <th style={{ width: 80 }}>SN</th>
                          <th className="rp-pin" style={{ width: 260 }}>
                            item_code / sku
                          </th>
                          <th className="rp-right" style={{ width: 200 }}>
                            selling_price
                          </th>
                          <th style={{ minWidth: 260 }}>Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filtered.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="rp-td-empty">
                              {rows.length === 0
                                ? "Upload a CSV/XLSX to preview…"
                                : "No rows match your search."}
                            </td>
                          </tr>
                        ) : (
                          filtered.slice(0, 800).map((r, i) => {
                            const ref = (r.item_code || r.sku || "").trim();
                            const ok = !!ref && Number.isFinite(r.selling_price);
                            return (
                              <tr key={i} className="rp-row-hover">
                                <td style={{ textAlign: "center", fontWeight: 950 }}>{i + 1}</td>

                                <td className="rp-pin rp-strong">{ref || "—"}</td>

                                <td className="rp-right rp-strong">
                                  {Number.isFinite(r.selling_price) ? r.selling_price.toFixed(2) : "—"}
                                </td>

                                <td>
                                  {ok ? (
                                    <span className="rp-pill rp-pill--in">READY</span>
                                  ) : (
                                    <span className="rp-pill rp-pill--out">INVALID (missing ref/price)</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {filtered.length > 800 && (
                <div className="rp-help" style={{ marginTop: 10 }}>
                  Showing first 800 preview rows for performance.
                </div>
              )}
            </div>
          </section>

          <footer className="rp-footer">© {new Date().getFullYear()} Ram Pottery Ltd • Built by Mobiz.mu</footer>
        </main>
      </div>
    </div>
  );
}
