"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Customer = {
  id: number;
  customer_code: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
};

function safe(v: unknown) {
  return String(v ?? "").trim();
}

export default function CustomersPage() {
  const router = useRouter();

  const [list, setList] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [customerCode, setCustomerCode] = useState("");
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

  async function load() {
    setLoading(true);
    setErr(null);

    const { data, error } = await supabase
      .from("customers")
      .select("id, customer_code, name, phone, email, address")
      .order("name");

    if (error) {
      setErr(error.message);
      setList([]);
    } else {
      setList((data ?? []) as Customer[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return list;

    return list.filter((c) => {
      const hay = [
        c.customer_code || "",
        c.name || "",
        c.phone || "",
        c.email || "",
        c.address || "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [list, q]);

  function resetForm() {
    setEditingId(null);
    setCustomerCode("");
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
  }

  function startEdit(c: Customer) {
    setEditingId(c.id);
    setCustomerCode(c.customer_code || "");
    setName(c.name || "");
    setPhone(c.phone || "");
    setEmail(c.email || "");
    setAddress(c.address || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSave() {
    if (!safe(name)) {
      alert("Customer name is required");
      return;
    }

    const payload = {
      customer_code: safe(customerCode) || null,
      name: safe(name),
      phone: safe(phone) || null,
      email: safe(email) || null,
      address: safe(address) || null,
    };

    if (editingId) {
      const { error } = await supabase
        .from("customers")
        .update(payload)
        .eq("id", editingId);
      if (error) return alert(error.message);
    } else {
      const { error } = await supabase.from("customers").insert(payload);
      if (error) return alert(error.message);
    }

    resetForm();
    load();
  }

  async function handleDelete(id: number) {
    const ok = confirm("Delete this customer? This cannot be undone.");
    if (!ok) return;

    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) return alert(error.message);

    if (editingId === id) resetForm();
    load();
  }

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
        <Link className="rp-nav-btn rp-nav-btn--active" href="/customers" onClick={() => setMobileNavOpen(false)}>
          Customers
        </Link>
        <Link className="rp-nav-btn" href="/suppliers" onClick={() => setMobileNavOpen(false)}>
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
          <b>Customers</b>
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
        <button
          className="rp-icon-btn"
          type="button"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
        >
          <span className="rp-burger" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </button>

        <div className="rp-mtop-brand">
          <div className="rp-mtop-title">Customers</div>
          <div className="rp-mtop-sub">Add • Edit • Pricing</div>
        </div>

        <button className="rp-icon-btn" type="button" onClick={() => router.push("/")} aria-label="Dashboard">
          ⌂
        </button>
      </div>

      {/* Mobile overlay + drawer */}
      <div
        className={`rp-overlay ${mobileNavOpen ? "is-open" : ""}`}
        onClick={() => setMobileNavOpen(false)}
      />
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
                <span className="rp-tag">Catalog</span>
                <span className="rp-tag">Partywise Pricing</span>
              </div>
              <h1>Customers</h1>
              <p>Add, edit and manage customers — premium view</p>
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
                {editingId ? "✓ Save Changes" : "+ Add Customer"}
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

              <Link className="rp-seg-item" href="/customers/pricing-import">
                Bulk Pricing Import
              </Link>
            </div>
          </div>

          {err ? (
            <div
              className="rp-card rp-glass rp-card-anim"
              style={{ animationDelay: "120ms", borderColor: "rgba(227,6,19,.32)" }}
            >
              <div className="rp-card-body" style={{ color: "rgba(255,255,255,.92)", fontWeight: 900 }}>
                {err}
              </div>
            </div>
          ) : null}

          {/* Form card */}
          <section className="rp-card rp-glass rp-card-anim" style={{ animationDelay: "150ms" }}>
            <div className="rp-card-head">
              <div>
                <div className="rp-card-title">{editingId ? "Edit Customer" : "Add Customer"}</div>
                <div className="rp-card-sub">
                  {editingId
                    ? "Update details and save changes. Pricing stays in /customers/[id]/pricing."
                    : "Fill customer details then add. Pricing can be managed per customer."}
                </div>
              </div>

              <div className="rp-pill">
                Showing <b>{filtered.length}</b> / <b>{list.length}</b>
              </div>
            </div>

            <div className="rp-card-body">
              <div className="rp-form-grid">
                <div>
                  <div className="rp-label">Customer Code</div>
                  <input
                    className="rp-input"
                    value={customerCode}
                    onChange={(e) => setCustomerCode(e.target.value)}
                    placeholder="CUST-001"
                  />
                </div>

                <div>
                  <div className="rp-label">Customer Name *</div>
                  <input
                    className="rp-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Anytime Anywhere Tour Operator Ltd"
                  />
                </div>

                <div>
                  <div className="rp-label">Phone</div>
                  <input
                    className="rp-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+230 5778 8884"
                  />
                </div>

                <div>
                  <div className="rp-label">Email</div>
                  <input
                    className="rp-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@client.com"
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <div className="rp-label">Address</div>
                  <input
                    className="rp-input"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Grand Baie"
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                <button className="rp-link-btn" type="button" onClick={handleSave}>
                  {editingId ? "✓ Save Changes" : "+ Add Customer"}
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
                <div className="rp-card-title">Customer List</div>
                <div className="rp-card-sub">
                  Tip: use <b>Pricing →</b> to set customer-specific prices (partywise pricing).
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  className="rp-input"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search code, name, phone, email, address…"
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
                    <th style={{ width: 140 }}>Code</th>
                    <th>Name</th>
                    <th style={{ width: 160 }}>Phone</th>
                    <th style={{ width: 260 }}>Email</th>
                    <th>Address</th>
                    <th style={{ width: 290 }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="rp-td-empty">
                        Loading customers…
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="rp-td-empty">
                        No customers found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => (
                      <tr key={c.id}>
                        <td>{c.customer_code || "—"}</td>
                        <td className="rp-strong">{c.name}</td>
                        <td>{c.phone || "—"}</td>
                        <td>{c.email || "—"}</td>
                        <td>{c.address || "—"}</td>
                        <td>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button type="button" className="rp-link-btn" onClick={() => startEdit(c)}>
                              Edit
                            </button>

                            <button
                              type="button"
                              className="rp-link-btn"
                              onClick={() => handleDelete(c.id)}
                              style={{
                                borderColor: "rgba(239,68,68,.45)",
                                color: "rgba(255,90,90,.95)",
                              }}
                            >
                              Delete
                            </button>

                            <Link className="rp-seg-item rp-seg-item--primary" href={`/customers/${c.id}/pricing`}>
                              Pricing →
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ padding: "12px 16px", fontSize: 12, fontWeight: 950, color: "var(--muted)" }}>
              Showing {filtered.length} customer(s)
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
