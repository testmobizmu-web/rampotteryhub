"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ImportStatus = "idle" | "preview" | "uploading" | "done" | "error";

type PreviewRow = {
  rowIndex: number;
  item_code: string;
  name: string;
  price_excl_vat: number;
  vat_rate?: number;
  error?: string;

  // image preview
  imageMatch?: "matched" | "missing";
  imageFileName?: string;
  imagePreviewUrl?: string; // object url
};

function num(v: unknown): number {
  const n = Number(String(v ?? "").replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}
function up(v: unknown) {
  return String(v ?? "").trim().toUpperCase();
}
function str(v: unknown) {
  return String(v ?? "").trim();
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
      const isEmpty = row.every((x) => !str(x));
      if (!isEmpty) rows.push(row);
      row = [];
      continue;
    }

    field += c;
  }

  row.push(field);
  row = row.map((x) => (x.endsWith("\r") ? x.slice(0, -1) : x));
  const isEmpty = row.every((x) => !str(x));
  if (!isEmpty) rows.push(row);

  return rows;
}

function normalizeHeader(h: string) {
  return str(h).toLowerCase().replace(/\s+/g, "_");
}

function baseNameUpper(fileName: string) {
  const just = fileName.split("/").pop() || fileName;
  const dot = just.lastIndexOf(".");
  const base = dot >= 0 ? just.slice(0, dot) : just;
  return base.trim().toUpperCase();
}

function Badge({
  tone,
  children,
}: {
  tone: "ok" | "warn" | "bad" | "neutral";
  children: React.ReactNode;
}) {
  const cls =
    tone === "ok"
      ? "rp-badge rp-badge--paid"
      : tone === "warn"
      ? "rp-badge rp-badge--partial"
      : tone === "bad"
      ? "rp-badge rp-badge--void"
      : "rp-badge rp-badge--neutral";
  return <span className={cls}>{children}</span>;
}

export default function ProductImportPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const imagesRef = useRef<HTMLInputElement | null>(null);

  const [status, setStatus] = useState<ImportStatus>("idle");
  const [err, setErr] = useState<string | null>(null);

  const [fileName, setFileName] = useState<string>("");
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [q, setQ] = useState("");

  // images selected
  const [images, setImages] = useState<File[]>([]);
  const [imageMap, setImageMap] = useState<Map<string, File>>(new Map()); // ITEM_CODE -> file
  const [imagePreviewMap, setImagePreviewMap] = useState<Map<string, string>>(new Map()); // ITEM_CODE -> objectUrl

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

  // auth guard
  useEffect(() => {
    const raw = localStorage.getItem("rp_user");
    if (!raw) {
      router.replace("/login");
      return;
    }
    try {
      const user = JSON.parse(raw);
      const ok =
        String(user?.role || "").toLowerCase() === "admin" ||
        Boolean(user?.permissions?.canEditStock);
      if (!ok) {
        alert("Access denied. Admin/Stock permission required.");
        router.replace("/products");
      }
    } catch {
      router.replace("/login");
    }
  }, [router]);

  // cleanup preview objectURLs
  useEffect(() => {
    return () => {
      imagePreviewMap.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = useMemo(() => {
    const total = rows.length;
    const ok = rows.filter((r) => !r.error).length;
    const bad = total - ok;
    const matchedImgs = rows.filter((r) => r.imageMatch === "matched").length;
    const missingImgs = rows.filter((r) => r.imageMatch === "missing").length;
    return { total, ok, bad, matchedImgs, missingImgs };
  }, [rows]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      `${r.item_code} ${r.name}`.toLowerCase().includes(s)
    );
  }, [rows, q]);

  function downloadSample() {
    // NOTE: filenames should match item_code (ITEM-001.jpg)
    const csv = [
      "item_code,name,price_excl_vat,vat_rate,unit,category,is_active",
      "ITEM-001,Clay Pot Small,120.00,15,pcs,Pots,true",
      "ITEM-002,Clay Pot Medium,180.00,15,pcs,Pots,true",
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products_import_template.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleImages(files: FileList) {
    // clear old previews
    imagePreviewMap.forEach((url) => URL.revokeObjectURL(url));

    const list = Array.from(files || []);
    setImages(list);

    const m = new Map<string, File>();
    const pm = new Map<string, string>();

    for (const f of list) {
      const key = baseNameUpper(f.name); // ITEM-001 from ITEM-001.jpg
      m.set(key, f);
      pm.set(key, URL.createObjectURL(f));
    }

    setImageMap(m);
    setImagePreviewMap(pm);

    // refresh matches in preview rows
    setRows((prev) =>
      prev.map((r) => {
        if (!r.item_code) return r;
        const f = m.get(r.item_code);
        return {
          ...r,
          imageMatch: f ? "matched" : "missing",
          imageFileName: f?.name,
          imagePreviewUrl: f ? pm.get(r.item_code) : undefined,
        };
      })
    );
  }

  async function handleFile(file: File) {
    setErr(null);
    setRows([]);
    setFileName(file.name);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setStatus("error");
      setErr("Please upload a CSV file (.csv).");
      return;
    }

    const text = await file.text();
    const matrix = parseCsv(text);

    if (matrix.length < 2) {
      setStatus("error");
      setErr("CSV is empty.");
      return;
    }

    const headers = matrix[0].map((h) => normalizeHeader(h));
    const idxCode = headers.findIndex((h) => h === "item_code" || h === "code");
    const idxName = headers.findIndex(
      (h) => h === "name" || h === "product_name"
    );
    const idxPrice = headers.findIndex(
      (h) => h === "price_excl_vat" || h === "price" || h === "unit_price"
    );
    const idxVat = headers.findIndex((h) => h === "vat_rate" || h === "vat");

    if (idxCode === -1 || idxName === -1 || idxPrice === -1) {
      setStatus("error");
      setErr("CSV must include item_code, name, price_excl_vat");
      return;
    }

    const preview: PreviewRow[] = [];
    for (let i = 1; i < matrix.length; i++) {
      const r = matrix[i];
      const item_code = up(r[idxCode]);
      const name = str(r[idxName]);
      const price_excl_vat = num(r[idxPrice]);
      const vat_rate = idxVat !== -1 ? num(r[idxVat]) : undefined;

      const row: PreviewRow = { rowIndex: i, item_code, name, price_excl_vat, vat_rate };

      if (!item_code) row.error = "Missing item_code";
      else if (!name) row.error = "Missing name";
      else if (!(price_excl_vat >= 0)) row.error = "Invalid price_excl_vat";

      const img = item_code ? imageMap.get(item_code) : undefined;
      row.imageMatch = img ? "matched" : "missing";
      row.imageFileName = img?.name;
      row.imagePreviewUrl = img ? imagePreviewMap.get(item_code) : undefined;

      preview.push(row);
    }

    setRows(preview);
    setStatus("preview");
  }

  async function upload() {
    setErr(null);

    const okCount = rows.filter((r) => !r.error).length;
    if (okCount === 0) {
      setErr("No valid rows to import.");
      setStatus("error");
      return;
    }

    const input = fileRef.current;
    const file = input?.files?.[0];
    if (!file) {
      setErr("Choose a CSV file first.");
      setStatus("error");
      return;
    }

    setStatus("uploading");

    const fd = new FormData();
    fd.append("file", file);
    for (const img of images) fd.append("images", img);

    const res = await fetch("/api/import-products", { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));

    if (!res.ok || !json.ok) {
      setStatus("error");
      setErr(json.error || "Import failed.");
      return;
    }

    setStatus("done");
    alert(
      `Imported ${json.imported} product(s). Rejected: ${json.rejected || 0}. Images uploaded: ${
        json.images_uploaded || 0
      }`
    );
  }

  // ✅ shared sidebar content
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
        <Link className="rp-nav-btn rp-nav-btn--active" href="/products/import" onClick={() => setMobileNavOpen(false)}>
          Import Stock Excel
        </Link>
        <Link className="rp-nav-btn" href="/customers" onClick={() => setMobileNavOpen(false)}>
          Customers
        </Link>
        <Link className="rp-nav-btn" href="/reports" onClick={() => setMobileNavOpen(false)}>
          Reports & Statements
        </Link>
        <Link className="rp-nav-btn" href="/admin/users" onClick={() => setMobileNavOpen(false)}>
          Users & Permissions
        </Link>
      </nav>

      <div className="rp-side-footer">
        <div className="rp-role">
          <span>Import</span>
          <b>CSV + Images</b>
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
        <button className="rp-icon-btn" type="button" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
          <span className="rp-burger" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </button>

        <div className="rp-mtop-brand">
          <div className="rp-mtop-title">Import Products</div>
          <div className="rp-mtop-sub">CSV + Images • Premium preview</div>
        </div>

        <button className="rp-icon-btn" type="button" onClick={() => router.push("/products")} aria-label="Back">
          ←
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
          {/* Header card */}
          <div className="rp-top rp-card rp-glass rp-card-anim" style={{ animationDelay: "40ms" }}>
            <div style={{ padding: 14 }}>
              <div className="rp-eyebrow">
                <span className="rp-tag">Secure • Cloud</span>
                <span className="rp-tag">Import Wizard</span>
                <span className="rp-tag">Images optional</span>
              </div>
              <div className="rp-title">
                <h1>Import Products</h1>
                <p>
                  Upload a CSV and (optional) product photos — filenames must match <b>item_code</b>
                </p>
              </div>
            </div>

            <div style={{ padding: 14, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <button className="rp-link-btn" type="button" onClick={() => router.push("/products")}>
                ← Products
              </button>
              <button className="rp-link-btn" type="button" onClick={downloadSample}>
                ⬇ Sample CSV
              </button>
            </div>
          </div>

          {/* Actions (segmented) */}
          <div className="rp-actions rp-card-anim" style={{ animationDelay: "110ms" }}>
            <div className="rp-seg">
              <button className="rp-seg-item" type="button" onClick={() => imagesRef.current?.click()}>
                🖼 Choose Images
              </button>
              <button className="rp-seg-item rp-seg-item--primary" type="button" onClick={() => fileRef.current?.click()}>
                Choose CSV
              </button>
              <button
                className="rp-seg-item"
                type="button"
                onClick={upload}
                disabled={status !== "preview" || summary.ok === 0}
                style={{ opacity: status !== "preview" || summary.ok === 0 ? 0.55 : 1 }}
              >
                {status === "uploading" ? "Uploading…" : "Upload Import"}
              </button>
              <button
                className="rp-seg-item"
                type="button"
                onClick={() => {
                  setStatus("idle");
                  setErr(null);
                  setRows([]);
                  setFileName("");
                  setImages([]);
                  imagePreviewMap.forEach((url) => URL.revokeObjectURL(url));
                  setImageMap(new Map());
                  setImagePreviewMap(new Map());
                  if (fileRef.current) fileRef.current.value = "";
                  if (imagesRef.current) imagesRef.current.value = "";
                }}
              >
                Reset
              </button>
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            style={{ display: "none" }}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              await handleFile(f);
            }}
          />

          <input
            ref={imagesRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => {
              if (!e.target.files) return;
              handleImages(e.target.files);
            }}
          />

          {/* Preview card */}
          <section className="rp-card rp-glass rp-card-anim" style={{ animationDelay: "170ms" }}>
            <div className="rp-card-head">
              <div>
                <div className="rp-card-title">Preview</div>
                <div className="rp-card-sub">
                  File: <b>{fileName || "—"}</b> • Rows: <b>{summary.total}</b> • Valid: <b>{summary.ok}</b> • Errors:{" "}
                  <b>{summary.bad}</b> • Images: <b>{images.length}</b> • Matched: <b>{summary.matchedImgs}</b> • Missing:{" "}
                  <b>{summary.missingImgs}</b>
                </div>
              </div>

              <div className="rp-pill">
                Rule: image filename = <b>item_code</b> (ex: <b>ITEM-001.jpg</b>)
              </div>
            </div>

            <div className="rp-card-body" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <input
                className="rp-input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search item_code or name…"
                style={{ width: 420, maxWidth: "100%" }}
                disabled={status === "idle"}
              />

              {err ? <Badge tone="bad">{err}</Badge> : null}

              {status === "done" ? <Badge tone="ok">Import completed</Badge> : null}
              {status === "preview" ? <Badge tone="neutral">Ready to upload</Badge> : null}
              {status === "uploading" ? <Badge tone="warn">Uploading…</Badge> : null}
            </div>

            <div className="rp-table-wrap">
              <table className="rp-table">
                <thead>
                  <tr>
                    <th style={{ width: 80 }}>Row</th>
                    <th style={{ width: 160 }}>Item Code</th>
                    <th>Product</th>
                    <th style={{ width: 150, textAlign: "right" }}>Price Excl</th>
                    <th style={{ width: 110, textAlign: "right" }}>VAT</th>
                    <th style={{ width: 110 }}>Image</th>
                    <th style={{ width: 220 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {status === "idle" ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="rp-td-empty">
                          Choose a CSV file to preview import.
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="rp-td-empty">No rows.</div>
                      </td>
                    </tr>
                  ) : (
                    filtered.slice(0, 80).map((r) => (
                      <tr key={r.rowIndex}>
                        <td>{r.rowIndex}</td>
                        <td className="rp-strong">{r.item_code || "—"}</td>
                        <td>{r.name || "—"}</td>
                        <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                          {money(r.price_excl_vat)}
                        </td>
                        <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                          {r.vat_rate !== undefined ? money(r.vat_rate) : "—"}
                        </td>
                        <td>
                          {r.imageMatch === "matched" && r.imagePreviewUrl ? (
                            <img
                              src={r.imagePreviewUrl}
                              alt={r.item_code}
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 14,
                                objectFit: "cover",
                                border: "1px solid rgba(0,0,0,.12)",
                              }}
                            />
                          ) : (
                            <span style={{ fontWeight: 900, color: "var(--muted)" }}>—</span>
                          )}
                        </td>
                        <td>
                          {r.error ? (
                            <Badge tone="bad">{r.error}</Badge>
                          ) : r.imageMatch === "missing" ? (
                            <Badge tone="warn">Ready (no image)</Badge>
                          ) : (
                            <Badge tone="ok">Ready</Badge>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {status !== "idle" && filtered.length > 80 ? (
              <div style={{ padding: "12px 14px", color: "var(--muted)", fontWeight: 850, fontSize: 12.5 }}>
                Preview limited to first 80 rows.
              </div>
            ) : null}

            {status !== "idle" && summary.total === 0 ? (
              <div className="rp-card-body">
                <div className="rp-empty">
                  <b>No rows detected</b>
                  <span>Check your CSV headers: item_code, name, price_excl_vat</span>
                </div>
              </div>
            ) : null}
          </section>

          <footer className="rp-footer rp-card-anim" style={{ animationDelay: "240ms" }}>
            Products import • CSV + Images • Built by <span>MoBiz.mu</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
