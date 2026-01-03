"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { rpFetch } from "@/lib/rpFetch";

/* ---------------- helpers ---------------- */
function formatRs(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return `Rs ${v.toFixed(2)}`;
}

function getRoleLabel() {
  try {
    return (
      localStorage.getItem("rp_role") ||
      localStorage.getItem("role") ||
      "ADMIN"
    ).toUpperCase();
  } catch {
    return "ADMIN";
  }
}

/* ---------------- page ---------------- */
export default function AddCustomerPage() {
  const router = useRouter();
  const pathname = usePathname();

  const roleLabel = useMemo(() => getRoleLabel(), []);

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

  async function submit() {
    if (!form.name.trim()) {
      setErr("Customer name is required.");
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      await rpFetch("/api/customers/create", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          opening_balance: Number(form.opening_balance || 0),
        }),
      });

      router.push("/customers");
    } catch (e: any) {
      setErr(e?.message || "Failed to create customer");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- sidebar ---------------- */
  function SideNav() {
    return (
      <aside className="rp-side rp-side--desktop">
        <div className="rp-side-card rp-card-anim">
          <div className="rp-brand">
            <div className="rp-brand-logo rp-brand-logo--white">
              <img src="/images/logo/logo.png" width={40} height={40} />
            </div>
            <div>
              <div className="rp-brand-title">RamPotteryHUB</div>
              <div className="rp-brand-sub">Accounting • Stock • Invoicing</div>
            </div>
          </div>

          <nav className="rp-nav">
            <Link className="rp-nav-btn" href="/">Dashboard</Link>
            <Link className="rp-nav-btn" href="/customers">Customers</Link>
            <Link className="rp-nav-btn" href="/invoices">Invoices</Link>
            <Link className="rp-nav-btn" href="/credit-notes">Credit Notes</Link>
          </nav>

          <div className="rp-side-footer">
            <div className="rp-role">
              <span>Role</span>
              <b>{roleLabel}</b>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <div className="rp-app rp-enter">
      <div className="rp-bg" />
      <div className="rp-shell">
        <SideNav />

        <main className="rp-main">
          {/* ===== HEADER ===== */}
          <header className="rp-top rp-card-anim">
            <div>
              <Link className="rp-ui-btn rp-ui-btn--soft" href="/customers">
                ← Customers
              </Link>
            </div>

            <div className="rp-inv-center">
              <div className="rp-page-chip">
                <div className="rp-page-chip__logo">
                  <img src="/images/logo/logo.png" width={26} height={26} />
                </div>
                <div className="rp-page-chip__title">Add Customer</div>
              </div>

              <div className="rp-page-sub">
                Create • Party Details • Opening Balance
              </div>

              <div className="rp-breadcrumb">
                <span>Dashboard</span> → <span>Customers</span> →{" "}
                <b>New</b>
              </div>
            </div>

            <div />
          </header>

          {/* ===== FORM ===== */}
          <section className="rp-panel rp-card-anim">
            <div className="rp-panel-head">
              <div>
                <div className="rp-panel-title">Customer Information</div>
                <div className="rp-panel-sub">
                  All fields are optional except customer name
                </div>
              </div>
            </div>

            <div className="rp-panel-body">
              <div className="rp-grid rp-form-grid">
                <label className="rp-field">
                  <span>Customer Code</span>
                  <input
                    value={form.customer_code}
                    onChange={(e) => update("customer_code", e.target.value)}
                  />
                </label>

                <label className="rp-field">
                  <span>Customer Name *</span>
                  <input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    required
                  />
                </label>

                <label className="rp-field">
                  <span>Phone</span>
                  <input
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                </label>

                <label className="rp-field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </label>

                <label className="rp-field rp-field--full">
                  <span>Address</span>
                  <textarea
                    rows={3}
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                  />
                </label>

                <label className="rp-field">
                  <span>Opening Balance</span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.opening_balance}
                    onChange={(e) =>
                      update("opening_balance", e.target.value)
                    }
                  />
                  <small>{formatRs(Number(form.opening_balance))}</small>
                </label>

                <label className="rp-field">
                  <span>Client / Category</span>
                  <input
                    value={form.client}
                    onChange={(e) => update("client", e.target.value)}
                  />
                </label>
              </div>

              {err && <div className="rp-error-line">{err}</div>}

              <div className="rp-row rp-row--right" style={{ marginTop: 20 }}>
                <button
                  className="rp-ui-btn rp-ui-btn--soft"
                  onClick={() => router.push("/customers")}
                >
                  Cancel
                </button>

                <button
                  className="rp-ui-btn rp-ui-btn--danger rp-glow"
                  disabled={loading}
                  onClick={submit}
                >
                  {loading ? "Saving…" : "Create Customer"}
                </button>
              </div>
            </div>
          </section>

          <div className="rp-footer">
            RamPotteryHub • <span>Premium SaaS</span>
          </div>
        </main>
      </div>
    </div>
  );
}

