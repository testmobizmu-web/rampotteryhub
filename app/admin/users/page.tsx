"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

/* ========= Types ========= */

type Permissions = {
  canEditStock?: boolean;
  canViewReports?: boolean;
  canManageUsers?: boolean;
};

type UserRow = {
  id: number;
  username: string;
  password?: string;
  role: "admin" | "staff";
  permissions: Permissions;
  is_active: boolean;
};

/* ========= Page ========= */

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form
  const [editingId, setEditingId] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");
  const [permStock, setPermStock] = useState(true);
  const [permReports, setPermReports] = useState(true);
  const [permUsers, setPermUsers] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // mobile drawer
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  /* ========= Effects ========= */

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMobileNavOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  useEffect(() => {
    loadUsers();
  }, []);

  /* ========= API ========= */

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setUsers(json.users ?? json ?? []);
    } catch (e: any) {
      setError(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setUsername("");
    setPassword("");
    setRole("staff");
    setPermStock(true);
    setPermReports(true);
    setPermUsers(false);
    setIsActive(true);
  }

  function editUser(u: UserRow) {
    setEditingId(u.id);
    setUsername(u.username);
    setPassword("");
    setRole(u.role);
    setPermStock(!!u.permissions?.canEditStock);
    setPermReports(!!u.permissions?.canViewReports);
    setPermUsers(!!u.permissions?.canManageUsers);
    setIsActive(u.is_active);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveUser(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;

    setSubmitting(true);
    setError(null);

    const payload: any = {
      username: username.trim(),
      role,
      is_active: isActive,
      permissions: {
        canEditStock: permStock,
        canViewReports: permReports,
        canManageUsers: permUsers,
      },
    };

    if (!editingId || password.trim()) payload.password = password.trim();

    try {
      const res = await fetch("/api/admin/users", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setUsers(updated.users ?? updated ?? []);
      resetForm();
    } catch (e: any) {
      setError(e.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function deactivateUser(id: number) {
    if (!confirm("Deactivate this user?")) return;
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: false }),
    });
    loadUsers();
  }

  /* ========= Sidebar ========= */

  const Side = (
    <div className="rp-side-card rp-card-anim">
      <div className="rp-brand">
        <div className="rp-brand-logo">
          <Image src="/images/logo/logo.png" alt="Ram Pottery" width={44} height={44} />
        </div>
        <div className="rp-brand-text">
          <div className="rp-brand-title">Ram Pottery Ltd</div>
          <div className="rp-brand-sub">Accounting & Stock Manager</div>
        </div>
      </div>

      <nav className="rp-nav">
        <Link className="rp-nav-btn" href="/">Dashboard</Link>
        <Link className="rp-nav-btn" href="/invoices">Invoices</Link>
        <Link className="rp-nav-btn" href="/credit-notes">Credit Notes</Link>
        <Link className="rp-nav-btn" href="/products">Stock & Categories</Link>
        <Link className="rp-nav-btn" href="/customers">Customers</Link>
        <Link className="rp-nav-btn" href="/suppliers">Suppliers</Link>
        <Link className="rp-nav-btn" href="/reports">Reports</Link>
        <Link className="rp-nav-btn rp-nav-btn--active" href="/admin/users">
          Users & Permissions
        </Link>
      </nav>

      <div className="rp-side-footer">
        <div className="rp-role">
          <span>Module</span>
          <b>Administration</b>
        </div>
      </div>
    </div>
  );

  /* ========= UI ========= */

  return (
    <div className="rp-app">
      <div className="rp-bg" aria-hidden>
        <span className="rp-bg-orb rp-bg-orb--1" />
        <span className="rp-bg-orb rp-bg-orb--2" />
        <span className="rp-bg-orb rp-bg-orb--3" />
        <span className="rp-bg-grid" />
      </div>

      {/* Mobile top */}
      <div className="rp-mtop">
        <button className="rp-icon-btn" onClick={() => setMobileNavOpen(true)}>
          <span className="rp-burger"><i /><i /><i /></span>
        </button>
        <div className="rp-mtop-brand">
          <div className="rp-mtop-title">Users & Permissions</div>
          <div className="rp-mtop-sub">Admin control</div>
        </div>
        <button className="rp-icon-btn" onClick={() => router.push("/")}>⌂</button>
      </div>

      <div className={`rp-overlay ${mobileNavOpen ? "is-open" : ""}`} onClick={() => setMobileNavOpen(false)} />
      <div className={`rp-drawer ${mobileNavOpen ? "is-open" : ""}`}>
        <div className="rp-drawer-head">
          <strong>Menu</strong>
          <button className="rp-icon-btn" onClick={() => setMobileNavOpen(false)}>✕</button>
        </div>
        {Side}
      </div>

      <div className="rp-shell rp-enter">
        <aside className="rp-side">{Side}</aside>

        <main className="rp-main">
          {/* Header */}
          <div className="rp-top rp-card-anim">
            <div className="rp-title">
              <div className="rp-eyebrow">
                <span className="rp-tag">Admin</span>
                <span className="rp-tag">Security</span>
              </div>
              <h1>Users & Permissions</h1>
              <p>Create staff accounts and control access</p>
            </div>
          </div>

          {error && <div className="rp-alert rp-alert--danger">{error}</div>}

          {/* GRID */}
          <section className="rp-grid rp-card-anim">
            {/* Users list */}
            <div className="rp-card rp-glass">
              <div className="rp-card-head">
                <div className="rp-card-title">Existing Users</div>
              </div>
              <div className="rp-table-wrap">
                <table className="rp-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Permissions</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={5} className="rp-td-empty">Loading…</td></tr>
                    ) : users.map(u => (
                      <tr key={u.id}>
                        <td className="rp-strong">{u.username}</td>
                        <td><span className="rp-pill">{u.role}</span></td>
                        <td>
                          {u.permissions?.canEditStock && "Stock "}
                          {u.permissions?.canViewReports && "Reports "}
                          {u.permissions?.canManageUsers && "Users"}
                        </td>
                        <td>
                          <span className={`rp-pill ${u.is_active ? "" : "rp-pill--danger"}`}>
                            {u.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <button className="rp-link-btn" onClick={() => editUser(u)}>Edit</button>
                          {u.is_active && (
                            <button className="rp-link-btn" onClick={() => deactivateUser(u.id)}>
                              Deactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Form */}
            <div className="rp-card rp-glass">
              <div className="rp-card-head">
                <div className="rp-card-title">{editingId ? "Edit User" : "New User"}</div>
              </div>

              <form className="rp-card-body" onSubmit={saveUser}>
                <div className="rp-form-grid">
                  <div>
                    <div className="rp-label">Username</div>
                    <input className="rp-input" value={username} onChange={e => setUsername(e.target.value)} />
                  </div>

                  <div>
                    <div className="rp-label">Password</div>
                    <input className="rp-input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                  </div>

                  <div>
                    <div className="rp-label">Role</div>
                    <select className="rp-input" value={role} onChange={e => setRole(e.target.value as any)}>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="rp-seg" style={{ marginTop: 10 }}>
                  <label className="rp-check"><input type="checkbox" checked={permStock} onChange={e => setPermStock(e.target.checked)} /> Stock</label>
                  <label className="rp-check"><input type="checkbox" checked={permReports} onChange={e => setPermReports(e.target.checked)} /> Reports</label>
                  <label className="rp-check"><input type="checkbox" checked={permUsers} onChange={e => setPermUsers(e.target.checked)} /> Users</label>
                </div>

                <label className="rp-check" style={{ marginTop: 10 }}>
                  <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                  Active
                </label>

                <div style={{ marginTop: 12 }}>
                  <button className="rp-seg-item rp-seg-item--primary" disabled={submitting}>
                    {editingId ? "Save Changes" : "Create User"}
                  </button>
                  {editingId && (
                    <button type="button" className="rp-link-btn" onClick={resetForm}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </section>

          <footer className="rp-footer">© 2025 Ram Pottery Ltd • MoBiz.mu</footer>
        </main>
      </div>
    </div>
  );
}
