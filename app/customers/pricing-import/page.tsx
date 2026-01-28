"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ImportFileType = "CSV" | "XLSX";

type CustomerPreviewRow = {
  rowNo: number;
  customer_code: string;
  customer_name: string;
  client_name: string;
  address: string;
  phone_no: string;
  whatsapp_no: string;
  brn: string;
  vat_no: string;
  error?: string;
};

type Batch = {
  id: string;
  created_at?: string;
  created_by?: string;
  filename?: string;
  file_type?: string;
  file_size?: number;
  mode?: string;
  row_count?: number;
  valid_count?: number;
  error_count?: number;
  status?: string;
  rolled_back_at?: string | null;
};

const MAX_FILE_MB = 8;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
const ALLOWED_EXT = [".csv", ".xlsx", ".xls"] as const;

function normalizeHeader(h: string) {
  return String(h ?? "")
    .trim()
    .toLowerCase()
    .replace(/\uFEFF/g, "") // BOM
    .replace(/[^\w]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function str(v: unknown) {
  return String(v ?? "").trim();
}
function safeUpper(v: unknown) {
  return str(v).toUpperCase();
}

function n0(v: any): number {
  const num = Number(v);
  return Number.isFinite(num) ? num : 0;
}

function fmtDateTime(d: Date) {
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;
}

function fmtTime(isoOrTs: any) {
  try {
    const d = typeof isoOrTs === "string" ? new Date(isoOrTs) : new Date(Number(isoOrTs));
    return d.toLocaleString();
  } catch {
    return String(isoOrTs || "");
  }
}

/** Small CSV parser (supports quotes, commas, CRLF, tab-separated fallback) */
function parseCsv(text: string): string[][] {
  const tabCount = (text.match(/\t/g) || []).length;
  const commaCount = (text.match(/,/g) || []).length;
  const likelyTSV = tabCount > commaCount * 2;

  const src = likelyTSV
    ? text
        .split("\n")
        .map((ln) => ln.replace(/\t/g, ","))
        .join("\n")
    : text;

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < src.length; i++) {
    const c = src[i];

    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
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

/** Detect XLSX by signature (PK..) even if extension is wrong */
async function isZipLike(file: File): Promise<boolean> {
  try {
    const buf = await file.slice(0, 4).arrayBuffer();
    const u = new Uint8Array(buf);
    return u[0] === 0x50 && u[1] === 0x4b; // "PK"
  } catch {
    return false;
  }
}

/** Basic client-side file guard (type + size) */
async function guardFile(
  file: File
): Promise<{ ok: true; kind: ImportFileType } | { ok: false; error: string }> {
  const name = (file.name || "").toLowerCase().trim();
  if (!name) return { ok: false, error: "Invalid file name." };

  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, error: `File too large. Max ${MAX_FILE_MB}MB.` };
  }

  const looksZip = await isZipLike(file);
  const isCSV = name.endsWith(".csv") && !looksZip;
  const isXLSX = name.endsWith(".xlsx") || name.endsWith(".xls") || looksZip;

  if (!isCSV && !isXLSX) {
    return { ok: false, error: `Upload only: ${ALLOWED_EXT.join(", ")}` };
  }

  return { ok: true, kind: isCSV ? "CSV" : "XLSX" };
}

export default function CustomerImportPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lastSync, setLastSync] = useState<string>("");

  const [userRole, setUserRole] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [importOpen, setImportOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [rows, setRows] = useState<CustomerPreviewRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  // ✅ server batches
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  // keep selected file info
  const [pickedFileName, setPickedFileName] = useState<string>("");
  const [pickedFileType, setPickedFileType] = useState<ImportFileType>("CSV");
  const [pickedFileSize, setPickedFileSize] = useState<number>(0);

  // ✅ toggle: delete all existing customers before import
  const [clearExisting, setClearExisting] = useState<boolean>(true);

  // ✅ raw row objects sent to API
  const [apiRows, setApiRows] = useState<Record<string, any>[]>([]);

  // toast
  const [toast, setToast] = useState<string | null>(null);
  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }

  useEffect(() => {
    const saved = localStorage.getItem("rp_theme");
    const initial = saved === "dark" ? "dark" : "light";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;

    const raw = localStorage.getItem("rp_user");
    if (!raw) {
      router.replace("/login");
      return;
    }
    try {
      const user = JSON.parse(raw);
      const role = String(user?.role || "");
      const admin = role.toLowerCase() === "admin";
      setUserRole(role || "—");
      setIsAdmin(admin);
      setLastSync(fmtDateTime(new Date()));
      // fetch batches once on load
      void refreshBatches();
    } catch {
      router.replace("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

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

  async function refreshBatches() {
    setLoadingBatches(true);
    try {
      const raw = localStorage.getItem("rp_user") || "";
      const res = await fetch("/api/customers/import-batches", {
        method: "GET",
        headers: { "x-rp-user": raw },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load batches");
      setBatches(Array.isArray(json.batches) ? json.batches : []);
    } catch (e: any) {
      // non-blocking
      console.warn(e?.message || e);
    } finally {
      setLoadingBatches(false);
    }
  }

  const summary = useMemo(() => {
    const total = rows.length;
    const ok = rows.filter((r) => !r.error).length;
    const bad = total - ok;
    return { total, ok, bad };
  }, [rows]);

  const filteredPreview = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      `${r.customer_code} ${r.customer_name} ${r.client_name} ${r.phone_no} ${r.whatsapp_no} ${r.vat_no} ${r.brn}`
        .toLowerCase()
        .includes(s)
    );
  }, [rows, q]);

  function openImport() {
    setErr(null);
    setRows([]);
    setApiRows([]);
    setQ("");
    setPickedFileName("");
    setPickedFileType("CSV");
    setPickedFileSize(0);
    setClearExisting(true);
    setImportOpen(true);
    setTimeout(() => fileRef.current?.click(), 120);
  }

  function downloadTemplate() {
    // ✅ new format
    const csv = [
      "customer_code,customer_name,client_name,address,phone_no,whatsapp_no,brn,vat_no",
      "CUST-001,Ram Trading Ltd,Ram Group,Royal Road Port Louis,51234567,58277852,BRN12345678,VAT123456",
      "CUST-002,Blue Stone Co,Blue Group,Quatre Bornes,59887766,59000000,BRN99887766,VAT998877",
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers_import_template.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  /** Turn matrix into:
   *  1) client preview rows (nice UI fields)
   *  2) apiRows (objects keyed by headers) for server DRY_RUN/IMPORT
   */
  function mapMatrix(matrix: any[][]): { preview: CustomerPreviewRow[]; apiRows: Record<string, any>[] } {
    if (!matrix || matrix.length < 2) {
      throw new Error("File is empty. Add at least one data row.");
    }

    const headers = (matrix[0] || []).map((h) => normalizeHeader(h));
    const idx = (key: string) => headers.findIndex((h) => h === key);

    // ✅ required in YOUR new excel
    const idxCode = idx("customer_code");
    const idxName = idx("customer_name");
    const idxClient = idx("client_name");
    const idxAddress = idx("address");
    const idxPhone = idx("phone_no");
    const idxWa = idx("whatsapp_no");
    const idxBrn = idx("brn");
    const idxVat = idx("vat_no");

    const required = [
      ["customer_code", idxCode],
      ["customer_name", idxName],
      ["client_name", idxClient],
      ["address", idxAddress],
      ["phone_no", idxPhone],
      ["whatsapp_no", idxWa],
      ["brn", idxBrn],
      ["vat_no", idxVat],
    ] as const;

    const missing = required.filter(([, i]) => i === -1).map(([k]) => k);
    if (missing.length) {
      throw new Error(
        `Missing column(s): ${missing.join(", ")}\nRequired columns: customer_code, customer_name, client_name, address, phone_no, whatsapp_no, brn, vat_no`
      );
    }

    const preview: CustomerPreviewRow[] = [];
    const outApiRows: Record<string, any>[] = [];

    for (let i = 1; i < matrix.length; i++) {
      const r = matrix[i] || [];
      const rowNo = i;

      const customer_code = safeUpper(r[idxCode]);
      const customer_name = str(r[idxName]);
      const client_name = str(r[idxClient]);
      const address = str(r[idxAddress]);
      const phone_no = str(r[idxPhone]);
      const whatsapp_no = str(r[idxWa]);
      const brn = str(r[idxBrn]);
      const vat_no = str(r[idxVat]);

      const row: CustomerPreviewRow = {
        rowNo,
        customer_code,
        customer_name,
        client_name,
        address,
        phone_no,
        whatsapp_no,
        brn,
        vat_no,
      };

      // client-side guard (server will re-check)
      if (!customer_code) row.error = "Missing customer_code";
      else if (!customer_name) row.error = "Missing customer_name";

      preview.push(row);

      // api object uses header keys exactly as normalized
      outApiRows.push({
        customer_code,
        customer_name,
        client_name,
        address,
        phone_no,
        whatsapp_no,
        brn,
        vat_no,
      });
    }

    return { preview, apiRows: outApiRows };
  }

  async function parseCsvFile(file: File): Promise<any[][]> {
    const text = await file.text();
    return parseCsv(text);
  }

  async function parseXlsxFile(file: File): Promise<any[][]> {
    let XLSX: any;
    try {
      XLSX = await import("xlsx");
    } catch {
      throw new Error('XLSX support requires package "xlsx". Run: npm i xlsx');
    }

    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const sheetName = wb.SheetNames?.[0];
    if (!sheetName) throw new Error("XLSX has no sheets.");
    const ws = wb.Sheets[sheetName];
    const matrix = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });
    return matrix as any[][];
  }

  async function handleFile(file: File) {
    setErr(null);
    setRows([]);
    setApiRows([]);
    setQ("");

    setPickedFileName((file.name || "").trim() || "customers_import");
    setPickedFileSize(file.size);

    const guard = await guardFile(file);
    if (!guard.ok) {
      setErr(guard.error);
      return;
    }
    setPickedFileType(guard.kind);

    try {
      const matrix = guard.kind === "CSV" ? await parseCsvFile(file) : await parseXlsxFile(file);
      const { preview, apiRows: outApiRows } = mapMatrix(matrix);
      setRows(preview);
      setApiRows(outApiRows);
    } catch (e: any) {
      setErr(e?.message || "Failed to read file.");
    }
  }

  async function callBulk(mode: "DRY_RUN" | "IMPORT") {
    setErr(null);

    if (!isAdmin && mode === "IMPORT") {
      setErr("Locked: only Admin can import customers.");
      return;
    }
    if (!apiRows.length) {
      setErr("No rows loaded.");
      return;
    }

    setIsImporting(true);

    try {
      const raw = localStorage.getItem("rp_user") || "";
      const res = await fetch("/api/customers/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-rp-user": raw },
        body: JSON.stringify({
          mode,
          clearExisting: mode === "IMPORT" ? clearExisting : false, // DRY_RUN never deletes
          filename: pickedFileName || "customers_import",
          fileType: pickedFileType,
          fileSize: pickedFileSize,
          rows: apiRows,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Request failed");

      if (mode === "DRY_RUN") {
        const s = json.summary || {};
        showToast(`Dry run ✅ Rows: ${n0(s.rowCount)} • Valid: ${n0(s.validCount)} • Errors: ${n0(s.errorCount)}`);

        // If server returns preview/errors, reflect them into UI rows (optional)
        // We’ll keep your local preview, but show server header acceptance via toast.
        return;
      }

      // IMPORT success
      const s = json.summary || {};
      const batchId = String(json.batchId || "");
      showToast(
        `Import done ✅  Batch: ${batchId || "—"}  Rows: ${n0(s.rowCount)}  Valid: ${n0(s.validCount)}  Errors: ${n0(
          s.errorCount
        )}`
      );

      // close + reset
      setImportOpen(false);
      setRows([]);
      setApiRows([]);
      setQ("");
      setPickedFileName("");
      setPickedFileType("CSV");
      setPickedFileSize(0);
      setLastSync(fmtDateTime(new Date()));

      // refresh server batches
      await refreshBatches();
    } catch (e: any) {
      setErr(e?.message || "Bulk import failed");
    } finally {
      setIsImporting(false);
    }
  }

  async function rollbackBatch(batchId: string) {
    if (!isAdmin) {
      showToast("Admin only: rollback locked.");
      return;
    }
    try {
      const raw = localStorage.getItem("rp_user") || "";
      const res = await fetch(`/api/customers/import-batches/${encodeURIComponent(batchId)}/rollback`, {
        method: "POST",
        headers: { "x-rp-user": raw },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Rollback failed");
      showToast("Rollback done ✅");
      await refreshBatches();
    } catch (e: any) {
      showToast(`Rollback failed: ${e?.message || "Error"}`);
    }
  }

  return (
    <div className="rp-app">
      {/* Background */}
      <div className="rp-bg" aria-hidden="true">
        <div className="rp-bg-orb rp-bg-orb--1" />
        <div className="rp-bg-orb rp-bg-orb--2" />
        <div className="rp-bg-orb rp-bg-orb--3" />
        <div className="rp-bg-grid" />
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            right: 18,
            top: 16,
            zIndex: 9999,
            padding: "10px 14px",
            borderRadius: 14,
            background: "rgba(255,255,255,.92)",
            border: "1px solid rgba(0,0,0,.12)",
            boxShadow: "0 16px 50px rgba(0,0,0,.18)",
            fontWeight: 950,
            backdropFilter: "blur(10px)",
            maxWidth: 520,
          }}
        >
          {toast}
        </div>
      )}

      <div className="rp-shell rp-enter">
        {/* Mobile top bar */}
        <div className="rp-mtop">
          <button type="button" className="rp-icon-btn rp-burger" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <span aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>

          <div className="rp-mtop-brand">
            <div className="rp-mtop-title">RampotteryHUB</div>
            <div className="rp-mtop-sub">Customer Import</div>
          </div>

          <button type="button" className="rp-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "☀" : "🌙"}
          </button>
        </div>

        {/* Overlay + Drawer */}
        <button className={`rp-overlay ${drawerOpen ? "is-open" : ""}`} onClick={() => setDrawerOpen(false)} aria-label="Close menu" />
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
              {[
                { href: "/", label: "Dashboard" },
                { href: "/invoices", label: "Invoices" },
                { href: "/credit-notes", label: "Credit Notes" },
                { href: "/stock", label: "Stock & Categories" },
                { href: "/stock-movements", label: "Stock Movements" },
                { href: "/customers", label: "Customers" },
                { href: "/reports", label: "Reports & Statements" },
              ].map((it) => (
                <Link key={it.href} className={`rp-nav-btn ${it.href === "/customers" ? "rp-nav-btn--active" : ""}`} href={it.href} onClick={() => setDrawerOpen(false)}>
                  <span className="rp-ic3d" aria-hidden="true">
                    ▶
                  </span>
                  {it.label}
                </Link>
              ))}
            </nav>

            <div className="rp-side-footer rp-side-footer--in">
              <div className="rp-role">
                <span>Role</span>
                <b>{userRole || "—"}</b>
              </div>
              <div className="rp-role" style={{ marginTop: 10 }}>
                <span>Import</span>
                <b>{isAdmin ? "Admin enabled" : "Locked"}</b>
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
              {[
                { href: "/", label: "Dashboard" },
                { href: "/invoices", label: "Invoices" },
                { href: "/credit-notes", label: "Credit Notes" },
                { href: "/stock", label: "Stock & Categories" },
                { href: "/stock-movements", label: "Stock Movements" },
                { href: "/customers", label: "Customers" },
                { href: "/reports", label: "Reports & Statements" },
              ].map((it) => (
                <Link key={it.href} className={`rp-nav-btn ${it.href === "/customers" ? "rp-nav-btn--active" : ""}`} href={it.href}>
                  <span className="rp-ic3d" aria-hidden="true">
                    ▶
                  </span>
                  {it.label}
                </Link>
              ))}
            </nav>

            <div className="rp-side-footer rp-side-footer--in">
              <div className="rp-role">
                <span>Role</span>
                <b>{userRole || "—"}</b>
              </div>
              <div className="rp-role" style={{ marginTop: 10 }}>
                <span>Import</span>
                <b>{isAdmin ? "Admin enabled" : "Locked"}</b>
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
              <div className="rp-exec__title">Customer Import</div>
              <div className="rp-exec__sub">
                Upload <b>CSV / Excel</b> • Preview • <b>Dry Run</b> • Import • Rollback (Admin)
              </div>
            </div>
            <div className="rp-exec__right">
              <span className={`rp-chip rp-chip--soft ${isAdmin ? "" : "rp-chip--warn"}`}>{isAdmin ? "Admin enabled" : "Locked"}</span>
              <span className="rp-chip">Max {MAX_FILE_MB}MB</span>
            </div>
          </section>

          {/* KPI row */}
          <section className="rp-kpi-pro rp-card-anim">
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Rows loaded</div>
              <div className="rp-kpi-pro__value">{summary.total}</div>
              <div className="rp-kpi-pro__sub">Current preview set</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Valid</div>
              <div className="rp-kpi-pro__value">{summary.ok}</div>
              <div className="rp-kpi-pro__sub">Ready</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Errors</div>
              <div className="rp-kpi-pro__value">{summary.bad}</div>
              <div className="rp-kpi-pro__sub">Fix and re-upload</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Batches</div>
              <div className="rp-kpi-pro__value">{batches.length}</div>
              <div className="rp-kpi-pro__sub">Server history</div>
            </div>
          </section>

          {/* Actions */}
          <section className="rp-actions rp-card-anim">
            <div className="rp-seg rp-seg--pro">
              <Link className="rp-seg-item rp-seg-item--brand" href="/customers">
                <span className="rp-icbtn" aria-hidden="true">
                  ←
                </span>
                Customers
              </Link>

              <button className="rp-seg-item rp-seg-item--brand" type="button" onClick={downloadTemplate}>
                <span className="rp-icbtn" aria-hidden="true">
                  ⬇
                </span>
                Template
              </button>

              {isAdmin ? (
                <button className="rp-seg-item rp-seg-item--brand" type="button" onClick={openImport}>
                  <span className="rp-icbtn" aria-hidden="true">
                    ⬆
                  </span>
                  Import Customers
                </button>
              ) : (
                <button className="rp-seg-item" type="button" disabled title="Admin only">
                  <span className="rp-icbtn" aria-hidden="true">
                    🔒
                  </span>
                  Import Locked
                </button>
              )}

              <button className="rp-seg-item rp-seg-item--brand" type="button" onClick={refreshBatches} disabled={loadingBatches}>
                <span className="rp-icbtn" aria-hidden="true">
                  ↻
                </span>
                {loadingBatches ? "Refreshing…" : "Refresh Batches"}
              </button>
            </div>
          </section>

          {/* Import batches (server) */}
          <section className="rp-card rp-card-anim">
            <div className="rp-card-head rp-card-head--tight">
              <div>
                <div className="rp-card-title">Import Batches (Server)</div>
                <div className="rp-card-sub">Each import creates a batch • Admin can rollback a batch</div>
              </div>
              <span className="rp-chip rp-chip--soft">{batches.length} record(s)</span>
            </div>

            <div className="rp-card-body">
              {batches.length === 0 ? (
                <div className="rp-td-empty">No batches yet.</div>
              ) : (
                <div className="rp-table-wrap">
                  <table className="rp-table rp-table--premium">
                    <thead>
                      <tr>
                        <th style={{ width: 190 }}>Date</th>
                        <th>File</th>
                        <th style={{ width: 120 }}>By</th>
                        <th style={{ width: 90 }}>Status</th>
                        <th style={{ width: 120, textAlign: "right" }}>Rows</th>
                        <th style={{ width: 140, textAlign: "right" }}>Valid</th>
                        <th style={{ width: 120, textAlign: "right" }}>Errors</th>
                        <th style={{ width: 160 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batches.map((b) => {
                        const status = String(b.status || "—");
                        const rolled = Boolean(b.rolled_back_at);
                        return (
                          <tr key={b.id}>
                            <td className="rp-strong">{fmtTime(b.created_at)}</td>
                            <td className="rp-strong">{b.filename || "—"}</td>
                            <td>{b.created_by || "—"}</td>
                            <td>
                              {rolled ? (
                                <span className="rp-status rp-status-cancelled">
                                  <span className="rp-status-dot" />
                                  ROLLED_BACK
                                </span>
                              ) : status.toUpperCase() === "DONE" ? (
                                <span className="rp-status rp-status-approved">
                                  <span className="rp-status-dot" />
                                  DONE
                                </span>
                              ) : (
                                <span className="rp-status rp-status-pending">
                                  <span className="rp-status-dot" />
                                  {status}
                                </span>
                              )}
                            </td>
                            <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{n0(b.row_count)}</td>
                            <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{n0(b.valid_count)}</td>
                            <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{n0(b.error_count)}</td>
                            <td>
                              {isAdmin ? (
                                <button
                                  type="button"
                                  className="rp-btn-red-outline"
                                  disabled={rolled}
                                  onClick={() => rollbackBatch(String(b.id))}
                                  title={rolled ? "Already rolled back" : "Rollback this batch"}
                                >
                                  {rolled ? "Rolled back" : "Rollback"}
                                </button>
                              ) : (
                                <button type="button" className="rp-btn-red-outline" disabled title="Admin only">
                                  🔒 Locked
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* How it works */}
          <section className="rp-card rp-card-anim">
            <div className="rp-card-head rp-card-head--tight">
              <div>
                <div className="rp-card-title">How it works</div>
                <div className="rp-card-sub">
                  Uses <b>/api/customers/bulk-import</b> (Dry Run + Import) • Creates a server batch
                </div>
              </div>
              <span className="rp-chip">CSV + XLSX</span>
            </div>

            <div className="rp-card-body" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <span className="rp-status rp-status-issued">
                <span className="rp-status-dot" />
                Required: customer_code, customer_name, client_name, address, phone_no, whatsapp_no, brn, vat_no
              </span>
              <span className="rp-status rp-status-approved">
                <span className="rp-status-dot" />
                Dry Run validates server-side before Import
              </span>
              <span className="rp-status rp-status-pending">
                <span className="rp-status-dot" />
                Optional: Delete all existing customers before import
              </span>
            </div>
          </section>

          <footer className="rp-footer">© {new Date().getFullYear()} Ram Pottery Ltd • Built by Mobiz.mu</footer>
        </main>

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          style={{ display: "none" }}
          onChange={async (e) => {
            const input = e.currentTarget;
            const file = input.files?.[0];
            if (!file) return;
            input.value = "";
            await handleFile(file);
          }}
        />

        {/* Modal */}
        {importOpen && (
          <div className="rp-modal-backdrop" onClick={() => (isImporting ? null : setImportOpen(false))}>
            <div
              className="rp-modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(1100px, calc(100vw - 32px))",
                maxHeight: "min(82vh, 780px)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div className="rp-modal-head">
                <div className="rp-modal-title">Import Preview (CSV / XLSX)</div>
                <button className="rp-modal-x" onClick={() => (isImporting ? null : setImportOpen(false))} aria-label="Close">
                  ✕
                </button>
              </div>

              <div className="rp-modal-body" style={{ overflow: "auto", paddingBottom: 18 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
                  <button className="rp-btn-red" type="button" onClick={() => fileRef.current?.click()}>
                    Choose File
                  </button>
                  <button className="rp-btn-red-outline" type="button" onClick={downloadTemplate}>
                    ⬇ Download Template
                  </button>

                  <div style={{ fontWeight: 950, color: "rgba(0,0,0,.62)" }}>
                    Rows: <b>{summary.total}</b> • Valid: <b>{summary.ok}</b> • Errors: <b>{summary.bad}</b>
                    {pickedFileName ? (
                      <>
                        {" "}
                        • File: <b>{pickedFileName}</b> ({pickedFileType})
                      </>
                    ) : null}
                  </div>
                </div>

                {/* ✅ Toggle clear existing */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10, alignItems: "center" }}>
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 14,
                      border: "1px solid rgba(0,0,0,.10)",
                      background: "rgba(255,255,255,.7)",
                      fontWeight: 950,
                    }}
                    title="If enabled, Import will delete all existing customers first."
                  >
                    <input
                      type="checkbox"
                      checked={clearExisting}
                      onChange={(e) => setClearExisting(e.target.checked)}
                      disabled={!isAdmin || isImporting}
                      style={{ width: 18, height: 18 }}
                    />
                    Delete all existing customers before import
                  </label>

                  <input
                    className="rp-input-premium"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search in preview (code / name / phone / whatsapp)…"
                    style={{ width: 520, maxWidth: "100%" }}
                  />
                  <div style={{ fontWeight: 950, color: "rgba(0,0,0,.62)" }}>
                    Preview: <b>{Math.min(filteredPreview.length, 50)}</b> row(s)
                  </div>
                </div>

                {err && (
                  <div
                    style={{
                      color: "rgba(227,6,19,0.95)",
                      fontWeight: 950,
                      marginBottom: 10,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {err}
                  </div>
                )}

                {rows.length > 0 && (
                  <div className="rp-table-wrap" style={{ border: "1px solid rgba(0,0,0,.08)", borderRadius: 14 }}>
                    <table className="rp-table">
                      <thead>
                        <tr>
                          <th style={{ width: 64 }}>Row</th>
                          <th style={{ width: 140 }}>Code</th>
                          <th>Name</th>
                          <th style={{ width: 160 }}>Phone</th>
                          <th style={{ width: 160 }}>WhatsApp</th>
                          <th style={{ width: 160 }}>BRN</th>
                          <th style={{ width: 160 }}>VAT No</th>
                          <th style={{ width: 220 }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPreview.slice(0, 50).map((r) => (
                          <tr key={`${r.rowNo}-${r.customer_code}-${r.phone_no}-${r.whatsapp_no}`}>
                            <td>{r.rowNo}</td>
                            <td style={{ fontWeight: 950 }}>{r.customer_code || "—"}</td>
                            <td style={{ fontWeight: 950 }}>{r.customer_name || "—"}</td>
                            <td>{r.phone_no || "—"}</td>
                            <td>{r.whatsapp_no || "—"}</td>
                            <td>{r.brn || "—"}</td>
                            <td>{r.vat_no || "—"}</td>
                            <td>
                              {r.error ? (
                                <span className="rp-status rp-status-cancelled">
                                  <span className="rp-status-dot" />
                                  {r.error}
                                </span>
                              ) : (
                                <span className="rp-status rp-status-approved">
                                  <span className="rp-status-dot" />
                                  Ready
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {rows.length > 50 && (
                  <div style={{ marginTop: 8, fontWeight: 950, color: "rgba(0,0,0,.6)" }}>Preview limited to first 50 rows.</div>
                )}
              </div>

              <div className="rp-modal-foot" style={{ display: "flex", gap: 10 }}>
                <button className="rp-btn-red-outline" type="button" onClick={() => setImportOpen(false)} disabled={isImporting}>
                  Cancel
                </button>

                {/* ✅ DRY RUN */}
                <button
                  className="rp-btn-red-outline"
                  type="button"
                  onClick={() => callBulk("DRY_RUN")}
                  disabled={isImporting || apiRows.length === 0}
                  title="Validate on server without writing to DB"
                >
                  {isImporting ? "Working…" : "Dry Run"}
                </button>

                {/* ✅ IMPORT */}
                <button
                  className="rp-btn-red"
                  type="button"
                  onClick={() => callBulk("IMPORT")}
                  disabled={isImporting || summary.ok === 0 || !isAdmin}
                  title={!isAdmin ? "Admin only" : "Import to database"}
                >
                  {isImporting ? "Importing…" : `Import ${summary.ok} Customer(s)`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
