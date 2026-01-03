"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

export default function AdminUsersPage() {
  const pathname = usePathname();
  const router = useRouter();

  // hydration lock
  const [mounted, setMounted] = useState(false);

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
    <div className="rp-app rp-enter">
      <div className="rp-bg" aria-hidden="true">
        <div className="rp-bg-orb rp-bg-orb--1" />
        <div className="rp-bg-orb rp-bg-orb--2" />
        <div className="rp-bg-orb rp-bg-orb--3" />
        <div className="rp-bg-grid" />
      </div>

      <div className="rp-shell">
        {/* Sidebar (same as your premium pages) */}
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
              <Link
                className={`rp-nav-btn ${pathname?.startsWith("/reports") ? "rp-nav-btn--active" : ""}`}
                href="/reports"
                prefetch={false}
              >
                Reports & Statements
              </Link>
              <Link
                className={`rp-nav-btn ${pathname?.startsWith("/admin/users") ? "rp-nav-btn--active" : ""}`}
                href="/admin/users"
                prefetch={false}
              >
                Users & Permissions
              </Link>
            </nav>

            <div className="rp-side-footer">
              <div className="rp-role">
                <span>Module</span>
                <b>ADMIN</b>
              </div>
            </div>
          </div>
        </aside>

        <main className="rp-main">
          {/* Header */}
          <header className="rp-top rp-top--saas rp-card-anim" style={{ animationDelay: "60ms" }}>
            <div className="rp-top-left--actions">
              <Link className="rp-ui-btn rp-ui-btn--soft rp-glow" href="/" prefetch={false}>
                ● Dashboard
              </Link>
              <span className="rp-top-pill">ADMIN</span>
            </div>

            <div className="rp-top-center--stacked">
              <div className="rp-top-logo rp-top-logo--xl">
                <img src="/images/logo/logo.png" alt="Ram Pottery" width={44} height={44} />
              </div>
              <div className="rp-top-center-text">
                <div className="rp-top-title">Users & Permissions</div>
                <div className="rp-top-subtitle">Create staff • manage roles • disable/enable securely</div>
              </div>
              <div className="rp-breadcrumb">
                <span>Dashboard</span> → <span>Admin</span> → <b>Users</b>
              </div>
            </div>

            <div className="rp-top-right--sync">
              <div className="rp-sync">
                <div className="rp-sync-label">Last sync :</div>
                <div className="rp-sync-time">{lastSync || "—"}</div>
              </div>
            </div>
          </header>

          {/* Action bar */}
          <section className="rp-bar rp-card-anim" style={{ animationDelay: "110ms" }}>
            <button className="rp-ui-btn rp-ui-btn--soft rp-glow" onClick={loadUsers} disabled={loading || busy} type="button">
              Refresh
            </button>

            <button className="rp-ui-btn rp-ui-btn--danger rp-glow" onClick={openCreate} disabled={busy} type="button">
              + New User
            </button>

            <div className="rp-bar-spacer" />

            <span className="rp-chip rp-chip--muted">
              Active <b>{activeCount}</b> / {users.length}
            </span>
          </section>

          {error ? <div className="rp-error-line rp-card-anim">{error}</div> : null}

          {/* Users table */}
          <section className="rp-panel rp-card-anim" style={{ animationDelay: "160ms" }}>
            <div className="rp-panel-head">
              <div>
                <div className="rp-panel-title">Staff Accounts</div>
                <div className="rp-panel-sub">Role-based presets available • password is hashed</div>
              </div>
              <div className="rp-panel-badge">{loading ? "Loading…" : "Ready"}</div>
            </div>

            <div className="rp-panel-body" style={{ paddingTop: 10 }}>
              <div className="rp-table-wrap rp-table-wrap--premium">
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
                              <span className="rp-badge rp-badge--neutral">{roleUp}</span>
                            </td>
                            <td>
                              {active ? (
                                <span className="rp-badge rp-badge--paid">ACTIVE</span>
                              ) : (
                                <span className="rp-badge rp-badge--void">DISABLED</span>
                              )}
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <div className="rp-row rp-row--wrap" style={{ justifyContent: "flex-end", gap: 10 }}>
                                <button
                                  className="rp-ui-btn rp-ui-btn--soft rp-glow"
                                  type="button"
                                  onClick={() => openEdit(u)}
                                  disabled={busy || busyId === u.id}
                                >
                                  Edit
                                </button>

                                <button
                                  className="rp-ui-btn rp-ui-btn--danger rp-glow"
                                  type="button"
                                  onClick={() => toggleActive(u)}
                                  disabled={busy || busyId === u.id}
                                  title={active ? "Disable user" : "Enable user"}
                                >
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
            </div>
          </section>

          {/* Modal */}
          {open ? (
            <div className="rp-modal-backdrop" role="dialog" aria-modal="true">
              <div className="rp-modal">
                <div className="rp-modal-head">
                  <div>
                    <div className="rp-modal-title">{editingId ? "Edit User" : "Create User"}</div>
                    <div className="rp-modal-sub">
                      {editingId ? "Update profile, role, status, or reset password." : "Create a new staff account."}
                    </div>
                  </div>
                  <button className="rp-ui-btn rp-ui-btn--soft rp-glow" type="button" onClick={closeModal}>
                    ✕ Close
                  </button>
                </div>

                <div className="rp-modal-body">
                  <div className="rp-form-grid">
                    <label className="rp-field">
                      <span>Username</span>
                      <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. sales01"
                        autoComplete="off"
                      />
                    </label>

                    <label className="rp-field">
                      <span>{editingId ? "New Password (optional)" : "Password"}</span>
                      <input
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
                      <span>Full name</span>
                      <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. John Doe" />
                    </label>

                    <label className="rp-field">
                      <span>Phone</span>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 5xxxxxxx" />
                    </label>

                    <label className="rp-field">
                      <span>Role</span>
                      <select value={role} onChange={(e) => setRole(normRole(e.target.value))}>
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

                  {error ? <div className="rp-error-line" style={{ marginTop: 12 }}>{error}</div> : null}
                </div>

                <div className="rp-modal-foot">
                  <button className="rp-ui-btn rp-ui-btn--soft rp-glow" type="button" onClick={closeModal} disabled={busy}>
                    Cancel
                  </button>
                  <button className="rp-ui-btn rp-ui-btn--danger rp-glow" type="button" onClick={saveUser} disabled={busy}>
                    {busy ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>

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
                  width: min(860px, 100%);
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

          <footer className="rp-footer rp-card-anim" style={{ animationDelay: "260ms" }}>
            © 2026 Ram Pottery Ltd • Built by <span>MoBiz.mu</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
