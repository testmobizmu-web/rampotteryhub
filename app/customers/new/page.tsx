"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { rpFetch } from "@/lib/rpFetch";

/* ---------------- helpers ---------------- */
function formatRs(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return `Rs ${v.toFixed(2)}`;
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

function getRoleLabelFallback() {
  try {
    return (localStorage.getItem("rp_role") || localStorage.getItem("role") || "ADMIN").toUpperCase();
  } catch {
    return "ADMIN";
  }
}

function fmtDateTime(d: Date) {
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;
}

/* ---------------- page ---------------- */
export default function AddCustomerPage() {
  const router = useRouter();

  // hydration lock
  const [mounted, setMounted] = useState(false);

  // shell UI
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

  // role label (keeps your old fallback logic)
  const roleLabel = useMemo(() => {
    return roleUpper(session?.role) || getRoleLabelFallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.role]);

  // page state
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState({
    customer_code: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    opening_balance: "0.00",
    client: "",
  });

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  // keyboard UX + autofocus
  const nameRef = useRef<HTMLInputElement | null>(null);
  const submittingRef = useRef(false);

  function cancel() {
    if (loading) return;
    router.push("/customers");
  }

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    // theme
    const saved = localStorage.getItem("rp_theme");
    const initial = saved === "dark" ? "dark" : "light";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;

    // session
    try {
      const raw = localStorage.getItem("rp_user");
      if (!raw) {
        router.replace("/login");
        return;
      }
      const s = JSON.parse(raw);
      setSession(s);
      setLastSync(fmtDateTime(new Date()));
    } catch {
      router.replace("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ autofocus Customer Name when page opens
  useEffect(() => {
    if (!mounted) return;
    window.setTimeout(() => nameRef.current?.focus(), 50);
  }, [mounted]);

  // ✅ keyboard: Esc cancels globally (like invoices)
  useEffect(() => {
    if (!mounted) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, loading]);

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

  async function submit() {
    if (submittingRef.current) return; // double-press protection
    submittingRef.current = true;

    try {
      if (!form.name.trim()) {
        setErr("Customer name is required.");
        return;
      }

      setLoading(true);
      setErr(null);

      await rpFetch("/api/customers/create", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          opening_balance: Number(form.opening_balance || 0),
        }),
      });

      showToast("Customer created ✅");
      window.setTimeout(() => router.push("/customers"), 650);
    } catch (e: any) {
      setErr(e?.message || "Failed to create customer");
      submittingRef.current = false; // allow retry
    } finally {
      setLoading(false);
    }
  }

  // ✅ Enter submits (except textarea). Textarea uses Ctrl/Cmd+Enter to submit.
  function onFieldKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (loading) return;

    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
      return;
    }

    if (e.key === "Enter") {
      const target = e.target as HTMLElement | null;
      const tag = (target?.tagName || "").toLowerCase();

      // allow normal Enter in textarea
      if (tag === "textarea") {
        // Ctrl/Cmd+Enter submits from textarea
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
          e.preventDefault();
          submit();
        }
        return;
      }

      // normal Enter submits from all other fields
      if (!e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        submit();
      }
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
      ...(roleUpper(session?.role) === "ADMIN" ? [{ href: "/admin/users", label: "Users & Permissions" }] : []),
    ],
    [session?.role]
  );

  if (!mounted) return null;

  return (
    <div className="rp-app">
      {/* Premium bg */}
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
            <div className="rp-mtop-sub">New Customer</div>
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
                  className={`rp-nav-btn ${it.href === "/customers" ? "rp-nav-btn--active" : ""}`}
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
                  className={`rp-nav-btn ${it.href === "/customers" ? "rp-nav-btn--active" : ""}`}
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
        <main className="rp-main" onKeyDown={onFieldKeyDown as any}>
          {/* Top bar */}
          <header className="rp-top rp-top--saas rp-card-anim" style={{ animationDelay: "60ms" }}>
            <div className="rp-top-left--actions">
              <Link className="rp-ui-btn rp-ui-btn--brand" href="/customers" prefetch={false}>
                <span className="rp-ui-btn__dot" aria-hidden="true" />
                ← Customers
              </Link>

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
              <div className="rp-exec__title">Add Customer</div>
              <div className="rp-exec__sub">
                Keyboard: <b>Enter</b> to save • <b>Esc</b> to cancel • Address: <b>Ctrl/Cmd+Enter</b> to save
              </div>
            </div>
            <div className="rp-exec__right">
              <span className={`rp-live ${loading ? "is-dim" : ""}`}>
                <span className="rp-live-dot" aria-hidden="true" />
                {loading ? "Saving" : "Ready"}
              </span>
              <span className="rp-chip rp-chip--soft">Customers</span>
            </div>
          </section>

          {/* Actions strip */}
          <section className="rp-actions rp-card-anim">
            <div className="rp-seg rp-seg--pro">
              <button className="rp-seg-item rp-seg-item--brand" type="button" onClick={cancel} disabled={loading}>
                <span className="rp-icbtn" aria-hidden="true">
                  ↩
                </span>
                Cancel (Esc)
              </button>

              <button className="rp-seg-item rp-seg-item--brand" type="button" onClick={submit} disabled={loading}>
                <span className="rp-icbtn" aria-hidden="true">
                  ＋
                </span>
                {loading ? "Saving…" : "Create Customer (Enter)"}
              </button>
            </div>
          </section>

          {/* Form */}
          <section className="rp-card rp-card-anim">
            <div className="rp-card-head rp-card-head--tight">
              <div>
                <div className="rp-card-title">Customer Information</div>
                <div className="rp-card-sub">All fields are optional except customer name</div>
              </div>
              <span className={`rp-chip ${loading ? "is-dim" : ""}`}>{loading ? "Working…" : "Ready"}</span>
            </div>

            <div className="rp-card-body">
              <div className="rp-form-grid">
                <label className="rp-field">
                  <span className="rp-label">Customer Code</span>
                  <input
                    className="rp-input"
                    value={form.customer_code}
                    onChange={(e) => update("customer_code", e.target.value)}
                  />
                </label>

                <label className="rp-field">
                  <span className="rp-label">Customer Name *</span>
                  <input
                    ref={nameRef}
                    className="rp-input"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    required
                    placeholder="e.g. Aqua Valley Ltd"
                  />
                </label>

                <label className="rp-field">
                  <span className="rp-label">Phone</span>
                  <input
                    className="rp-input"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="e.g. 5xxxxxxx"
                  />
                </label>

                <label className="rp-field">
                  <span className="rp-label">Email</span>
                  <input
                    className="rp-input"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="e.g. accounts@company.com"
                  />
                </label>

                <label className="rp-field rp-field--full">
                  <span className="rp-label">Address</span>
                  <textarea
                    className="rp-input"
                    rows={3}
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder="Street, City, Country"
                    style={{ resize: "vertical" }}
                  />
                </label>

                <label className="rp-field">
                  <span className="rp-label">Opening Balance</span>
                  <input
                    className="rp-input"
                    type="number"
                    step="0.01"
                    value={form.opening_balance}
                    onChange={(e) => update("opening_balance", e.target.value)}
                  />
                  <div className="rp-muted" style={{ marginTop: 6, fontWeight: 900 }}>
                    {formatRs(Number(form.opening_balance))}
                  </div>
                </label>

                <label className="rp-field">
                  <span className="rp-label">Client / Category</span>
                  <input
                    className="rp-input"
                    value={form.client}
                    onChange={(e) => update("client", e.target.value)}
                    placeholder="e.g. Retail / Wholesale"
                  />
                </label>
              </div>

              {err ? (
                <div className="rp-note rp-note--warn" style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>
                  {err}
                </div>
              ) : null}

              <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <button className="rp-ui-btn" type="button" onClick={cancel} disabled={loading}>
                  <span className="rp-ui-btn__dot" aria-hidden="true" />
                  Cancel
                </button>

                <button className="rp-ui-btn rp-ui-btn--danger rp-glow" type="button" disabled={loading} onClick={submit}>
                  <span className="rp-ui-btn__dot" aria-hidden="true" />
                  {loading ? "Saving…" : "Create Customer"}
                </button>
              </div>
            </div>
          </section>

          <footer className="rp-footer">© {new Date().getFullYear()} Ram Pottery Ltd • Built by Mobiz.mu</footer>

          {/* local helpers for responsive form grid */}
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
            .rp-field--full {
              grid-column: 1 / -1;
            }
          `}</style>
        </main>
      </div>
    </div>
  );
}

