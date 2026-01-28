// app/customers/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { rpFetch } from "@/lib/rpFetch";

type Customer = {
  id: number | string;
  customer_code?: string | null;
  name?: string | null; // customer_name
  client?: string | null; // client_name
  address?: string | null;
  phone?: string | null; // phone_no
  whatsapp?: string | null; // whatsapp_no
  brn?: string | null;
  vat_no?: string | null;
  discount_percent?: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
};

type RpSession = {
  id?: string;
  username?: string;
  name?: string;
  role?: string;
};

function safeStr(v: unknown) {
  return String(v ?? "").trim();
}

function n0(v: any) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

function fmtPct(v: any) {
  const num = Math.min(Math.max(n0(v), 0), 100);
  return `${num}%`;
}

function roleUpper(r?: string) {
  return String(r || "").toUpperCase();
}
function isAdmin(r?: string) {
  return roleUpper(r) === "ADMIN";
}
function isManager(r?: string) {
  return roleUpper(r) === "MANAGER";
}
function isPrivileged(r?: string) {
  return isAdmin(r) || isManager(r);
}

function fmtDateTime(d: Date) {
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;
}

export default function CustomersPage() {
  const router = useRouter();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lastSync, setLastSync] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<RpSession | null>(null);

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const debounceRef = useRef<number | null>(null);

  const [filter, setFilter] = useState<"ALL" | "WITH_VAT" | "WITH_BRN">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "ARCHIVED" | "ALL">("ACTIVE");

  // ⋮ menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const openMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);

    const saved = localStorage.getItem("rp_theme");
    const initial = saved === "dark" ? "dark" : "light";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;

    try {
      const raw = localStorage.getItem("rp_user");
      if (!raw) {
        router.replace("/login");
        return;
      }
      const s = JSON.parse(raw);
      setSession(s);
    } catch {
      router.replace("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!openMenuId) return;
      const t = e.target as Node | null;
      if (openMenuRef.current && t && openMenuRef.current.contains(t)) return;
      setOpenMenuId(null);
    }
    function onKey(e: KeyboardEvent) {
      if (!openMenuId) return;
      if (e.key === "Escape") setOpenMenuId(null);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenuId]);

  const userLabel = useMemo(() => {
    const name = (session?.name || session?.username || "").trim();
    return name ? name : "User";
  }, [session]);

  const roleLabel = useMemo(() => roleUpper(session?.role) || "STAFF", [session]);

  const canSeeAdminNav = mounted && isAdmin(session?.role);
  const canBulkImport = mounted && isPrivileged(session?.role);

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

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => setDebouncedQ(q.trim()), 220);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [q]);

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

  async function load(nextStatus?: "ACTIVE" | "ARCHIVED" | "ALL") {
    try {
      setErr(null);
      setLoading(true);

      const st = nextStatus || statusFilter;
      const showArchived = st === "ARCHIVED" || st === "ALL" ? "1" : "0";

      const res = await rpFetch(`/api/customers/list?showArchived=${showArchived}`, { method: "GET", cache: "no-store" });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed to load customers");

      const list: Customer[] = Array.isArray(json.customers) ? json.customers : [];
      setCustomers(list);
      setLastSync(fmtDateTime(new Date()));
    } catch (e: any) {
      setErr(e?.message || "Failed to load customers");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = debouncedQ.toLowerCase();
    let list = customers;

    // status filter (client-side for ALL mode)
    if (statusFilter === "ACTIVE") list = list.filter((c) => c.is_active !== false);
    if (statusFilter === "ARCHIVED") list = list.filter((c) => c.is_active === false);

    if (filter === "WITH_VAT") list = list.filter((c) => safeStr(c.vat_no));
    if (filter === "WITH_BRN") list = list.filter((c) => safeStr(c.brn));

    if (!s) return list;

    return list.filter((c) => {
      const blob = [
        c.customer_code,
        c.name,
        c.client,
        c.address,
        c.phone,
        c.whatsapp,
        c.brn,
        c.vat_no,
        String(c.discount_percent ?? ""),
      ]
        .map(safeStr)
        .join(" ")
        .toLowerCase();

      return blob.includes(s);
    });
  }, [customers, debouncedQ, filter, statusFilter]);

  const kpis = useMemo(() => {
    const total = filtered.length;
    const withVat = filtered.filter((c) => safeStr(c.vat_no)).length;
    const withBrn = filtered.filter((c) => safeStr(c.brn)).length;
    const missingCode = filtered.filter((c) => !safeStr(c.customer_code)).length;
    const avgDisc =
      total === 0 ? 0 : Math.round((filtered.reduce((a, c) => a + n0(c.discount_percent), 0) / total) * 10) / 10;
    return { total, withVat, withBrn, missingCode, avgDisc };
  }, [filtered]);

  function toggleRowMenu(id: string) {
    setOpenMenuId((cur) => (cur === id ? null : id));
  }

  function goTo(path: string) {
    setOpenMenuId(null);
    router.push(path);
  }

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
          <button type="button" className="rp-icon-btn rp-burger" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <span aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>

          <div className="rp-mtop-brand">
            <div className="rp-mtop-title">RampotteryHUB</div>
            <div className="rp-mtop-sub">Customers</div>
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
              {navItems.map((it) => (
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
              <div className="rp-exec__title">Customers</div>
              <div className="rp-exec__sub">
                Format: <b>Code • Customer • Client • Address • Phone • WhatsApp • BRN • VAT • Discount</b>
              </div>
            </div>
            <div className="rp-exec__right">
              <span className={`rp-live ${loading ? "is-dim" : ""}`}>
                <span className="rp-live-dot" aria-hidden="true" />
                {loading ? "Syncing" : "Live"}
              </span>
              <span className={`rp-chip rp-chip--soft ${err ? "rp-chip--warn" : ""}`}>{err ? "Attention needed" : "All systems normal"}</span>
            </div>
          </section>

          {/* KPI row */}
          <section className="rp-kpi-pro rp-card-anim">
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Customers</div>
              <div className="rp-kpi-pro__value">{kpis.total}</div>
              <div className="rp-kpi-pro__sub">Filtered</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">With VAT</div>
              <div className="rp-kpi-pro__value">{kpis.withVat}</div>
              <div className="rp-kpi-pro__sub">VAT No present</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">With BRN</div>
              <div className="rp-kpi-pro__value">{kpis.withBrn}</div>
              <div className="rp-kpi-pro__sub">BRN present</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Avg Discount</div>
              <div className="rp-kpi-pro__value">{kpis.avgDisc}%</div>
              <div className="rp-kpi-pro__sub">Across results</div>
            </div>
          </section>

          {/* Quick actions */}
          <section className="rp-actions rp-card-anim">
            <div className="rp-seg rp-seg--pro">
              <button type="button" className="rp-seg-item rp-seg-item--brand" onClick={() => load()} disabled={loading}>
                <span className="rp-icbtn" aria-hidden="true">
                  ⟳
                </span>
                Refresh
              </button>

              <Link className="rp-seg-item rp-seg-item--brand" href="/customers/new">
                <span className="rp-icbtn" aria-hidden="true">
                  👤
                </span>
                New Customer
              </Link>

              {canBulkImport ? (
                <Link className="rp-seg-item rp-seg-item--brand" href="/customers/pricing-import">
                  <span className="rp-icbtn" aria-hidden="true">
                    ⬆
                  </span>
                  Bulk Import
                </Link>
              ) : (
                <button type="button" className="rp-seg-item" disabled title="Admin/Manager only">
                  <span className="rp-icbtn" aria-hidden="true">
                    🔒
                  </span>
                  Bulk Import
                </button>
              )}
            </div>
          </section>

          {/* Search + filters */}
          <section className="rp-card rp-card-anim">
            <div className="rp-card-head rp-card-head--tight">
              <div>
                <div className="rp-card-title">Search & Filters</div>
                <div className="rp-card-sub">Code • customer • client • phone • whatsapp • BRN • VAT • discount</div>
              </div>
              <span className={`rp-chip ${loading ? "is-dim" : ""}`}>{loading ? "Loading…" : "Ready"}</span>
            </div>

            <div className="rp-card-body">
              <input className="rp-input rp-input--full" placeholder="Search customers…" value={q} onChange={(e) => setQ(e.target.value)} />

              <div className="rp-chip-row" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                {[
                  { key: "ACTIVE", label: "Active" },
                  { key: "ARCHIVED", label: "Archived" },
                  { key: "ALL", label: "All" },
                ].map((x) => (
                  <button
                    key={x.key}
                    className={`rp-filter-pill ${statusFilter === (x.key as any) ? "rp-filter-pill--active" : ""}`}
                    type="button"
                    onClick={() => {
                      const next = x.key as any;
                      setStatusFilter(next);
                      // fetch archived data when needed
                      if (next === "ARCHIVED" || next === "ALL") load(next);
                    }}
                  >
                    {x.label}
                  </button>
                ))}
              </div>

              <div className="rp-chip-row">
                {[
                  { key: "ALL", label: "All" },
                  { key: "WITH_VAT", label: "With VAT" },
                  { key: "WITH_BRN", label: "With BRN" },
                ].map((x) => (
                  <button
                    key={x.key}
                    className={`rp-filter-pill ${filter === (x.key as any) ? "rp-filter-pill--active" : ""}`}
                    onClick={() => setFilter(x.key as any)}
                    type="button"
                  >
                    {x.label}
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
                <div className="rp-card-title">Customer Register</div>
                <div className="rp-card-sub">Matches your import file format</div>
              </div>
              <span className="rp-chip rp-chip--soft">{filtered.length} result(s)</span>
            </div>

            <div className="rp-card-body rp-table-wrap">
              <table className="rp-table rp-table--premium">
                <thead>
                  <tr>
                    <th style={{ width: 120 }}>Code</th>
                    <th style={{ width: 220 }}>Customer</th>
                    <th style={{ width: 180 }}>Client</th>
                    <th>Address</th>
                    <th style={{ width: 130 }}>Phone</th>
                    <th style={{ width: 140 }}>WhatsApp</th>
                    <th style={{ width: 150 }}>BRN</th>
                    <th style={{ width: 150 }}>VAT</th>
                    <th style={{ width: 110, textAlign: "right" }}>Discount</th>
                    <th style={{ width: 80, textAlign: "right" }}>⋮</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="rp-td-empty">
                        Loading customers…
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="rp-td-empty">
                        No customers found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => {
                      const id = String(c.id);
                      const code = safeStr(c.customer_code) || "—";
                      const customerName = safeStr(c.name) || "—";
                      const clientName = safeStr(c.client) || "—";
                      const addr = safeStr(c.address) || "—";

                      const isOpen = openMenuId === id;
                      const archived = c.is_active === false;

                      return (
                        <tr key={id} style={archived ? { opacity: 0.72 } : undefined}>
                          <td className="rp-strong">{code}</td>
                          <td className="rp-strong">{customerName}</td>
                          <td>{clientName}</td>
                          <td>{addr}</td>
                          <td>{safeStr(c.phone) || "—"}</td>
                          <td>{safeStr(c.whatsapp) || "—"}</td>
                          <td>{safeStr(c.brn) || "—"}</td>
                          <td>{safeStr(c.vat_no) || "—"}</td>
                          <td style={{ textAlign: "right", fontWeight: 950 }}>{fmtPct(c.discount_percent)}</td>

                          <td style={{ textAlign: "right" }}>
                            <div
                              className="rp-row-actions"
                              ref={isOpen ? openMenuRef : undefined}
                              style={{ position: "relative", display: "inline-block" }}
                            >
                              <button
                                type="button"
                                className="rp-icon-btn rp-icon-btn--kebab"
                                aria-haspopup="menu"
                                aria-expanded={isOpen ? "true" : "false"}
                                onClick={() => setOpenMenuId((cur) => (cur === id ? null : id))}
                                title="Actions"
                              >
                                ⋮
                              </button>

                              {isOpen ? (
                                <div
                                  className="rp-menu rp-menu--right"
                                  role="menu"
                                  aria-label="Customer actions"
                                  style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", minWidth: 180, zIndex: 50 }}
                                >
                                  <button type="button" role="menuitem" className="rp-menu-item" onClick={() => goTo(`/customers/${id}/edit`)}>
                                    ✏️ Edit
                                  </button>
                                  <button type="button" role="menuitem" className="rp-menu-item" onClick={() => goTo(`/customers/${id}/pricing`)}>
                                    💰 Pricing
                                  </button>
                                  <button type="button" role="menuitem" className="rp-menu-item" onClick={() => goTo(`/customers/${id}/activity`)}>
                                    📌 Activity
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              <div style={{ marginTop: 10 }} className="rp-muted">
                Tip: import file headers must be exactly:{" "}
                <b>customer_code, customer_name, client_name, address, phone_no, whatsapp_no, brn, vat_no, discount</b>
              </div>
            </div>
          </section>

          <footer className="rp-footer">© {new Date().getFullYear()} Ram Pottery Ltd • Built by Mobiz.mu</footer>
        </main>
      </div>
    </div>
  );
}
