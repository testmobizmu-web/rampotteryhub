"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type RpSession = {
  id?: string;
  username?: string;
  name?: string;
  role?: string;
};

function roleUpper(r?: string) {
  return String(r || "").toUpperCase();
}
function isAdmin(r?: string) {
  return roleUpper(r) === "ADMIN";
}
function fmtDateTime(d: Date) {
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;
}

export default function NewUserPage() {
  const router = useRouter();

  // shell
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lastSync, setLastSync] = useState<string>("—");
  const [session, setSession] = useState<RpSession | null>(null);

  // toast
  const [toast, setToast] = useState<string | null>(null);
  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  }

  // form state (your original logic)
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("sales");
  const [applyPreset, setApplyPreset] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    // theme
    const saved = localStorage.getItem("rp_theme");
    const initial = saved === "dark" ? "dark" : "light";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;

    // session + guard
    try {
      const raw = localStorage.getItem("rp_user");
      if (!raw) {
        router.replace("/login");
        return;
      }
      const s = JSON.parse(raw);
      setSession(s);

      if (!isAdmin(s?.role)) {
        router.replace("/");
        return;
      }

      setLastSync(fmtDateTime(new Date()));
    } catch {
      router.replace("/login");
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

  async function save() {
    try {
      setSaving(true);
      setErr(null);

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username,
          full_name: fullName,
          phone,
          role,
          applyPreset,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed");

      // ✅ success toast like import page
      showToast("User created ✅");

      // small delay so user actually sees toast, then redirect
      window.setTimeout(() => {
        router.push("/admin/users");
      }, 650);
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setSaving(false);
    }
  }

  const navItems = useMemo(
    () => [
      { href: "/", label: "Dashboard" },
      { href: "/invoices", label: "Invoices" },
      { href: "/credit-notes", label: "Credit Notes" },
      { href: "/stock", label: "Stock & Categories" },
      { href: "/stock-movements", label: "Stock Movements" },
      { href: "/customers", label: "Customers" },
      { href: "/reports", label: "Reports & Statements" },
      { href: "/admin/users", label: "Users & Permissions" },
    ],
    []
  );

  if (!mounted) return null;

  return (
    <div className="rp-app">
      <div className="rp-bg" aria-hidden="true">
        <div className="rp-bg-orb rp-bg-orb--1" />
        <div className="rp-bg-orb rp-bg-orb--2" />
        <div className="rp-bg-orb rp-bg-orb--3" />
        <div className="rp-bg-grid" />
      </div>

      {/* ✅ Toast */}
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
            <div className="rp-mtop-sub">Create User</div>
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
                <b>{roleUpper(session?.role) || "—"}</b>
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
                <b>{roleUpper(session?.role) || "—"}</b>
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
              <div className="rp-exec__title">Create New User</div>
              <div className="rp-exec__sub">Admin only • presets • clean roles • quick onboarding</div>
            </div>
            <div className="rp-exec__right">
              <span className="rp-chip rp-chip--soft">ADMIN</span>
              <span className="rp-chip">Users</span>
            </div>
          </section>

          {/* Actions */}
          <section className="rp-actions rp-card-anim">
            <div className="rp-seg rp-seg--pro">
              <Link className="rp-seg-item rp-seg-item--brand" href="/admin/users" prefetch={false}>
                <span className="rp-icbtn" aria-hidden="true">
                  ←
                </span>
                Back to Users
              </Link>

              <button className="rp-seg-item rp-seg-item--brand" type="button" onClick={save} disabled={saving}>
                <span className="rp-icbtn" aria-hidden="true">
                  ＋
                </span>
                {saving ? "Saving…" : "Create User"}
              </button>
            </div>
          </section>

          {/* Form card */}
          <section className="rp-card rp-card-anim">
            <div className="rp-card-head rp-card-head--tight">
              <div>
                <div className="rp-card-title">User Details</div>
                <div className="rp-card-sub">Username • profile info • role preset permissions</div>
              </div>
              <span className={`rp-chip ${saving ? "is-dim" : ""}`}>{saving ? "Saving…" : "Ready"}</span>
            </div>

            <div className="rp-card-body">
              {err ? (
                <div className="rp-note rp-note--warn" style={{ marginBottom: 12, whiteSpace: "pre-wrap" }}>
                  {err}
                </div>
              ) : null}

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
                  <div className="rp-field-hint">Tip: keep it lowercase and unique.</div>
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
                  <select className="rp-input" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="admin">admin</option>
                    <option value="accounting">accounting</option>
                    <option value="sales">sales</option>
                    <option value="viewer">viewer</option>
                  </select>
                  <div className="rp-field-hint">Role controls default permissions preset.</div>
                </label>

                <label className="rp-check" style={{ gridColumn: "1 / -1" }}>
                  <input type="checkbox" checked={applyPreset} onChange={(e) => setApplyPreset(e.target.checked)} />
                  Apply default permissions preset for this role
                </label>
              </div>

              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="rp-ui-btn" type="button" onClick={() => router.push("/admin/users")} disabled={saving}>
                  <span className="rp-ui-btn__dot" aria-hidden="true" />
                  Cancel
                </button>
                <button className="rp-ui-btn rp-ui-btn--danger" type="button" onClick={save} disabled={saving}>
                  <span className="rp-ui-btn__dot" aria-hidden="true" />
                  {saving ? "Saving…" : "Create"}
                </button>
              </div>
            </div>
          </section>

          <footer className="rp-footer">© {new Date().getFullYear()} Ram Pottery Ltd • Built by Mobiz.mu</footer>

          {/* local helpers (grid + check style) */}
          <style jsx>{`
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
          `}</style>
        </main>
      </div>
    </div>
  );
}
