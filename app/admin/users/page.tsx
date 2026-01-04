"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { rpFetch } from "@/lib/rpFetch";

type RpUser = {
  id: number;
  username: string;
  full_name?: string | null;
  phone?: string | null;
  role: string;
  permissions: any;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

type UsersListResponse = { ok: true; users: RpUser[] };
type UserGetResponse = { ok: true; user: RpUser };

const ROLES = ["admin", "manager", "staff"] as const;
type Role = (typeof ROLES)[number];

function normRole(r: any): Role {
  const x = String(r || "").toLowerCase().trim();
  if (x === "admin" || x === "manager" || x === "staff") return x;
  return "staff";
}

function fmtDateTime(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${dd}/${mm}/${yy}, ${hh}:${mi}:${ss}`;
}

// rpFetch in your project returns JSON already; keep safe for any older code.
async function rpJson<T = any>(url: string, options?: any): Promise<T> {
  const res = await rpFetch(url, options as any);
  return typeof (res as any)?.json === "function" ? await (res as any).json() : (res as T);
}

type RpSession = {
  id?: string;
  username?: string;
  name?: string;
  role?: string;
};

function roleUpper(r?: string) {
  return String(r || "").toUpperCase();
}
function isAdminRole(r?: string) {
  return roleUpper(r) === "ADMIN";
}

export default function AdminUsersPage() {
  const pathname = usePathname();
  const router = useRouter();

  // hydration lock
  const [mounted, setMounted] = useState(false);

  // shell UI
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [session, setSession] = useState<RpSession | null>(null);

  // data
  const [users, setUsers] = useState<RpUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string>("—");

  // modal
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); // optional on edit
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("staff");
  const [isActive, setIsActive] = useState(true);
  const [applyPreset, setApplyPreset] = useState(true);

  useEffect(() => setMounted(true), []);

  // theme + session
  useEffect(() => {
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

      // optional guard: only admin can view this page
      if (!isAdminRole(s?.role)) {
        router.replace("/");
        return;
      }
    } catch {
      router.replace("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const userLabel = useMemo(() => {
    const name = (session?.name || session?.username || "").trim();
    return name || "User";
  }, [session]);

  const roleLabel = useMemo(() => roleUpper(session?.role) || "STAFF", [session]);

  const navItems = useMemo(() => {
    // same nav set as your premium pages
    return [
      { href: "/", label: "Dashboard" },
      { href: "/invoices", label: "Invoices" },
      { href: "/credit-notes", label: "Credit Notes" },
      { href: "/stock", label: "Stock & Categories" },
      { href: "/stock-movements", label: "Stock Movements" },
      { href: "/customers", label: "Customers" },
      { href: "/reports", label: "Reports & Statements" },
      { href: "/admin/users", label: "Users & Permissions" },
    ];
  }, []);

  const activeCount = useMemo(() => users.filter((u) => u.is_active).length, [users]);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const json = await rpJson<UsersListResponse>("/api/admin/users", { cache: "no-store" });
      setUsers(json?.users || []);
      setLastSync(fmtDateTime(new Date()));
    } catch (e: any) {
      setError(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setUsername("");
    setPassword("");
    setFullName("");
    setPhone("");
    setRole("staff");
    setIsActive(true);
    setApplyPreset(true);
    setEditingId(null);
  }

  function openCreate() {
    resetForm();
    setOpen(true);
  }

  async function openEdit(u: RpUser) {
    setError(null);
    setBusy(true);
    try {
      // fetch fresh row (safer)
      const json = await rpJson<UserGetResponse>(`/api/admin/users/${u.id}`, { cache: "no-store" });
      const row = json?.user || u;

      setEditingId(row.id);
      setUsername(row.username || "");
      setPassword("");
      setFullName(row.full_name || "");
      setPhone(row.phone || "");
      setRole(normRole(row.role));
      setIsActive(Boolean(row.is_active));
      setApplyPreset(false); // editing default: don't override perms unless asked
      setOpen(true);
    } catch (e: any) {
      setError(e?.message || "Failed to open user");
    } finally {
      setBusy(false);
    }
  }

  async function saveUser() {
    setError(null);

    const u = username.trim().toLowerCase();
    if (!u) return setError("Username is required.");
    if (!editingId && !password) return setError("Password is required for new users.");

    try {
      setBusy(true);

      if (!editingId) {
        // CREATE => POST /api/admin/users
        await rpJson("/api/admin/users", {
          method: "POST",
          body: JSON.stringify({
            username: u,
            password,
            full_name: fullName,
            phone,
            role,
            is_active: isActive,
            applyPreset, // server will set ROLE_PRESETS if applyPreset true
          }),
        });
      } else {
        // UPDATE => PATCH /api/admin/users/:id
        const patch: any = {
          full_name: fullName,
          phone,
          is_active: isActive,
          role,
          applyPreset,
        };
        if (password) patch.password = password; // hashed on server

        await rpJson(`/api/admin/users/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(patch),
        });
      }

      setOpen(false);
      resetForm();
      await loadUsers();
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(u: RpUser) {
    setError(null);
    setBusyId(u.id);
    try {
      await rpJson(`/api/admin/users/${u.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !u.is_active }),
      });
      await loadUsers();
    } catch (e: any) {
      setError(e?.message || "Failed");
    } finally {
      setBusyId(null);
    }
  }

  function closeModal() {
    setOpen(false);
    resetForm();
  }

  // hydration lock after hooks
  if (!mounted) return null;

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
            <div className="rp-mtop-sub">Users & Permissions</div>
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
                  className={`rp-nav-btn ${it.href === "/admin/users" ? "rp-nav-btn--active" : ""}`}
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
                  className={`rp-nav-btn ${it.href === "/admin/users" ? "rp-nav-btn--active" : ""}`}
                  href={it.href}
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
              <div className="rp-exec__title">Users & Permissions</div>
              <div className="rp-exec__sub">Create staff • manage roles • enable/disable securely</div>
            </div>
            <div className="rp-exec__right">
              <span className={`rp-live ${loading ? "is-dim" : ""}`}>
                <span className="rp-live-dot" aria-hidden="true" />
                {loading ? "Syncing" : "Live"}
              </span>
              <span className="rp-chip rp-chip--soft">ADMIN</span>
            </div>
          </section>

          {/* KPI row */}
          <section className="rp-kpi-pro rp-card-anim">
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Total Users</div>
              <div className="rp-kpi-pro__value">{users.length}</div>
              <div className="rp-kpi-pro__sub">All accounts</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Active</div>
              <div className="rp-kpi-pro__value">{activeCount}</div>
              <div className="rp-kpi-pro__sub">Enabled accounts</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Disabled</div>
              <div className="rp-kpi-pro__value">{Math.max(0, users.length - activeCount)}</div>
              <div className="rp-kpi-pro__sub">Blocked accounts</div>
            </div>
            <div className="rp-kpi-pro__cell">
              <div className="rp-kpi-pro__title">Module</div>
              <div className="rp-kpi-pro__value">ADMIN</div>
              <div className="rp-kpi-pro__sub">Role-gated</div>
            </div>
          </section>

          {/* Actions */}
          <section className="rp-actions rp-card-anim">
            <div className="rp-seg rp-seg--pro">
              <button className="rp-seg-item rp-seg-item--brand" onClick={loadUsers} disabled={loading || busy} type="button">
                <span className="rp-icbtn" aria-hidden="true">
                  ⟳
                </span>
                Refresh
              </button>

              <button className="rp-seg-item rp-seg-item--brand" onClick={openCreate} disabled={busy} type="button">
                <span className="rp-icbtn" aria-hidden="true">
                  ＋
                </span>
                New User
              </button>

              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span className="rp-chip rp-chip--soft">
                  Active <b style={{ marginLeft: 6 }}>{activeCount}</b> / {users.length}
                </span>
                {error ? <span className="rp-chip rp-chip--warn">Attention needed</span> : <span className="rp-chip">Ready</span>}
              </div>
            </div>
          </section>

          {error ? (
            <section className="rp-card rp-card-anim" style={{ border: "1px solid rgba(255,107,107,.22)" }}>
              <div className="rp-card-head rp-card-head--tight">
                <div>
                  <div className="rp-card-title">⚠️ Error</div>
                  <div className="rp-card-sub">Please retry or check your permissions</div>
                </div>
                <span className="rp-chip rp-chip--warn">Warning</span>
              </div>
              <div className="rp-card-body" style={{ whiteSpace: "pre-wrap", fontWeight: 900 }}>
                {error}
              </div>
            </section>
          ) : null}

          {/* Users table */}
          <section className="rp-card rp-card-anim">
            <div className="rp-card-head rp-card-head--tight">
              <div>
                <div className="rp-card-title">Staff Accounts</div>
                <div className="rp-card-sub">Role presets available • passwords stored as bcrypt hash</div>
              </div>
              <span className={`rp-chip ${loading ? "is-dim" : ""}`}>{loading ? "Loading…" : "Ready"}</span>
            </div>

            <div className="rp-card-body rp-table-wrap">
              <table className="rp-table rp-table--premium">
                <thead>
                  <tr>
                    <th style={{ width: 80 }}>ID</th>
                    <th style={{ width: 180 }}>Username</th>
                    <th>Full name</th>
                    <th style={{ width: 160 }}>Phone</th>
                    <th style={{ width: 130 }}>Role</th>
                    <th style={{ width: 140 }}>Status</th>
                    <th style={{ width: 260, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="rp-td-empty" colSpan={7}>
                        Loading users…
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td className="rp-td-empty" colSpan={7}>
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const roleUp = normRole(u.role).toUpperCase();
                      const active = Boolean(u.is_active);

                      return (
                        <tr className="rp-row-hover" key={u.id}>
                          <td className="rp-strong">{u.id}</td>
                          <td className="rp-strong">{u.username}</td>
                          <td style={{ fontWeight: 950 }}>{u.full_name || "—"}</td>
                          <td>{u.phone || "—"}</td>
                          <td>
                            <span className="rp-chip rp-chip--soft">{roleUp}</span>
                          </td>
                          <td>
                            {active ? (
                              <span className="rp-status rp-status-approved">
                                <span className="rp-status-dot" />
                                ACTIVE
                              </span>
                            ) : (
                              <span className="rp-status rp-status-cancelled">
                                <span className="rp-status-dot" />
                                DISABLED
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                              <button
                                className="rp-ui-btn rp-ui-btn--brand"
                                type="button"
                                onClick={() => openEdit(u)}
                                disabled={busy || busyId === u.id}
                              >
                                <span className="rp-ui-btn__dot" aria-hidden="true" />
                                Edit
                              </button>

                              <button
                                className="rp-ui-btn rp-ui-btn--danger"
                                type="button"
                                onClick={() => toggleActive(u)}
                                disabled={busy || busyId === u.id}
                                title={active ? "Disable user" : "Enable user"}
                              >
                                <span className="rp-ui-btn__dot" aria-hidden="true" />
                                {busyId === u.id ? "…" : active ? "Disable" : "Enable"}
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
          </section>

          {/* Modal */}
          {open ? (
            <div className="rp-modal-backdrop" role="dialog" aria-modal="true" onClick={closeModal}>
              <div className="rp-modal" onClick={(e) => e.stopPropagation()}>
                <div className="rp-modal-head">
                  <div>
                    <div className="rp-modal-title">{editingId ? "Edit User" : "Create User"}</div>
                    <div className="rp-modal-sub">
                      {editingId ? "Update profile, role, status, or reset password." : "Create a new staff account."}
                    </div>
                  </div>
                  <button className="rp-ui-btn rp-ui-btn--brand" type="button" onClick={closeModal}>
                    <span className="rp-ui-btn__dot" aria-hidden="true" />✕ Close
                  </button>
                </div>

                <div className="rp-modal-body">
                  <div className="rp-form-grid">
                    <label className="rp-field">
                      <span className="rp-label">Username</span>
                      <input
                        className="rp-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. sales01"
                        autoComplete="off"
                      />
                    </label>

                    <label className="rp-field">
                      <span className="rp-label">{editingId ? "New Password (optional)" : "Password"}</span>
                      <input
                        className="rp-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={editingId ? "Leave blank to keep current" : "Set a password"}
                        autoComplete="new-password"
                      />
                      <div className="rp-field-hint">
                        Passwords are stored as <b>bcrypt hash</b> in the DB.
                      </div>
                    </label>

                    <label className="rp-field">
                      <span className="rp-label">Full name</span>
                      <input
                        className="rp-input"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. John Doe"
                      />
                    </label>

                    <label className="rp-field">
                      <span className="rp-label">Phone</span>
                      <input
                        className="rp-input"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 5xxxxxxx"
                      />
                    </label>

                    <label className="rp-field">
                      <span className="rp-label">Role</span>
                      <select className="rp-input" value={role} onChange={(e) => setRole(normRole(e.target.value))}>
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r.toUpperCase()}
                          </option>
                        ))}
                      </select>
                      <div className="rp-field-hint">
                        Use <b>Apply preset</b> to reset permissions to role defaults.
                      </div>
                    </label>

                    <label className="rp-check">
                      <input type="checkbox" checked={isActive} onChange={() => setIsActive(!isActive)} />
                      Active account
                    </label>

                    <label className="rp-check">
                      <input type="checkbox" checked={applyPreset} onChange={() => setApplyPreset(!applyPreset)} />
                      Apply role permission preset
                    </label>
                  </div>

                  {error ? (
                    <div className="rp-note rp-note--warn" style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>
                      {error}
                    </div>
                  ) : null}
                </div>

                <div className="rp-modal-foot">
                  <button className="rp-ui-btn" type="button" onClick={closeModal} disabled={busy}>
                    <span className="rp-ui-btn__dot" aria-hidden="true" />
                    Cancel
                  </button>
                  <button className="rp-ui-btn rp-ui-btn--danger" type="button" onClick={saveUser} disabled={busy}>
                    <span className="rp-ui-btn__dot" aria-hidden="true" />
                    {busy ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>

              {/* scoped modal styling (matches your premium look) */}
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
                  width: min(920px, 100%);
                  border-radius: 22px;
                  border: 1px solid var(--rp-border);
                  background: var(--rp-card);
                  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.28);
                  overflow: hidden;
                  animation: pop 170ms ease-out both;
                }
                .rp-modal-head {
                  padding: 14px 14px 10px;
                  border-bottom: 1px solid var(--rp-border);
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  gap: 12px;
                }
                .rp-modal-title {
                  font-weight: 950;
                  font-size: 18px;
                  letter-spacing: -0.2px;
                }
                .rp-modal-sub {
                  margin-top: 4px;
                  color: var(--rp-muted);
                  font-weight: 800;
                }
                .rp-modal-body {
                  padding: 12px 14px;
                }
                .rp-modal-foot {
                  padding: 12px 14px 14px;
                  display: flex;
                  justify-content: flex-end;
                  gap: 10px;
                  border-top: 1px solid var(--rp-border);
                }
                .rp-form-grid {
                  display: grid;
                  grid-template-columns: repeat(2, minmax(0, 1fr));
                  gap: 12px;
                }
                .rp-field-hint {
                  margin-top: 6px;
                  font-size: 12px;
                  color: var(--rp-muted);
                  font-weight: 800;
                }
                .rp-check {
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  font-weight: 900;
                  color: var(--rp-muted);
                  padding: 12px 12px;
                  border-radius: 16px;
                  border: 1px solid var(--rp-border);
                  background: linear-gradient(180deg, rgba(0, 0, 0, 0.03), transparent);
                }
                :root[data-theme="dark"] .rp-check {
                  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent);
                }
                @media (max-width: 780px) {
                  .rp-form-grid {
                    grid-template-columns: 1fr;
                  }
                }
                @keyframes pop {
                  from {
                    transform: translateY(10px) scale(0.99);
                    opacity: 0;
                  }
                  to {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                  }
                }
              `}</style>
            </div>
          ) : null}

          <footer className="rp-footer">© {new Date().getFullYear()} Ram Pottery Ltd • Built by Mobiz.mu</footer>
        </main>
      </div>
    </div>
  );
}
