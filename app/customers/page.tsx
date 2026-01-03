"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { rpFetch } from "@/lib/rpFetch";

type CustomerRow = {
  id: number | string;
  customer_code?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  opening_balance?: number | string | null;
  client?: string | null;
};

type ActivityRow = {
  invoiceCount: number;
  totalSales: number;
  outstanding: number;
};

function fmtDateTime(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy}, ${hh}:${mi}:${ss}`;
}

function formatRs(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return `Rs ${v.toFixed(2)}`;
}

function safeNum(x: any) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

// rpFetch in your project sometimes behaves like Response in some pages;
// this helper makes it safe in all cases.
async function rpJson(url: string, options?: any) {
  const res = await rpFetch(url, options as any);
  return typeof (res as any)?.json === "function" ? await (res as any).json() : res;
}

export default function CustomersPage() {
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Keep hydration lock BUT do NOT return early before other hooks
  const [mounted, setMounted] = useState(false);

  const [loading, setLoading] = useState(true);
  const [busySearch, setBusySearch] = useState(false);
  const [busyDelete, setBusyDelete] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [activity, setActivity] = useState<Record<string, ActivityRow>>({});

  const [lastSync, setLastSync] = useState<string>("—");

  const [queryDraft, setQueryDraft] = useState("");
  const [queryApplied, setQueryApplied] = useState("");

  const [confirm, setConfirm] = useState<{ open: boolean; id?: string; name?: string }>({
    open: false,
  });

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function fetchCustomers(q: string) {
    const url = `/api/customers/list?limit=2000` + (q ? `&q=${encodeURIComponent(q)}` : ``);
    const json: any = await rpJson(url, { cache: "no-store" });

    if (!json?.ok) throw new Error(json?.error || "Failed to load customers");
    return Array.isArray(json.customers) ? json.customers : [];
  }

  async function fetchActivity() {
    // If you don't have this API yet, we fail silently.
    try {
      const json: any = await rpJson("/api/customers/activity", { cache: "no-store" });
      if (!json?.ok) return {};
      return json.activityByCustomerId || {};
    } catch {
      return {};
    }
  }

  async function load(q: string) {
    setErr(null);
    const data = await fetchCustomers(q);
    const act = await fetchActivity();

    setRows(data);
    setActivity(act);
    setLastSync(fmtDateTime(new Date()));
  }

  useEffect(() => {
    let alive = true;

    async function init() {
      setLoading(true);
      try {
        await load("");
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load customers");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    init();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleLogout() {
    try {
      localStorage.removeItem("rp_user");
      localStorage.removeItem("rpUser");
      localStorage.removeItem("user");
      localStorage.removeItem("rp_role");
      localStorage.removeItem("role");
    } catch {}
    router.push("/login");
  }

  async function doSearch(nextQuery: string) {
    const q = (nextQuery || "").trim();
    setBusySearch(true);
    setErr(null);

    try {
      await load(q);
      setQueryApplied(q);
    } catch (e: any) {
      setErr(e?.message || "Search failed");
    } finally {
      setBusySearch(false);
    }
  }

  function applySearch() {
    doSearch(queryDraft);
  }

  function clearSearch() {
    setQueryDraft("");
    setQueryApplied("");
    doSearch("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      applySearch();
    }
  }

  async function onRefresh() {
    await doSearch(queryApplied);
  }

  async function deleteCustomer(id: string) {
    setBusyDelete(true);
    setErr(null);

    try {
      const json: any = await rpJson(`/api/customers/${id}`, {
        method: "DELETE",
      });

      if (!json?.ok) throw new Error(json?.error || "Delete failed");

      setConfirm({ open: false });
      await onRefresh();
    } catch (e: any) {
      setErr(e?.message || "Delete failed");
    } finally {
      setBusyDelete(false);
    }
  }

  const stats = useMemo(() => {
    const total = rows.length;
    const openingSum = rows.reduce((s, x) => s + safeNum(x.opening_balance), 0);

    let invCount = 0;
    let outstanding = 0;

    Object.values(activity || {}).forEach((a) => {
      invCount += safeNum(a.invoiceCount);
      outstanding += safeNum(a.outstanding);
    });

    return { total, openingSum, invCount, outstanding };
  }, [rows, activity]);

  const searchChanged = queryDraft.trim() !== queryApplied.trim();

  // ✅ Now it’s safe to lock hydration (AFTER hooks)
  if (!mounted) return null;

  function SideNav() {
    return (
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

          <nav className="rp-nav" aria-label="Main navigation">
            <Link className={`rp-nav-btn ${pathname === "/" ? "rp-nav-btn--active" : ""}`} href="/" prefetch={false}>
              Dashboard
            </Link>

            <Link
              className={`rp-nav-btn ${pathname?.startsWith("/invoices") ? "rp-nav-btn--active" : ""}`}
              href="/invoices"
              prefetch={false}
            >
              Invoices
            </Link>

            <Link
              className={`rp-nav-btn ${pathname?.startsWith("/credit-notes") ? "rp-nav-btn--active" : ""}`}
              href="/credit-notes"
              prefetch={false}
            >
              Credit Notes
            </Link>

            <Link
              className={`rp-nav-btn ${pathname?.startsWith("/customers") ? "rp-nav-btn--active" : ""}`}
              href="/customers"
              prefetch={false}
            >
              Customers
            </Link>

            <Link
              className={`rp-nav-btn ${pathname?.startsWith("/products") ? "rp-nav-btn--active" : ""}`}
              href="/products"
              prefetch={false}
            >
              Products
            </Link>
          </nav>

          <div className="rp-side-footer">
            <div className="rp-role">
              <span>System</span>
              <b>ADMIN</b>
            </div>

            <div style={{ height: 10 }} />

            <button className="rp-btn rp-btn--danger" onClick={handleLogout} type="button">
              Log Out
            </button>
          </div>
        </div>
      </aside>
    );
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
        <SideNav />

        <main className="rp-main">
          {/* HEADER */}
          <header className="rp-top rp-top--invoices rp-card-anim" style={{ animationDelay: "60ms" }}>
            <div className="rp-inv-left">
              <Link className="rp-ui-btn rp-ui-btn--soft rp-glow" href="/" prefetch={false}>
                ● Dashboard
              </Link>
            </div>

            <div className="rp-inv-center">
              <div className="rp-page-chip">
                <div className="rp-page-chip__logo">
                  <img src="/images/logo/logo.png" alt="Ram Pottery" width={26} height={26} style={{ display: "block" }} />
                </div>
                <div className="rp-page-chip__title">Customers</div>
              </div>

              <div className="rp-page-sub">Add • Edit • Partywise Pricing • Activity</div>

              <div className="rp-breadcrumb" aria-label="Breadcrumb">
                <span className="rp-bc-item rp-bc-item--from">Dashboard</span>
                <span className="rp-bc-sep">→</span>
                <span className="rp-bc-item rp-bc-item--to">Customers</span>
              </div>
            </div>

            <div className="rp-inv-right">
              <div className="rp-sync">
                <div className="rp-sync-label">Last sync :</div>
                <div className="rp-sync-time">{lastSync || "—"}</div>
              </div>
            </div>
          </header>

          {/* ACTION BAR */}
          <section className="rp-bar rp-card-anim" style={{ animationDelay: "110ms" }}>
            <Link className="rp-ui-btn rp-ui-btn--danger rp-glow" href="/customers/new" prefetch={false}>
              + Add Customer
            </Link>

            <button className="rp-ui-btn rp-ui-btn--soft rp-glow" onClick={onRefresh} type="button">
              Refresh
            </button>

            <Link className="rp-ui-btn rp-ui-btn--soft rp-glow" href="/customers/pricing-import" prefetch={false}>
              Bulk Pricing Import
            </Link>

            <div className="rp-bar-spacer" />

            <span className="rp-chip rp-chip--muted">
              Showing <b>{rows.length}</b>
              {queryApplied ? (
                <>
                  {" "}
                  • Filter: <b>{queryApplied}</b>
                </>
              ) : null}
            </span>
          </section>

          {/* RED STATS BAR */}
          <section className="rp-stats rp-card-anim" style={{ animationDelay: "150ms" }}>
            <div className="rp-stat">
              <div className="rp-stat-k">Customers</div>
              <div className="rp-stat-v">{stats.total}</div>
              <div className="rp-stat-s">Total records</div>
            </div>

            <div className="rp-stat">
              <div className="rp-stat-k">Invoices</div>
              <div className="rp-stat-v">{stats.invCount}</div>
              <div className="rp-stat-s">Total invoice count</div>
            </div>

            <div className="rp-stat">
              <div className="rp-stat-k">Opening Total</div>
              <div className="rp-stat-v">{formatRs(stats.openingSum)}</div>
              <div className="rp-stat-s">Sum opening balances</div>
            </div>

            <div className="rp-stat">
              <div className="rp-stat-k">Outstanding</div>
              <div className="rp-stat-v">{formatRs(stats.outstanding)}</div>
              <div className="rp-stat-s">Balance remaining</div>
            </div>
          </section>

          {/* SEARCH */}
          <section className="rp-panel rp-card-anim" style={{ animationDelay: "190ms" }}>
            <div className="rp-panel-head">
              <div>
                <div className="rp-panel-title">Search & Filters</div>
                <div className="rp-panel-sub">Code • name • phone (click Search)</div>
              </div>
              <div className="rp-panel-badge">{busySearch ? "Searching…" : "Ready"}</div>
            </div>

            <div className="rp-panel-body">
              <div className="rp-row rp-row--wrap" style={{ gap: 12 }}>
                <input
                  ref={inputRef}
                  className="rp-input rp-input--full"
                  placeholder="Type search then click Search…"
                  value={queryDraft}
                  onChange={(e) => setQueryDraft(e.target.value)}
                  onKeyDown={onKeyDown}
                  disabled={busySearch}
                />

                <button
                  className={`rp-ui-btn rp-ui-btn--soft rp-glow ${searchChanged ? "rp-pulse" : ""}`}
                  type="button"
                  onClick={applySearch}
                  disabled={busySearch}
                >
                  ● Search
                </button>

                <button className="rp-ui-btn rp-ui-btn--soft rp-glow" type="button" onClick={clearSearch} disabled={busySearch}>
                  ● Clear
                </button>
              </div>

              {err ? <div className="rp-error-line" style={{ marginTop: 10 }}>{err}</div> : null}
            </div>
          </section>

          {/* LIST */}
          <section className="rp-panel rp-card-anim" style={{ animationDelay: "230ms" }}>
            <div className="rp-panel-head">
              <div>
                <div className="rp-panel-title">Customer List</div>
                <div className="rp-panel-sub">Edit • Delete • Pricing • Activity</div>
              </div>

              <div className="rp-panel-right">
                <button className="rp-ui-btn rp-ui-btn--danger rp-glow" onClick={onRefresh} type="button">
                  Refresh
                </button>
              </div>
            </div>

            <div className="rp-panel-body" style={{ paddingTop: 10 }}>
              <div className="rp-table-wrap rp-table-wrap--premium">
                <table className="rp-table rp-table--premium">
                  <thead>
                    <tr>
                      <th style={{ width: 120 }}>Code</th>
                      <th style={{ width: 220 }}>Name</th>
                      <th style={{ width: 140 }}>Phone</th>
                      <th style={{ width: 130 }}>Invoices</th>
                      <th style={{ width: 180 }}>Outstanding</th>
                      <th style={{ width: 160 }}>Opening</th>
                      <th style={{ width: 340 }}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr><td className="rp-td-empty" colSpan={7}>Loading customers…</td></tr>
                    ) : rows.length === 0 ? (
                      <tr><td className="rp-td-empty" colSpan={7}>No customers found.</td></tr>
                    ) : (
                      rows.map((c) => {
                        const cid = String(c.id);
                        const a = activity?.[cid] || { invoiceCount: 0, totalSales: 0, outstanding: 0 };

                        return (
                          <tr className="rp-row-hover" key={cid}>
                            <td className="rp-strong">{c.customer_code || "—"}</td>
                            <td style={{ fontWeight: 950 }}>{c.name || "—"}</td>
                            <td>{c.phone || "—"}</td>
                            <td style={{ fontWeight: 950 }}>{a.invoiceCount}</td>
                            <td style={{ fontWeight: 950 }}>{formatRs(safeNum(a.outstanding))}</td>
                            <td style={{ fontWeight: 950 }}>{formatRs(safeNum(c.opening_balance))}</td>
                            <td>
                              <div className="rp-row rp-row--wrap" style={{ gap: 10 }}>
                                <Link className="rp-ui-btn rp-ui-btn--soft rp-glow" href={`/customers/${cid}/edit`} prefetch={false}>
                                  Edit
                                </Link>

                                <Link className="rp-ui-btn rp-ui-btn--soft rp-glow" href={`/customers/${cid}/pricing`} prefetch={false}>
                                  Pricing →
                                </Link>

                                <button
                                  className="rp-ui-btn rp-ui-btn--danger rp-glow"
                                  type="button"
                                  onClick={() => setConfirm({ open: true, id: cid, name: c.name || "Customer" })}
                                >
                                  Delete
                                </button>
                              </div>
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

          {/* CONFIRM MODAL */}
          {confirm.open ? (
            <div className="rp-modal-backdrop" role="dialog" aria-modal="true">
              <div className="rp-modal">
                <div className="rp-modal-title">Delete customer?</div>
                <div className="rp-modal-sub">
                  This will permanently remove <b>{confirm.name}</b>.
                  <br />
                  If customer has invoices, delete may be blocked for safety.
                </div>

                <div className="rp-row" style={{ gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
                  <button className="rp-ui-btn rp-ui-btn--soft rp-glow" type="button" onClick={() => setConfirm({ open: false })} disabled={busyDelete}>
                    Cancel
                  </button>
                  <button
                    className="rp-ui-btn rp-ui-btn--danger rp-glow"
                    type="button"
                    onClick={() => deleteCustomer(String(confirm.id))}
                    disabled={busyDelete}
                  >
                    {busyDelete ? "Deleting…" : "Yes, Delete"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* local styles */}
          <style jsx>{`
            .rp-modal-backdrop {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.35);
              display: grid;
              place-items: center;
              padding: 18px;
              z-index: 9999;
            }
            .rp-modal {
              width: min(560px, 100%);
              border-radius: 22px;
              border: 1px solid var(--rp-border);
              background: var(--rp-card);
              box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25);
              padding: 16px 16px;
              animation: pop 180ms ease-out both;
            }
            .rp-modal-title {
              font-weight: 950;
              font-size: 18px;
              letter-spacing: -0.2px;
            }
            .rp-modal-sub {
              margin-top: 6px;
              color: var(--rp-muted);
              font-weight: 800;
              line-height: 1.4;
            }
            @keyframes pop {
              from { transform: translateY(8px) scale(0.98); opacity: 0; }
              to { transform: translateY(0) scale(1); opacity: 1; }
            }
            .rp-pulse {
              position: relative;
            }
            .rp-pulse::after {
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
