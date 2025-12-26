"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Supplier = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
};

function safe(v: unknown) {
  return String(v ?? "").trim();
}

export default function SuppliersPage() {
  const router = useRouter();

  const [list, setList] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  // ✅ Mobile drawer
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // lock background scroll when drawer is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  // close on ESC
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileNavOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const load = async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase.from("suppliers").select("*").order("name");
    if (error) {
      setErr(error.message);
      setList([]);
    } else {
      setList((data ?? []) as Supplier[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
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
  }

  function startEdit(s: Supplier) {
    setEditingId(s.id);
    setName(s.name || "");
    setPhone(s.phone || "");
    setEmail(s.email || "");
    setAddress(s.address || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const handleSave = async () => {
    if (!safe(name)) {
      alert("Supplier name is required");
      return;
    }

    const payload = {
      name: safe(name),
      phone: safe(phone) || null,
      email: safe(email) || null,
      address: safe(address) || null,
    };

    if (editingId) {
      const { error } = await supabase.from("suppliers").update(payload).eq("id", editingId);
      if (error) return alert(error.message);
    } else {
      const { error } = await supabase.from("suppliers").insert(payload);
      if (error) return alert(error.message);
    }

    resetForm();
    load();
  };

  const handleDelete = async (id: number) => {
    const ok = confirm("Delete this supplier? This cannot be undone.");
    if (!ok) return;

    const { error } = await supabase.from("suppliers").delete().eq("id", id);
    if (error) return alert(error.message);

    if (editingId === id) resetForm();
    load();
  };

  const SideContent = (
    <div className="rp-side-card rp-card-anim">
      <div className="rp-brand">
        <div className="rp-brand-logo">
          <Image
            src="/images/logo/logo.png"
            alt="Ram Pottery Ltd"
            width={44}
            height={44}
            priority
            style={{ width: 44, height: 44, objectFit: "contain" }}
          />
        </div>
        <div className="rp-brand-text">
          <div className="rp-brand-title">Ram Pottery Ltd</div>
          <div className="rp-brand-sub">Online Accounting & Stock Manager</div>
        </div>
      </div>

      <nav className="rp-nav">
        <Link className="rp-nav-btn" href="/" onClick={() => setMobileNavOpen(false)}>
          Dashboard
        </Link>
        <Link className="rp-nav-btn" href="/invoices" onClick={() => setMobileNavOpen(false)}>
          Invoices
        </Link>
        <Link className="rp-nav-btn" href="/credit-notes" onClick={() => setMobileNavOpen(false)}>
          Credit Notes
        </Link>
        <Link className="rp-nav-btn" href="/products" onClick={() => setMobileNavOpen(false)}>
          Stock & Categories
        </Link>
        <Link className="rp-nav-btn" href="/stock-movements" onClick={() => setMobileNavOpen(false)}>
          Stock Movements
        </Link>
        <Link className="rp-nav-btn" href="/customers" onClick={() => setMobileNavOpen(false)}>
          Customers
        </Link>
        <Link className="rp-nav-btn rp-nav-btn--active" href="/suppliers" onClick={() => setMobileNavOpen(false)}>
          Suppliers
        </Link>
        <Link className="rp-nav-btn" href="/reports" onClick={() => setMobileNavOpen(false)}>
          Reports & Statements
        </Link>
        <Link className="rp-nav-btn" href="/admin/users" onClick={() => setMobileNavOpen(false)}>
          Users & Permissions
        </Link>
      </nav>

      <div className="rp-side-footer">
        <div className="rp-role">
          <span>Module</span>
          <b>Suppliers</b>
        </div>
      </div>
    </div>
  );

  return (
    <div className="rp-app">
      {/* Luxury animated background */}
      <div className="rp-bg" aria-hidden="true">
        <span className="rp-bg-orb rp-bg-orb--1" />
        <span className="rp-bg-orb rp-bg-orb--2" />
        <span className="rp-bg-orb rp-bg-orb--3" />
        <span className="rp-bg-grid" />
      </div>

      {/* Mobile top bar */}
      <div className="rp-mtop">
        <button className="rp-icon-btn" type="button" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
          <span className="rp-burger" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </button>

        <div className="rp-mtop-brand">
          <div className="rp-mtop-title">Suppliers</div>
          <div className="rp-mtop-sub">Add • Edit • List</div>
        </div>

        <button className="rp-icon-btn" type="button" onClick={() => router.push("/")} aria-label="Dashboard">
          ⌂
        </button>
      </div>

      {/* Mobile overlay + drawer */}
      <div className={`rp-overlay ${mobileNavOpen ? "is-open" : ""}`} onClick={() => setMobileNavOpen(false)} />
      <div className={`rp-drawer ${mobileNavOpen ? "is-open" : ""}`} role="dialog" aria-modal="true">
        <div className="rp-drawer-head">
          <div className="rp-drawer-brand">
            <div className="rp-drawer-logo">
              <Image src="/images/logo/logo.png" alt="Ram Pottery" width={34} height={34} />
            </div>
            <div>
              <div className="rp-drawer-title">Ram Pottery Ltd</div>
              <div className="rp-drawer-sub">Secure • Cloud</div>
            </div>
          </div>

          <button className="rp-icon-btn" type="button" onClick={() => setMobileNavOpen(false)} aria-label="Close">
            ✕
          </button>
        </div>

        {SideContent}
      </div>

      <div className="rp-shell rp-enter">
        {/* Desktop sidebar */}
        <aside className="rp-side">{SideContent}</aside>

        {/* Main */}
        <main className="rp-main">
          {/* Header */}
          <div className="rp-top rp-card-anim" style={{ animationDelay: "40ms" }}>
            <div className="rp-title">
              <div className="rp-eyebrow">
                <span className="rp-tag">Secure • Cloud</span>
                <span className="rp-tag">Vendors</span>
                <span className="rp-tag">Accounts Payable</span>
              </div>
              <h1>Suppliers</h1>
              <p>Add, edit and manage suppliers — premium view</p>
            </div>

            <div className="rp-top-right">
              <button className="rp-theme-btn" type="button" onClick={load} disabled={loading} style={{ minWidth: 118 }}>
                {loading ? "Loading…" : "Refresh"}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="rp-actions rp-card-anim" style={{ animationDelay: "90ms" }}>
            <div className="rp-seg">
              <button className="rp-seg-item rp-seg-item--primary" type="button" onClick={handleSave}>
                {editingId ? "✓ Save Changes" : "+ Add Supplier"}
              </button>

              {editingId ? (
                <button className="rp-seg-item" type="button" onClick={resetForm}>
                  Cancel Edit
                </button>
              ) : (
                <button className="rp-seg-item" type="button" onClick={() => router.push("/")}>
                  ← Dashboard
                </button>
              )}
            </div>
          </div>

          {err ? (
            <div className="rp-card rp-glass rp-card-anim" style={{ animationDelay: "120ms", borderColor: "rgba(227,6,19,.32)" }}>
              <div className="rp-card-body" style={{ color: "rgba(255,255,255,.92)", fontWeight: 900 }}>
                {err}
              </div>
            </div>
          ) : null}

          {/* Form card */}
          <section className="rp-card rp-glass rp-card-anim" style={{ animationDelay: "150ms" }}>
            <div className="rp-card-head">
              <div>
                <div className="rp-card-title">{editingId ? "Edit Supplier" : "Add Supplier"}</div>
                <div className="rp-card-sub">
                  {editingId ? "Update supplier details then save changes." : "Fill supplier details then add."}
                </div>
              </div>

              <div className="rp-pill">
                Showing <b>{filtered.length}</b> / <b>{list.length}</b>
              </div>
            </div>

            <div className="rp-card-body">
              <div className="rp-form-grid">
                <div style={{ gridColumn: "1 / -1" }}>
                  <div className="rp-label">Supplier Name *</div>
                  <input
                    className="rp-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Clay raw material supplier"
                  />
                </div>

                <div>
                  <div className="rp-label">Phone</div>
                  <input className="rp-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>

                <div>
                  <div className="rp-label">Email</div>
                  <input className="rp-input" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <div className="rp-label">Address</div>
                  <input className="rp-input" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                <button className="rp-link-btn" type="button" onClick={handleSave}>
                  {editingId ? "✓ Save Changes" : "+ Add Supplier"}
                </button>

                {editingId ? (
                  <button className="rp-link-btn" type="button" onClick={resetForm}>
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </div>
          </section>

          {/* Search + List */}
          <section className="rp-card rp-glass rp-card-anim" style={{ animationDelay: "190ms" }}>
            <div className="rp-card-head">
              <div>
                <div className="rp-card-title">Supplier List</div>
                <div className="rp-card-sub">Search and manage suppliers (edit / delete).</div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  className="rp-input"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search name, phone, email, address…"
                  style={{ width: 360, maxWidth: "100%" }}
                />
                <button className="rp-link-btn" type="button" onClick={load} disabled={loading}>
                  {loading ? "Loading…" : "Refresh"}
                </button>
              </div>
            </div>

            <div className="rp-table-wrap">
              <table className="rp-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th style={{ width: 180 }}>Phone</th>
                    <th style={{ width: 260 }}>Email</th>
                    <th>Address</th>
                    <th style={{ width: 240 }}>Actions</th>
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
                      <tr key={s.id}>
                        <td className="rp-strong">{s.name}</td>
                        <td>{s.phone || "—"}</td>
                        <td>{s.email || "—"}</td>
                        <td>{s.address || "—"}</td>
                        <td>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button type="button" className="rp-link-btn" onClick={() => startEdit(s)}>
                              Edit
                            </button>

                            <button
                              type="button"
                              className="rp-link-btn"
                              onClick={() => handleDelete(s.id)}
                              style={{
                                borderColor: "rgba(239,68,68,.45)",
                                color: "rgba(255,90,90,.95)",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ padding: "12px 16px", fontSize: 12, fontWeight: 950, color: "var(--muted)" }}>
              Showing {filtered.length} supplier(s)
            </div>
          </section>

          <footer className="rp-footer rp-card-anim" style={{ animationDelay: "230ms" }}>
            © 2025 Ram Pottery Ltd • Built by <span>MoBiz.mu</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

