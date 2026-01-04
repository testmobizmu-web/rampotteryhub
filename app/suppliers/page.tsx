"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Supplier = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
};

type RpSession = {
  id?: string;
  username?: string;
  name?: string;
  role?: string;
};

function safe(v: unknown) {
  return String(v ?? "").trim();
}
function roleUpper(r?: string) {
  return String(r || "").toUpperCase();
}
function fmtDateTime(d: Date) {
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;
}

export default function SuppliersPage() {
  const router = useRouter();

  // premium shell
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lastSync, setLastSync] = useState<string>("—");
  const [session, setSession] = useState<RpSession | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  }

  // data
  const [list, setList] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  // form
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const nameRef = useRef<HTMLInputElement | null>(null);

  // invoice-style kebab
  const [openMenu, setOpenMenu] = useState<number | null>(null);

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

  // lock background scroll when drawer open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // click outside closes kebab (invoice-style)
  useEffect(() => {
    const close = () => setOpenMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // keyboard UX: Enter submits, Esc cancels / closes
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (openMenu != null) {
          e.preventDefault();
          setOpenMenu(null);
          return;
        }
        if (editingId != null) {
          e.preventDefault();
          resetForm();
          return;
        }
        if (drawerOpen) {
          e.preventDefault();
          setDrawerOpen(false);
          return;
        }
      }
      if (e.key === "Enter") {
        // submit when focus is within this page (not when menu open)
        if (openMenu != null) return;
        // avoid accidental submit when user is typing in search
        const el = document.activeElement as HTMLElement | null;
        const isSearch = el?.getAttribute?.("data-role") === "supplier-search";
        if (isSearch) return;
        e.preventDefault();
        void handleSave();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId, drawerOpen, openMenu, name, phone, email, address]);

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
    const nm = (session?.name || session?.username || "").trim();
    return nm || "User";
  }, [session]);

  const roleLabel = useMemo(() => roleUpper(session?.role) || "STAFF", [session?.role]);
  const canSeeAdminNav = useMemo(() => roleUpper(session?.role) === "ADMIN", [session?.role]);

  const navItems = useMemo(() => {
    const base = [
      { href: "/", label: "Dashboard" },
      { href: "/invoices", label: "Invoices" },
      { href: "/credit-notes", label: "Credit Notes" },
      { href: "/products", label: "Stock & Categories" },
      { href: "/stock-movements", label: "Stock Movements" },
      { href: "/customers", label: "Customers" },
      { href: "/suppliers", label: "Suppliers" },
      { href: "/reports", label: "Reports & Statements" },
    ];
    if (canSeeAdminNav) base.push({ href: "/admin/users", label: "Users & Permissions" });
    return base;
  }, [canSeeAdminNav]);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const { data, error } = await supabase.from("suppliers").select("*").order("name");
      if (error) throw error;
      setList((data ?? []) as Supplier[]);
      setLastSync(fmtDateTime(new Date()));
    } catch (e: any) {
      setErr(e?.message || "Failed to load suppliers");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return list;

    return list.filter((s) => {
      const hay = [s.name, s.phone, s.email, s.address].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(needle);
    });
  }, [list, q]);

  function resetForm() {
    setEditingId(null);
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    window.setTimeout(() => nameRef.current?.focus(), 50);
  }

  function startEdit(s: Supplier) {
    setEditingId(s.id);
    setName(s.name || "");
    setPhone(s.phone || "");
    setEmail(s.email || "");
    setAddress(s.address || "");
    setOpenMenu(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => nameRef.current?.focus(), 80);
  }

  const handleSave = async () => {
    if (!safe(name)) {
      showToast("Supplier name required ⚠️");
      nameRef.current?.focus();
      return;
    }

    const payload = {
      name: safe(name),
      phone: safe(phone) || null,
      email: safe(email) || null,
      address: safe(address) || null,
    };

    try {
      if (editingId) {
        const { error } = await supabase.from("suppliers").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("suppliers").insert(payload);
        if (error) throw error;
      }

      showToast("Saved ✅");
      resetForm();
      await load();
    } catch (e: any) {
      showToast(e?.message || "Save failed");
    }
  };

  const handleDelete = async (id: number) => {
    const ok = confirm("Delete this supplier? This cannot be undone.");
    if (!ok) return;

    try {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (error) throw error;

      if (editingId === id) resetForm();
      showToast("Deleted ✅");
      await load();
    } catch (e: any) {
      showToast(e?.message || "Delete failed");
    }
  };

  const SideContent = (
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
            className={`rp-nav-btn ${it.href === "/suppliers" ? "rp-nav-btn--active" : ""}`}
            href={it.href}
            onClick={() => setDrawerOpen(false)}
            prefetch={false}
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
          <b title={userLabel}>{userLabel}</b>
        </div>
        <div className="rp-role" style={{ marginTop: 10 }}>
          <span>Role</span>
          <b>{roleLabel}</b>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return (
    <div className="rp-app">
      {/* premium background */}
      <div className="rp-bg" aria-hidden="true">
        <div className="rp-bg-orb rp-bg-orb--1" />
        <div className="rp-bg-orb rp-bg-orb--2" />
        <div className="rp-bg-orb rp-bg-orb--3" />
        <div className="rp-bg-grid" />
      </div>

      {/* toast */}
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
            <div className="rp-mtop-title">Suppliers</div>
            <div className="rp-mtop-sub">Vendors • Contacts</div>
          </div>

          <button type="button" className="rp-icon-btn" onClick={() => void load()} aria-label="Refresh">
            ⟳
          </button>
        </div>

        {/* Overlay + Drawer */}
        <button className={`rp-overlay ${drawerOpen ? "is-open" : ""}`} onClick={() => setDrawerOpen(false)} aria-label="Close menu" />
        <aside className={`rp-drawer ${drawerOpen ? "is-open" : ""}`} role="dialog" aria-modal="true">
          <div className="rp-drawer-head">
            <div className="rp-drawer-brand">
              <div className="rp-drawer-logo">
                <Image src="/images/logo/logo.png" alt="Ram Pottery" width={34} height={34} />
              </div>
              <div>
                <div className="rp-drawer-title">RampotteryHUB</div>
                <div className="rp-drawer-sub">Secure • Cloud</div>
              </div>
            </div>

            <button className="rp-icon-btn" type="button" onClick={() => setDrawerOpen(false)} aria-label="Close">
              ✕
            </button>
          </div>

          <div className="rp-drawer-body">{SideContent}</div>
        </aside>

        {/* Desktop sidebar */}
        <aside className="rp-side">{SideContent}</aside>

        {/* Main */}
        <main className="rp-main">
          {/* Top bar (Invoices style) */}
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
              <div className="rp-exec__title">Suppliers</div>
              <div className="rp-exec__sub">Add • edit • manage vendor contacts</div>
            </div>
            <div className="rp-exec__right">
              <span className={`rp-live ${loading ? "is-dim" : ""}`}>
                <span className="rp-live-dot" aria-hidden="true" />
                {loading ? "Loading" : "Live"}
              </span>
              <span className="rp-chip rp-chip--soft">Enter = Save • Esc = Cancel</span>
            </div>
          </section>

          {/* KPI strip */}
          <section className="rp-kpi-pro rp-card-anim">
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Total</div>
              <div className="rp-kpi-pro__value">{list.length}</div>
              <div className="rp-kpi-pro__sub">Suppliers</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Showing</div>
              <div className="rp-kpi-pro__value">{filtered.length}</div>
              <div className="rp-kpi-pro__sub">Filtered</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Mode</div>
              <div className="rp-kpi-pro__value">{editingId ? "Edit" : "Create"}</div>
              <div className="rp-kpi-pro__sub">Form state</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Status</div>
              <div className="rp-kpi-pro__value">{err ? "Error" : "OK"}</div>
              <div className="rp-kpi-pro__sub">System</div>
            </div>
          </section>

          {/* Actions */}
          <section className="rp-actions rp-card-anim">
            <div className="rp-seg rp-seg--pro">
              <button className="rp-seg-item rp-seg-item--brand" type="button" onClick={() => void handleSave()}>
                <span className="rp-icbtn" aria-hidden="true">
                  ✓
                </span>
                {editingId ? "Save Changes" : "Add Supplier"}
              </button>

              <button className="rp-seg-item" type="button" onClick={resetForm} disabled={!editingId && !name && !phone && !email && !address}>
                <span className="rp-icbtn" aria-hidden="true">
                  ↺
                </span>
                Clear
              </button>

              <button className="rp-seg-item rp-seg-item--brand" type="button" onClick={() => void load()} disabled={loading}>
                <span className="rp-icbtn" aria-hidden="true">
                  ⟳
                </span>
                {loading ? "Loading…" : "Refresh"}
              </button>

              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <input
                  className="rp-input"
                  data-role="supplier-search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search suppliers…"
                  style={{ minWidth: 260 }}
                />
                {err ? <span className="rp-chip rp-chip--warn">{err}</span> : <span className="rp-chip">Ready</span>}
              </div>
            </div>
          </section>

          {/* Form */}
          <section className="rp-card rp-card-anim">
            <div className="rp-card-head rp-card-head--tight">
              <div>
                <div className="rp-card-title">{editingId ? "Edit Supplier" : "Create Supplier"}</div>
                <div className="rp-card-sub">{editingId ? "Update details then press Enter to save." : "Fast entry: type name then Enter."}</div>
              </div>
              {editingId ? <span className="rp-chip rp-chip--soft">Editing ID #{editingId}</span> : <span className="rp-chip rp-chip--soft">New supplier</span>}
            </div>

            <div className="rp-card-body">
              <div className="rp-form-grid">
                <label className="rp-field" style={{ gridColumn: "1 / -1" }}>
                  <span className="rp-label">Supplier Name *</span>
                  <input
                    ref={nameRef}
                    className="rp-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Supplier name"
                    autoFocus
                  />
                </label>

                <label className="rp-field">
                  <span className="rp-label">Phone</span>
                  <input className="rp-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+230…" />
                </label>

                <label className="rp-field">
                  <span className="rp-label">Email</span>
                  <input className="rp-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@domain.com" />
                </label>

                <label className="rp-field" style={{ gridColumn: "1 / -1" }}>
                  <span className="rp-label">Address</span>
                  <input className="rp-input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Supplier address" />
                </label>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                <button className="rp-ui-btn rp-ui-btn--brand" type="button" onClick={() => void handleSave()}>
                  <span className="rp-ui-btn__dot" aria-hidden="true" />
                  {editingId ? "Save Changes" : "Add Supplier"}
                </button>

                <button className="rp-ui-btn" type="button" onClick={resetForm}>
                  <span className="rp-ui-btn__dot" aria-hidden="true" />
                  Cancel / Clear
                </button>

                <span className="rp-help" style={{ alignSelf: "center" }}>
                  Keyboard: <b>Enter</b> saves • <b>Esc</b> cancels
                </span>
              </div>
            </div>
          </section>

          {/* List */}
          <section className="rp-card rp-card-anim">
            <div className="rp-card-head rp-card-head--tight">
              <div>
                <div className="rp-card-title">Supplier List</div>
                <div className="rp-card-sub">Mobile = cards • Desktop = table • Actions in ⋮ menu</div>
              </div>
              <span className="rp-chip rp-chip--soft">
                Showing <b style={{ marginLeft: 6 }}>{filtered.length}</b> / <b>{list.length}</b>
              </span>
            </div>

            <div className="rp-card-body">
              {err && (
                <div className="rp-note rp-note--warn" style={{ marginBottom: 12, whiteSpace: "pre-wrap" }}>
                  <b>Error:</b> {err}
                </div>
              )}

              {/* Mobile cards */}
              <div className="sm:hidden" style={{ display: "grid", gap: 10 }}>
                {loading ? (
                  <div className="rp-td-empty" style={{ padding: 14 }}>
                    Loading suppliers…
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="rp-td-empty" style={{ padding: 14 }}>
                    No suppliers found.
                  </div>
                ) : (
                  filtered.map((s) => (
                    <div key={s.id} className="rp-rowcard">
                      <div className="rp-rowcard__top">
                        <div className="rp-rowcard__left">
                          <div className="rp-rowcard__title">{s.name}</div>
                          <div className="rp-rowcard__sub">
                            <span className="rp-soft-pill">ID #{s.id}</span>
                            {s.phone ? <span className="rp-soft-pill">{s.phone}</span> : <span className="rp-soft-pill">No phone</span>}
                          </div>
                        </div>

                        <div className="rp-rowcard__right" style={{ position: "relative" }}>
                          <button
                            type="button"
                            className="rp-row-actions-btn"
                            aria-label="Supplier actions"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(openMenu === s.id ? null : s.id);
                            }}
                          >
                            ⋮
                          </button>

                          {openMenu === s.id && (
                            <div className="rp-row-actions-menu" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  setOpenMenu(null);
                                  startEdit(s);
                                }}
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => {
                                  setOpenMenu(null);
                                  if (s.email) window.open(`mailto:${s.email}`, "_self");
                                  else showToast("No email");
                                }}
                                disabled={!s.email}
                              >
                                Email
                              </button>

                              <button
                                onClick={() => {
                                  setOpenMenu(null);
                                  if (s.phone) window.open(`tel:${s.phone}`, "_self");
                                  else showToast("No phone");
                                }}
                                disabled={!s.phone}
                              >
                                Call
                              </button>

                              <div className="rp-row-actions-sep" />

                              <button
                                className="danger"
                                onClick={() => {
                                  setOpenMenu(null);
                                  void handleDelete(s.id);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rp-rowcard__meta">
                        <div className="rp-rowcard__line">
                          <span className="rp-muted">Email:</span> <b>{s.email || "—"}</b>
                        </div>
                        <div className="rp-rowcard__line">
                          <span className="rp-muted">Address:</span> <b>{s.address || "—"}</b>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop table */}
              <div className="rp-table-wrap hidden sm:block">
                <table className="rp-table rp-table--premium">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th style={{ width: 180 }}>Phone</th>
                      <th style={{ width: 260 }}>Email</th>
                      <th>Address</th>
                      <th style={{ width: 64 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="rp-td-empty">
                          Loading suppliers…
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="rp-td-empty">
                          No suppliers found.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((s) => (
                        <tr key={s.id} className="rp-row-hover">
                          <td className="rp-strong">{s.name}</td>
                          <td>{s.phone || "—"}</td>
                          <td>{s.email || "—"}</td>
                          <td>{s.address || "—"}</td>

                          {/* invoice-style ⋮ */}
                          <td className="rp-actions-cell">
                            <button
                              type="button"
                              className="rp-row-actions-btn"
                              aria-label="Supplier actions"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenu(openMenu === s.id ? null : s.id);
                              }}
                            >
                              ⋮
                            </button>

                            {openMenu === s.id && (
                              <div className="rp-row-actions-menu" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => {
                                    setOpenMenu(null);
                                    startEdit(s);
                                  }}
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() => {
                                    setOpenMenu(null);
                                    if (s.email) window.open(`mailto:${s.email}`, "_self");
                                    else showToast("No email");
                                  }}
                                  disabled={!s.email}
                                >
                                  Email
                                </button>

                                <button
                                  onClick={() => {
                                    setOpenMenu(null);
                                    if (s.phone) window.open(`tel:${s.phone}`, "_self");
                                    else showToast("No phone");
                                  }}
                                  disabled={!s.phone}
                                >
                                  Call
                                </button>

                                <div className="rp-row-actions-sep" />

                                <button
                                  className="danger"
                                  onClick={() => {
                                    setOpenMenu(null);
                                    void handleDelete(s.id);
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: "12px 2px", fontSize: 12.5, fontWeight: 900, color: "var(--rp-muted)" }}>
                Showing {filtered.length} supplier(s)
              </div>
            </div>
          </section>

          <footer className="rp-footer">© {new Date().getFullYear()} Ram Pottery Ltd • Built by Mobiz.mu</footer>

          {/* local styling for mobile cards */}
          <style jsx>{`
            .rp-form-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 12px;
            }
            @media (max-width: 780px) {
              .rp-form-grid {
                grid-template-columns: 1fr;
              }
            }

            .rp-rowcard {
              border: 1px solid var(--rp-border);
              background: var(--rp-card);
              border-radius: 18px;
              padding: 12px;
              box-shadow: 0 14px 40px rgba(0, 0, 0, 0.08);
            }
            .rp-rowcard__top {
              display: flex;
              align-items: flex-start;
              justify-content: space-between;
              gap: 10px;
            }
            .rp-rowcard__title {
              font-weight: 950;
              letter-spacing: -0.2px;
            }
            .rp-rowcard__sub {
              margin-top: 6px;
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              gap: 8px;
              font-weight: 850;
            }
            .rp-rowcard__meta {
              margin-top: 10px;
              display: grid;
              gap: 6px;
              font-weight: 900;
            }
            .rp-rowcard__line {
              display: flex;
              gap: 8px;
              align-items: baseline;
              justify-content: space-between;
            }
          `}</style>
        </main>
      </div>
    </div>
  );
}


