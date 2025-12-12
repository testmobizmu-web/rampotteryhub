"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

type SidebarActive =
  | "dashboard"
  | "invoices"
  | "stock"
  | "customers"
  | "suppliers"
  | "reports"
  | "adminUsers";

/* ========= Page ========= */

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<"admin" | "staff">("staff");
  const [permEditStock, setPermEditStock] = useState(true);
  const [permViewReports, setPermViewReports] = useState(true);
  const [permManageUsers, setPermManageUsers] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* ---- Load users from API ---- */

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/admin/users");
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Failed to load users");
        }
        const json = await res.json();
        setUsers(json.users ?? json ?? []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error loading users");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  /* ---- Helpers ---- */

  function resetFormToNew() {
    setEditingId(null);
    setFormUsername("");
    setFormPassword("");
    setFormRole("staff");
    setPermEditStock(true);
    setPermViewReports(true);
    setPermManageUsers(false);
    setIsActive(true);
  }

  function fillFormFromUser(u: UserRow) {
    setEditingId(u.id);
    setFormUsername(u.username);
    setFormPassword("");
    setFormRole(u.role);
    setPermEditStock(!!u.permissions?.canEditStock);
    setPermViewReports(!!u.permissions?.canViewReports);
    setPermManageUsers(!!u.permissions?.canManageUsers);
    setIsActive(u.is_active);
  }

  /* ---- Submit create / update ---- */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formUsername.trim()) return;

    setSubmitting(true);
    setError(null);

    const body: any = {
      username: formUsername.trim(),
      role: formRole,
      is_active: isActive,
      permissions: {
        canEditStock: permEditStock,
        canViewReports: permViewReports,
        canManageUsers: permManageUsers,
      },
    };

    // only send password when creating or when user typed one
    if (!editingId || formPassword.trim()) {
      body.password = formPassword.trim();
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId ? { id: editingId, ...body } : body
        ),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to save user");
      }

      // update list
      const updated = await res.json();
      setUsers(updated.users ?? updated ?? []);
      resetFormToNew();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error saving user");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(id: number) {
    if (!confirm("Deactivate this user? They will not be able to log in.")) {
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: false }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to deactivate user");
      }

      const updated = await res.json();
      setUsers(updated.users ?? updated ?? []);
      if (editingId === id) resetFormToNew();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error deactivating user");
    } finally {
      setSubmitting(false);
    }
  }

  /* ========= UI ========= */

  return (
    <div className="rp-app">
      {/* SIDEBAR */}
      <aside className="rp-sidebar">
        <SidebarContent router={useRouter()} active="adminUsers" />
      </aside>

      {/* MAIN */}
      <main className="dashboard-main">
        <div className="dashboard-inner admin-users-page">
          <div className="dashboard-header">
            <div>
              <h1 className="admin-users-title">Admin – Users &amp; Permissions</h1>
              <p className="admin-users-subtitle">
                Create staff logins, assign roles, and control who can manage
                stock and reports.
              </p>
            </div>
            <div className="dashboard-header-right">
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={resetFormToNew}
              >
                + New User
              </button>
            </div>
          </div>

          {error && (
            <p style={{ color: "#b91c1c", fontSize: 13, marginBottom: 10 }}>
              {error}
            </p>
          )}

          {/* GRID: existing users + form */}
          <div className="admin-users-grid">
            {/* LEFT – Existing users */}
            <div className="admin-card">
              <h2
                style={{
                  fontSize: "0.9rem",
                  margin: 0,
                  marginBottom: "0.9rem",
                }}
              >
                Existing Users
              </h2>

              {loading ? (
                <p style={{ fontSize: 12 }}>Loading users…</p>
              ) : users.length === 0 ? (
                <p style={{ fontSize: 12 }}>No users found.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Permissions</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.username}</td>
                        <td>
                          <span className="admin-pill admin-pill-role">
                            {u.role}
                          </span>
                        </td>
                        <td style={{ fontSize: 11 }}>
                          {u.permissions?.canEditStock ? "Stock " : ""}
                          {u.permissions?.canViewReports ? "Reports " : ""}
                          {u.permissions?.canManageUsers ? "Users " : ""}
                        </td>
                        <td>
                          <span
                            className={
                              "admin-pill " +
                              (u.is_active
                                ? "admin-pill-status-active"
                                : "admin-pill-status-inactive")
                            }
                          >
                            {u.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost"
                            onClick={() => fillFormFromUser(u)}
                          >
                            Edit
                          </button>
                          {u.is_active && (
                            <button
                              type="button"
                              className="admin-btn admin-btn-danger"
                              style={{ marginLeft: 6 }}
                              onClick={() => handleDeactivate(u.id)}
                            >
                              Deactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* RIGHT – Create / edit user */}
            <div className="admin-card">
              <h2
                style={{
                  fontSize: "0.9rem",
                  margin: 0,
                  marginBottom: "0.9rem",
                }}
              >
                {editingId ? "Edit User" : "New User"}
              </h2>

              <form onSubmit={handleSubmit}>
                {/* Username */}
                <div>
                  <div className="admin-field-label">Username</div>
                  <input
                    className="admin-input"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="e.g. stock.manager"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="admin-field-label">
                    Password{" "}
                    {editingId && (
                      <span className="text-muted">
                        (leave blank to keep current)
                      </span>
                    )}
                  </div>
                  <input
                    className="admin-input"
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={
                      editingId ? "•••••• (unchanged if empty)" : "Set a password"
                    }
                  />
                </div>

                {/* Role */}
                <div>
                  <div className="admin-field-label">Role</div>
                  <select
                    className="admin-select"
                    value={formRole}
                    onChange={(e) =>
                      setFormRole(e.target.value as "admin" | "staff")
                    }
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Permissions */}
                <div>
                  <div className="admin-field-label">Permissions</div>
                  <div className="admin-checkbox-row">
                    <input
                      type="checkbox"
                      checked={permEditStock}
                      onChange={(e) => setPermEditStock(e.target.checked)}
                    />
                    <span>Can edit stock &amp; products</span>
                  </div>
                  <div className="admin-checkbox-row">
                    <input
                      type="checkbox"
                      checked={permViewReports}
                      onChange={(e) => setPermViewReports(e.target.checked)}
                    />
                    <span>Can view reports &amp; statements</span>
                  </div>
                  <div className="admin-checkbox-row">
                    <input
                      type="checkbox"
                      checked={permManageUsers}
                      onChange={(e) => setPermManageUsers(e.target.checked)}
                    />
                    <span>Can manage users</span>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <div className="admin-field-label">Status</div>
                  <div className="admin-checkbox-row">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    <span>Active (can log in)</span>
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ marginTop: 4 }}>
                  <button
                    type="submit"
                    className="admin-btn admin-btn-primary"
                    disabled={submitting}
                  >
                    {editingId ? "Save Changes" : "Create User"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="admin-btn admin-btn-outline"
                      style={{ marginLeft: 8 }}
                      onClick={resetFormToNew}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ========= Sidebar (same style as dashboard) ========= */

type SidebarProps = {
  router: ReturnType<typeof useRouter>;
  active: SidebarActive;
};

function SidebarContent({ router, active }: SidebarProps) {
  const [canEditStock, setCanEditStock] = useState(true);
  const [canViewReports, setCanViewReports] = useState(true);
  const [canManageUsers, setCanManageUsers] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("rp_user");
    if (!raw) return;
    try {
      const user = JSON.parse(raw);
      const perms = user.permissions || {};
      const isAdmin = user.role === "admin";
      setCanEditStock(isAdmin || !!perms.canEditStock);
      setCanViewReports(isAdmin || !!perms.canViewReports);
      setCanManageUsers(isAdmin || !!perms.canManageUsers);
    } catch {
      // ignore
    }
  }, []);

  return (
    <>
      <div className="rp-sidebar-logo">
        <Image
          src="/images/logo/logo.png"
          alt="Ram Pottery Logo"
          width={34}
          height={34}
        />
        <div>
          <div className="rp-sidebar-logo-title">Ram Pottery Ltd</div>
          <div className="rp-sidebar-logo-sub">
            Online Accounting &amp; Stock Manager
          </div>
        </div>
      </div>

      <div className="rp-sidebar-nav">
        <div className="rp-nav-section-title">Overview</div>
        <button
          className={
            "rp-nav-item " +
            (active === "dashboard" ? "rp-nav-item-active" : "")
          }
          onClick={() => router.push("/")}
        >
          <span>Dashboard</span>
        </button>

        <div className="rp-nav-section-title">Sales</div>
        <button
          className={
            "rp-nav-item " +
            (active === "invoices" ? "rp-nav-item-active" : "")
          }
          onClick={() => router.push("/invoices")}
        >
          <span>Invoices</span>
        </button>

        {canEditStock && (
          <>
            <div className="rp-nav-section-title">Stock</div>
            <button
              className={
                "rp-nav-item " +
                (active === "stock" ? "rp-nav-item-active" : "")
              }
              onClick={() => router.push("/stock")}
            >
              <span>Stock &amp; Categories</span>
            </button>
            <button
              className="rp-nav-item"
              onClick={() => router.push("/stock/movements")}
            >
              <span>Stock Movements</span>
            </button>
          </>
        )}

        <div className="rp-nav-section-title">Contacts</div>
        <button
          className={
            "rp-nav-item " +
            (active === "customers" ? "rp-nav-item-active" : "")
          }
          onClick={() => router.push("/customers")}
        >
          <span>Customers</span>
        </button>
        <button
          className={
            "rp-nav-item " +
            (active === "suppliers" ? "rp-nav-item-active" : "")
          }
          onClick={() => router.push("/suppliers")}
        >
          <span>Suppliers</span>
        </button>

        {canViewReports && (
          <>
            <div className="rp-nav-section-title">Reports</div>
            <button
              className={
                "rp-nav-item " +
                (active === "reports" ? "rp-nav-item-active" : "")
              }
              onClick={() => router.push("/reports")}
            >
              <span>Reports &amp; Statements</span>
            </button>
          </>
        )}

        {canManageUsers && (
          <>
            <div className="rp-nav-section-title">Admin</div>
            <button
              className={
                "rp-nav-item " +
                (active === "adminUsers" ? "rp-nav-item-active" : "")
              }
              onClick={() => router.push("/admin/users")}
            >
              <span>Users &amp; Permissions</span>
            </button>
          </>
        )}
      </div>

      <div className="rp-sidebar-footer">
        Logged in as <strong>Admin</strong> • rampottery.mu
        <br />
        Secure cloud access &amp; testing included.
      </div>
    </>
  );
}
