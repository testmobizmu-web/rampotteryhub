"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type CustomerImportRow = {
  rowNo: number;
  customer_code: string;
  name: string;
  address: string;
  phone: string;
  brn: string;
  vat_no: string;
  whatsapp: string;
  error?: string;
};

type ImportFileType = "CSV" | "XLSX";

type ImportHistoryEntry = {
  id: string;
  ts: number;
  fileName: string;
  fileType: ImportFileType;
  totalRows: number;
  validRows: number;
  imported: number;
  failed: number;
  notes?: string;
};

const HISTORY_KEY = "rp_import_history_customers_v1";

/** ✅ Best-practice guards */
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

function normalizeFileType(v: any): ImportFileType {
  const s = String(v || "").toUpperCase();
  return s === "XLSX" ? "XLSX" : "CSV";
}

function loadHistory(): ImportHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];

    const parsed: any = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(Boolean)
      .map((x: any): ImportHistoryEntry => ({
        id: String(x.id || ""),
        ts: n0(x.ts),
        fileName: String(x.fileName || x.filename || ""),
        fileType: normalizeFileType(x.fileType),
        totalRows: n0(x.totalRows),
        validRows: n0(x.validRows),
        imported: n0(x.imported),
        failed: n0(x.failed),
        notes: x.notes ? String(x.notes) : undefined,
      }))
      .filter((h) => h.id && h.ts)
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 20);
  } catch {
    return [];
  }
}

function saveHistory(list: ImportHistoryEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 20)));
  } catch {}
}

function fmtTime(ts: number) {
  try {
    const d = new Date(ts);
    return d.toLocaleString();
  } catch {
    return String(ts);
  }
}

function fmtDateTime(d: Date) {
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;
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

/** ✅ Basic client-side file guard (type + size) */
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
  const [importing, setImporting] = useState(false);

  const [rows, setRows] = useState<CustomerImportRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const [history, setHistory] = useState<ImportHistoryEntry[]>([]);

  // keep selected file info even after we reset <input>.value
  const [pickedFileName, setPickedFileName] = useState<string>("");
  const [pickedFileType, setPickedFileType] = useState<ImportFileType>("CSV");

  // success toast
  const [toast, setToast] = useState<string | null>(null);
  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  }

  useEffect(() => {
    // theme
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
      setHistory(loadHistory());
      setLastSync(fmtDateTime(new Date()));
    } catch {
      router.replace("/login");
    }
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
      `${r.customer_code} ${r.name} ${r.phone} ${r.whatsapp} ${r.vat_no} ${r.brn}`
        .toLowerCase()
        .includes(s)
    );
  }, [rows, q]);

  function openImport() {
    setErr(null);
    setRows([]);
    setQ("");
    setPickedFileName("");
    setPickedFileType("CSV");
    setImportOpen(true);
    setTimeout(() => fileRef.current?.click(), 120);
  }

  function downloadTemplate() {
    const csv = [
      "customer_code,name,address,phone,brn,vat_no,whatsapp",
      "CUST-001,Ram Trading Ltd,Royal Road Port Louis,51234567,BRN12345678,VAT123456,58277852",
      "CUST-002,Blue Stone Co,Quatre Bornes,59887766,BRN99887766,VAT998877,59000000",
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

  function mapMatrixToRows(matrix: any[][]): CustomerImportRow[] {
    if (!matrix || matrix.length < 2) {
      throw new Error("File is empty. Add at least one data row.");
    }

    const headers = (matrix[0] || []).map((h) => normalizeHeader(h));
    const idx = (key: string) => headers.findIndex((h) => h === key);

    const idxCode = idx("customer_code");
    const idxName = idx("name");
    const idxAddress = idx("address");
    const idxPhone = idx("phone");
    const idxBrn = idx("brn");
    const idxVat = idx("vat_no");
    const idxWa = idx("whatsapp");

    const required = [
      ["customer_code", idxCode],
      ["name", idxName],
      ["address", idxAddress],
      ["phone", idxPhone],
      ["brn", idxBrn],
      ["vat_no", idxVat],
      ["whatsapp", idxWa],
    ] as const;

    const missing = required.filter(([, i]) => i === -1).map(([k]) => k);
    if (missing.length) {
      throw new Error(
        `Missing column(s): ${missing.join(
          ", "
        )}\nRequired columns: customer_code, name, address, phone, brn, vat_no, whatsapp`
      );
    }

    const parsed: CustomerImportRow[] = [];

    for (let i = 1; i < matrix.length; i++) {
      const r = matrix[i] || [];
      const rowNo = i;

      const customer_code = safeUpper(r[idxCode]);
      const name = str(r[idxName]);
      const address = str(r[idxAddress]);
      const phone = str(r[idxPhone]);
      const brn = str(r[idxBrn]);
      const vat_no = str(r[idxVat]);
      const whatsapp = str(r[idxWa]);

      const row: CustomerImportRow = {
        rowNo,
        customer_code,
        name,
        address,
        phone,
        brn,
        vat_no,
        whatsapp,
      };

      if (!customer_code) row.error = "Missing customer_code";
      else if (!name) row.error = "Missing name";
      else if (!phone && !whatsapp) row.error = "Provide phone or whatsapp";

      parsed.push(row);
    }

    return parsed;
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
    setQ("");

    // store file details before we reset the input value
    const name = (file.name || "").trim() || "customers_import";
    setPickedFileName(name);

    const guard = await guardFile(file);
    if (!guard.ok) {
      setErr(guard.error);
      return;
    }
    setPickedFileType(guard.kind);

    try {
      const matrix = guard.kind === "CSV" ? await parseCsvFile(file) : await parseXlsxFile(file);
      const parsed = mapMatrixToRows(matrix);
      setRows(parsed);
    } catch (e: any) {
      setErr(e?.message || "Failed to read file.");
    }
  }

  async function runImport() {
    setErr(null);

    if (!isAdmin) {
      setErr("Locked: only Admin can import customers.");
      return;
    }

    const okRows = rows.filter((r) => !r.error);
    if (okRows.length === 0) {
      setErr("No valid rows to import.");
      return;
    }

    setImporting(true);

    const raw = localStorage.getItem("rp_user") || "";

    // Controlled concurrency (fast + safe)
    const concurrency = 8;
    let imported = 0;
    let failed = 0;

    async function postOne(r: CustomerImportRow) {
      const res = await fetch("/api/customers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-rp-user": raw },
        body: JSON.stringify({
          customer_code: r.customer_code,
          name: r.name,
          address: r.address,
          phone: r.phone,
          brn: r.brn,
          vat_no: r.vat_no,
          whatsapp: r.whatsapp,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed");
      return true;
    }

    const queue = okRows.slice();
    const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
      while (queue.length) {
        const r = queue.shift();
        if (!r) break;
        try {
          await postOne(r);
          imported++;
        } catch {
          failed++;
        }
      }
    });

    await Promise.all(workers);

    setImporting(false);

    const entry: ImportHistoryEntry = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      ts: Date.now(),
      fileName: pickedFileName || "customers_import",
      fileType: pickedFileType,
      totalRows: rows.length,
      validRows: okRows.length,
      imported,
      failed,
      notes: failed ? "Some rows failed. Re-check duplicates / DB constraints." : "Success",
    };

    const nextHistory = [entry, ...history].slice(0, 20);
    setHistory(nextHistory);
    saveHistory(nextHistory);

    showToast(`Import done ✅  Imported: ${imported}  Failed: ${failed}`);

    // close + reset
    setImportOpen(false);
    setRows([]);
    setQ("");
    setPickedFileName("");
    setPickedFileType("CSV");
    setLastSync(fmtDateTime(new Date()));
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
            <div className="rp-mtop-sub">Customer Import</div>
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
              {[
                { href: "/", label: "Dashboard" },
                { href: "/invoices", label: "Invoices" },
                { href: "/credit-notes", label: "Credit Notes" },
                { href: "/stock", label: "Stock & Categories" },
                { href: "/stock-movements", label: "Stock Movements" },
                { href: "/customers", label: "Customers" },
                { href: "/reports", label: "Reports & Statements" },
              ].map((it) => (
                <Link
                  key={it.href}
                  className={`rp-nav-btn ${it.href === "/customers" ? "rp-nav-btn--active" : ""}`}
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
                <Link
                  key={it.href}
                  className={`rp-nav-btn ${
                    it.href === "/customers" ? "rp-nav-btn--active" : ""
                  }`}
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
              <div className="rp-exec__title">Customer Pricing Import</div>
              <div className="rp-exec__sub">
                Upload <b>CSV / Excel</b> • Validate columns • Preview • Import (Admin only)
              </div>
            </div>
            <div className="rp-exec__right">
              <span className={`rp-chip rp-chip--soft ${isAdmin ? "" : "rp-chip--warn"}`}>
                {isAdmin ? "Admin enabled" : "Locked"}
              </span>
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
              <div className="rp-kpi-pro__sub">Ready to import</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Errors</div>
              <div className="rp-kpi-pro__value">{summary.bad}</div>
              <div className="rp-kpi-pro__sub">Fix and re-upload</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">History</div>
              <div className="rp-kpi-pro__value">{history.length}</div>
              <div className="rp-kpi-pro__sub">Last 20 runs</div>
            </div>
          </section>

          {/* Actions (3D segment buttons like dashboard/invoices) */}
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
            </div>
          </section>

          {/* Locked notice */}
          {!isAdmin && (
            <section className="rp-card rp-card-anim" style={{ border: "1px solid rgba(255,107,107,.22)" }}>
              <div className="rp-card-head rp-card-head--tight">
                <div>
                  <div className="rp-card-title">🔒 Import Locked</div>
                  <div className="rp-card-sub">Only <b>Admin</b> can import customers. You can still download the template.</div>
                </div>
                <span className="rp-chip rp-chip--warn">Permission required</span>
              </div>
              <div className="rp-card-body" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <span className="rp-status rp-status-cancelled">
                  <span className="rp-status-dot" />
                  No upload permissions
                </span>
                <span className="rp-status rp-status-issued">
                  <span className="rp-status-dot" />
                  Template download enabled
                </span>
              </div>
            </section>
          )}

          {/* Import history */}
          {/* Import history */}
<section className="rp-card rp-card-anim">
  <div className="rp-card-head rp-card-head--tight">
    <div>
      <div className="rp-card-title">Import History</div>
      <div className="rp-card-sub">Stored locally on this device (last 20)</div>
    </div>
    <span className="rp-chip rp-chip--soft">{history.length} record(s)</span>
  </div>

  <div className="rp-card-body">
    {history.length === 0 ? (
      <div className="rp-td-empty">No imports yet.</div>
    ) : (
      <>
        {/* ✅ Desktop table */}
        <div className="rp-desktop-only rp-table-wrap">
          <table className="rp-table rp-table--premium">
            <thead>
              <tr>
                <th style={{ width: 190 }}>Date</th>
                <th>File</th>
                <th style={{ width: 90 }}>Type</th>
                <th style={{ width: 110, textAlign: "right" }}>Rows</th>
                <th style={{ width: 120, textAlign: "right" }}>Imported</th>
                <th style={{ width: 100, textAlign: "right" }}>Failed</th>
                <th style={{ width: 240 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td className="rp-strong">{fmtTime(h.ts)}</td>
                  <td className="rp-strong">{h.fileName}</td>
                  <td>{h.fileType}</td>
                  <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {h.validRows}/{h.totalRows}
                  </td>
                  <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{h.imported}</td>
                  <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{h.failed}</td>
                  <td>
                    {h.failed ? (
                      <span className="rp-status rp-status-pending">
                        <span className="rp-status-dot" />
                        {h.notes || "Partial"}
                      </span>
                    ) : (
                      <span className="rp-status rp-status-approved">
                        <span className="rp-status-dot" />
                        {h.notes || "Success"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ✅ Mobile cards (Invoices-style) */}
        <div className="rp-mobile-only rp-history-cards">
          {history.map((h) => {
            const ok = !h.failed;
            return (
              <div key={h.id} className="rp-history-card">
                <div className="rp-history-card__top">
                  <div className="rp-history-card__file">
                    <div className="rp-strong" style={{ fontSize: 14, lineHeight: 1.2 }}>
                      {h.fileName}
                    </div>
                    <div className="rp-muted" style={{ marginTop: 2 }}>
                      {fmtTime(h.ts)} • {h.fileType}
                    </div>
                  </div>

                  <div>
                    {ok ? (
                      <span className="rp-status rp-status-approved">
                        <span className="rp-status-dot" />
                        {h.notes || "Success"}
                      </span>
                    ) : (
                      <span className="rp-status rp-status-pending">
                        <span className="rp-status-dot" />
                        {h.notes || "Partial"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="rp-history-card__grid">
                  <div className="rp-history-metric">
                    <div className="rp-history-metric__k">Rows</div>
                    <div className="rp-history-metric__v">
                      {h.validRows}/{h.totalRows}
                    </div>
                  </div>

                  <div className="rp-history-metric">
                    <div className="rp-history-metric__k">Imported</div>
                    <div className="rp-history-metric__v">{h.imported}</div>
                  </div>

                  <div className="rp-history-metric">
                    <div className="rp-history-metric__k">Failed</div>
                    <div className="rp-history-metric__v">{h.failed}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>
    )}
  </div>
</section>

          {/* How it works */}
          <section className="rp-card rp-card-anim">
            <div className="rp-card-head rp-card-head--tight">
              <div>
                <div className="rp-card-title">How it works</div>
                <div className="rp-card-sub">Imports customers using <b>/api/customers/create</b></div>
              </div>
              <span className="rp-chip">CSV + XLSX</span>
            </div>

            <div className="rp-card-body" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <span className="rp-status rp-status-issued">
                <span className="rp-status-dot" />
                Required columns: customer_code, name, address, phone, brn, vat_no, whatsapp
              </span>
              <span className="rp-status rp-status-approved">
                <span className="rp-status-dot" />
                Preview before import (first 50 rows)
              </span>
              <span className="rp-status rp-status-pending">
                <span className="rp-status-dot" />
                Guard: max {MAX_FILE_MB}MB & allowed extensions
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

            // ✅ reset immediately (so same file can be chosen again)
            input.value = "";

            await handleFile(file);
          }}
        />

        {/* Modal (kept exactly with your fixed sizing / overflow rules) */}
        {importOpen && (
          <div className="rp-modal-backdrop" onClick={() => (importing ? null : setImportOpen(false))}>
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
                <button
                  className="rp-modal-x"
                  onClick={() => (importing ? null : setImportOpen(false))}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div
                className="rp-modal-body"
                style={{
                  overflow: "auto",
                  paddingBottom: 18,
                }}
              >
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

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10, alignItems: "center" }}>
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
                          <tr key={`${r.rowNo}-${r.customer_code}-${r.phone}-${r.whatsapp}`}>
                            <td>{r.rowNo}</td>
                            <td style={{ fontWeight: 950 }}>{r.customer_code || "—"}</td>
                            <td style={{ fontWeight: 950 }}>{r.name || "—"}</td>
                            <td>{r.phone || "—"}</td>
                            <td>{r.whatsapp || "—"}</td>
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
                  <div style={{ marginTop: 8, fontWeight: 950, color: "rgba(0,0,0,.6)" }}>
                    Preview limited to first 50 rows.
                  </div>
                )}
              </div>

              <div className="rp-modal-foot">
                <button className="rp-btn-red-outline" type="button" onClick={() => setImportOpen(false)} disabled={importing}>
                  Cancel
                </button>
                <button
                  className="rp-btn-red"
                  type="button"
                  onClick={runImport}
                  disabled={importing || summary.ok === 0 || !isAdmin}
                  title={!isAdmin ? "Admin only" : undefined}
                >
                  {importing ? "Importing…" : `Import ${summary.ok} Customer(s)`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
