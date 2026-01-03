"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { rpFetch } from "@/lib/rpFetch";

type RpSession = {
  id?: string;
  username?: string;
  name?: string;
  role?: string;
};

type CustomerLite = {
  name?: string | null;
  customer_code?: string | null;
};

type CreditNoteRow = {
  id: number;
  credit_note_number: string | null;
  credit_note_date: string | null;
  total_amount: number | string | null;
  status: string | null;
  customers?: CustomerLite | CustomerLite[] | null;
};

type FilterKey = "ALL" | "ISSUED" | "PENDING" | "REFUNDED" | "VOID";

function roleUpper(r?: string) {
  return String(r || "").toUpperCase();
}
function isAdmin(r?: string) {
  return roleUpper(r) === "ADMIN";
}

function n2(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}
function money(v: any) {
  return n2(v).toFixed(2);
}

function fmtDate(d: any) {
  if (!d) return "—";
  try {
    const x = new Date(d);
    if (Number.isNaN(x.getTime())) return String(d);
    return x.toLocaleDateString("en-GB");
  } catch {
    return String(d);
  }
}
function fmtDateTime(d: Date) {
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function normalizeCustomer(c: CreditNoteRow["customers"]): CustomerLite | null {
  if (!c) return null;
  if (Array.isArray(c)) return (c[0] as any) || null;
  return c as any;
}

function badgeForCredit(status: any): { key: FilterKey; label: string; cls: string } {
  const s = String(status || "").toUpperCase();

  if (s === "VOID") return { key: "VOID", label: "VOID", cls: "rp-badge rp-badge--void" };
  if (s === "REFUNDED") return { key: "REFUNDED", label: "REFUNDED", cls: "rp-badge rp-badge--refunded" };
  if (s === "PENDING") return { key: "PENDING", label: "PENDING", cls: "rp-badge rp-badge--pending" };

  return { key: "ISSUED", label: "ISSUED", cls: "rp-badge rp-badge--issued" };
}

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const esc = (s: any) => {
    const str = String(s ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };

  const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

function mapRow(r: any): CreditNoteRow {
  return {
    id: Number(r?.id || 0),
    credit_note_number: r?.credit_note_number ?? null,
    credit_note_date: r?.credit_note_date ?? null,
    total_amount: r?.total_amount ?? 0,
    status: r?.status ?? "ISSUED",
    customers: r?.customers ?? null,
  };
}

export default function CreditNotesPage() {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement | null>(null);

  // UI shell
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<RpSession | null>(null);
  const [lastSync, setLastSync] = useState<string>("—");

  // Data
  const [rows, setRows] = useState<CreditNoteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Filters
  const [qDraft, setQDraft] = useState("");
  const [qApplied, setQApplied] = useState("");
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setMounted(true);

    const saved = localStorage.getItem("rp_theme");
    const initial = saved === "dark" ? "dark" : "light";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;

    try {
      const raw = localStorage.getItem("rp_user");
      if (raw) setSession(JSON.parse(raw));
    } catch {
      setSession(null);
    }
  }, []);

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

  const canSeeAdminNav = mounted && isAdmin(session?.role);
  const navItems = useMemo(() => {
    const base = [
      { href: "/", label: "Dashboard" },
      { href: "/invoices", label: "Invoices" },
      { href: "/credit-notes", label: "Credit Notes" },
      { href: "/stock", label: "Stock & Categories" },
      { href: "/stock-movements", label: "Stock Movements" },
      { href: "/customers", label: "Customers" },
      { href: "/reports", label: "Reports & Statements" },
    ];
    if (canSeeAdminNav) base.push({ href: "/admin/users", label: "Users & Permissions" });
    return base;
  }, [canSeeAdminNav]);

  const userLabel = useMemo(() => {
    const name = (session?.name || session?.username || "").trim();
    return name ? name : "User";
  }, [session]);

  const roleLabel = useMemo(() => roleUpper(session?.role) || "STAFF", [session]);

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      const res = await rpFetch("/api/credit-notes", { cache: "no-store" });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || json?.ok === false) {
        throw new Error(json?.error || "Failed to load credit notes");
      }

      const listRaw = json?.creditNotes ?? [];
      const mapped = Array.isArray(listRaw) ? listRaw.map(mapRow) : [];
      mapped.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRows(mapped);

      setLastSync(fmtDateTime(new Date()));
    } catch (e: any) {
      setErr(e?.message || "Failed to load credit notes");
      setRows([]);
      setLastSync(fmtDateTime(new Date()));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPulse(qDraft.trim() !== qApplied.trim());
  }, [qDraft, qApplied]);

  function applySearch() {
    setQApplied(qDraft.trim());
  }

  function clearAll() {
    setQDraft("");
    setQApplied("");
    setFilter("ALL");
  }

  const filtered = useMemo(() => {
    const needle = qApplied.trim().toLowerCase();

    return rows
      .filter((r) => {
        if (filter === "ALL") return true;
        const b = badgeForCredit(r.status);
        return b.key === filter;
      })
      .filter((r) => {
        if (!needle) return true;
        const c = normalizeCustomer(r.customers);
        const hay = [
          r.credit_note_number || "",
          r.credit_note_date || "",
          r.status || "",
          c?.name || "",
          c?.customer_code || "",
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(needle);
      });
  }, [rows, qApplied, filter]);

  const totals = useMemo(() => {
    const sumTotal = filtered.reduce((a, r) => a + n2(r.total_amount), 0);
    const pending = filtered.filter((r) => badgeForCredit(r.status).key === "PENDING").length;
    const issued = filtered.filter((r) => badgeForCredit(r.status).key === "ISSUED").length;
    const voided = filtered.filter((r) => badgeForCredit(r.status).key === "VOID").length;
    return { count: filtered.length, sumTotal, pending, issued, voided };
  }, [filtered]);

  function exportCsv() {
    const headers = ["Credit Note No", "Date", "Customer", "Customer Code", "Total (Rs)", "Status"];
    const dataRows = filtered.map((r) => {
      const c = normalizeCustomer(r.customers);
      const badge = badgeForCredit(r.status);
      return [
        r.credit_note_number || `#${r.id}`,
        fmtDate(r.credit_note_date),
        c?.name || "",
        c?.customer_code || "",
        money(r.total_amount),
        badge.label,
      ];
    });

    downloadCsv(`credit_notes_${new Date().toISOString().slice(0, 10)}.csv`, headers, dataRows);
  }

  function printListOnly() {
    const el = printRef.current;
    if (!el) return window.print();

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Credit Notes</title>
  <style>
    body{font-family: Arial, sans-serif; padding: 22px;}
    h1{font-size: 18px; margin: 0 0 10px;}
    .meta{color:#555;font-size:12px;margin:0 0 16px;}
    table{width:100%; border-collapse:collapse; font-size:12px;}
    th,td{border:1px solid #ddd; padding:8px; text-align:left;}
    th{background:#f4f4f4;}
    .right{text-align:right;}
  </style>
</head>
<body>
  <h1>Credit Notes</h1>
  <div class="meta">Generated: ${fmtDateTime(new Date())}</div>
  ${el.innerHTML}
  <script>window.onload=()=>window.print();</script>
</body>
</html>`;

    const w = window.open("", "_blank", "width=1000,height=700");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  const filterPills: Array<{ key: FilterKey; label: string }> = [
    { key: "ALL", label: "All" },
    { key: "ISSUED", label: "Issued" },
    { key: "PENDING", label: "Pending" },
    { key: "REFUNDED", label: "Refunded" },
    { key: "VOID", label: "Void" },
  ];

  return (
    <div className="rp-app">
      <div className="rp-bg" aria-hidden="true">
        <div className="rp-bg-orb rp-bg-orb--1" />
        <div className="rp-bg-orb rp-bg-orb--2" />
        <div className="rp-bg-orb rp-bg-orb--3" />
        <div className="rp-bg-grid" />
      </div>

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
            <div className="rp-mtop-sub">Credit Notes</div>
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
              {navItems.map((it) => (
                <Link
                  key={it.href}
                  className={`rp-nav-btn ${it.href === "/credit-notes" ? "rp-nav-btn--active" : ""}`}
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
                <span>Signed in</span>
                <b title={userLabel}>{mounted ? userLabel : "—"}</b>
              </div>
              <div className="rp-role" style={{ marginTop: 10 }}>
                <span>Role</span>
                <b>{mounted ? roleLabel : "—"}</b>
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
              {navItems.map((it) => (
                <Link
                  key={it.href}
                  className={`rp-nav-btn ${it.href === "/credit-notes" ? "rp-nav-btn--active" : ""}`}
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
                <span>Signed in</span>
                <b title={userLabel}>{mounted ? userLabel : "—"}</b>
              </div>
              <div className="rp-role" style={{ marginTop: 10 }}>
                <span>Role</span>
                <b>{mounted ? roleLabel : "—"}</b>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="rp-main">
          {/* Top header (same as invoices/dashboard) */}
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
              <div className="rp-exec__title">Credit Notes</div>
              <div className="rp-exec__sub">Search • Export • Print • Reprint (3–6 months later)</div>
            </div>
            <div className="rp-exec__right">
              <span className={`rp-live ${loading ? "is-dim" : ""}`}>
                <span className="rp-live-dot" aria-hidden="true" />
                {loading ? "Syncing" : "Live"}
              </span>
              <span className={`rp-chip rp-chip--soft ${err ? "rp-chip--warn" : ""}`}>
                {err ? "Attention needed" : "All systems normal"}
              </span>
            </div>
          </section>

          {/* KPI row */}
          <section className="rp-kpi-pro rp-card-anim">
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Credit Notes</div>
              <div className="rp-kpi-pro__value">{totals.count}</div>
              <div className="rp-kpi-pro__sub">Filtered results</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Total Value</div>
              <div className="rp-kpi-pro__value">Rs {money(totals.sumTotal)}</div>
              <div className="rp-kpi-pro__sub">Sum of totals</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Pending</div>
              <div className="rp-kpi-pro__value">{totals.pending}</div>
              <div className="rp-kpi-pro__sub">Awaiting action</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Voided</div>
              <div className="rp-kpi-pro__value">{totals.voided}</div>
              <div className="rp-kpi-pro__sub">Locked records</div>
            </div>
          </section>

          {/* Quick actions */}
          <section className="rp-actions rp-card-anim">
            <div className="rp-seg rp-seg--pro">
              <Link className="rp-seg-item rp-seg-item--brand" href="/credit-notes/new">
                <span className="rp-icbtn" aria-hidden="true">
                  🧾
                </span>
                New Credit Note
              </Link>

              <button className="rp-seg-item rp-seg-item--brand" type="button" onClick={exportCsv} disabled={loading}>
                <span className="rp-icbtn" aria-hidden="true">
                  ⬇
                </span>
                Export CSV
              </button>

              <button className="rp-seg-item rp-seg-item--brand" type="button" onClick={printListOnly}>
                <span className="rp-icbtn" aria-hidden="true">
                  🖨
                </span>
                Print
              </button>

              <button className="rp-seg-item rp-seg-item--brand" type="button" onClick={load} disabled={loading}>
                <span className="rp-icbtn" aria-hidden="true">
                  ⟳
                </span>
                {loading ? "Loading…" : "Refresh"}
              </button>
            </div>
          </section>

          {/* Search & Filters */}
          <section className="rp-card rp-card-anim">
            <div className="rp-card-head rp-card-head--tight">
              <div>
                <div className="rp-card-title">Search & Filters</div>
                <div className="rp-card-sub">Credit note • customer • status • code</div>
              </div>
              <span className={`rp-chip ${loading ? "is-dim" : ""}`}>{loading ? "Syncing…" : "Ready"}</span>
            </div>

            <div className="rp-card-body">
              <div className="rp-filters-row">
                <input
                  className="rp-input rp-input--full"
                  value={qDraft}
                  onChange={(e) => setQDraft(e.target.value)}
                  placeholder="Search credit note no, customer, status…"
                />

                <button
                  type="button"
                  className={`rp-ui-btn rp-ui-btn--brand ${pulse ? "rp-ui-btn--pulse" : ""}`}
                  onClick={applySearch}
                  title="Search"
                >
                  <span className="rp-ui-btn__dot" aria-hidden="true" />
                  Search
                </button>

                <button type="button" className="rp-ui-btn" onClick={clearAll} title="Clear">
                  <span className="rp-ui-btn__dot" aria-hidden="true" />
                  Clear
                </button>
              </div>

              <div className="rp-chip-row">
                {filterPills.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    className={`rp-filter-pill ${filter === p.key ? "rp-filter-pill--active" : ""}`}
                    onClick={() => setFilter(p.key)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {err ? <div className="rp-note rp-note--warn">{err}</div> : null}
            </div>
          </section>

          {/* Table */}
          <section className="rp-card rp-card-anim">
            <div className="rp-card-head rp-card-head--tight">
              <div>
                <div className="rp-card-title">Credit Note Register</div>
                <div className="rp-card-sub">Click number to open printable document</div>
              </div>
              <span className="rp-soft-pill">
                Showing <b>{filtered.length}</b>
              </span>
            </div>

            <div className="rp-card-body rp-table-wrap" style={{ paddingTop: 0 }}>
              <div ref={printRef}>
                <table className="rp-table rp-table--premium">
                  <thead>
                    <tr>
                      <th style={{ width: 230 }}>Credit Note No</th>
                      <th style={{ width: 140 }}>Date</th>
                      <th>Customer</th>
                      <th style={{ width: 160 }}>Code</th>
                      <th className="rp-right" style={{ width: 170 }}>
                        Total (Rs)
                      </th>
                      <th style={{ width: 180 }}>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="rp-td-empty">
                          {loading ? "Loading credit notes…" : "No credit notes found."}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((r) => {
                        const c = normalizeCustomer(r.customers);
                        const badge = badgeForCredit(r.status);
                        const isVoid = badge.key === "VOID";

                        return (
                          <tr key={r.id} className={isVoid ? "rp-row-locked" : ""}>
                            <td className="rp-strong">
                              {isVoid ? (
                                <span
                                  className="rp-row-link"
                                  title="VOID credit notes are locked"
                                  aria-disabled="true"
                                  style={{ cursor: "not-allowed", opacity: 0.75 }}
                                >
                                  {r.credit_note_number || `#${r.id}`}
                                </span>
                              ) : (
                                <Link className="rp-row-link" href={`/credit-notes/${r.id}`}>
                                  {r.credit_note_number || `#${r.id}`}
                                </Link>
                              )}
                            </td>

                            <td>{fmtDate(r.credit_note_date)}</td>
                            <td>
                              <div className="rp-strong">{c?.name || "—"}</div>
                            </td>
                            <td>{c?.customer_code || "—"}</td>

                            <td className="rp-right rp-strong" style={{ fontVariantNumeric: "tabular-nums" }}>
                              {money(r.total_amount)}
                            </td>

                            <td>
                              <span className={badge.cls}>{badge.label}</span>
                              {isVoid ? <span style={{ marginLeft: 8, opacity: 0.75, fontWeight: 900 }}>🔒</span> : null}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <footer className="rp-footer">© {new Date().getFullYear()} Ram Pottery Ltd • Built by Mobiz.mu</footer>
        </main>
      </div>

      {/* Page-only micro styles (safe, premium) */}
      <style jsx global>{`
        .rp-filters-row {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }
        .rp-ui-btn--pulse {
          position: relative;
        }
        .rp-ui-btn--pulse::after {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: 16px;
          border: 2px solid rgba(184, 0, 0, 0.22);
          animation: rpPulse 1.15s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes rpPulse {
          0% {
            opacity: 0.18;
            transform: scale(1);
          }
          50% {
            opacity: 0.34;
            transform: scale(1.01);
          }
          100% {
            opacity: 0.18;
            transform: scale(1);
          }
        }
        .rp-row-locked {
          opacity: 0.62;
        }
      `}</style>
    </div>
  );
}
