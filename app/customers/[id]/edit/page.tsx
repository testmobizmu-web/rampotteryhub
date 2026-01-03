"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { rpFetch } from "@/lib/rpFetch";

/* ---------------- helpers ---------------- */
function formatRs(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return `Rs ${v.toFixed(2)}`;
}

/* ---------------- page ---------------- */
export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

 const [showDelete, setShowDelete] = useState(false);
 const [deleting, setDeleting] = useState(false);

 const [activity, setActivity] = useState<{
  invoices_count: number;
  total_invoiced: number;
  total_paid: number;
  outstanding: number;
} | null>(null);



  // ✅ hydration lock
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

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

  async function deleteCustomer() {
  setDeleting(true);
  setErr(null);

  try {
    const res = await rpFetch(`/api/customers/${id}`, {
      method: "DELETE",
    } as any);

    const json: any =
      typeof (res as any)?.json === "function"
        ? await (res as any).json()
        : res;

    if (!json?.ok) {
      throw new Error(json?.error || "Delete failed");
    }

    router.push("/customers");
  } catch (e: any) {
    setErr(e.message || "Delete failed");
  } finally {
    setDeleting(false);
    setShowDelete(false);
  }
}

<button
  className="rp-ui-btn rp-ui-btn--danger-outline rp-glow"
  onClick={() => setShowDelete(true)}
>
  Delete Customer
</button>

{showDelete && (
  <div className="rp-modal-backdrop">
    <div className="rp-modal rp-card-anim">
      <div className="rp-modal-title">Delete Customer</div>
      <div className="rp-modal-text">
        This action <b>cannot be undone</b>.
        <br />
        Customer will be permanently removed.
      </div>

      {err && <div className="rp-error-line">{err}</div>}

      <div className="rp-modal-actions">
        <button
          className="rp-ui-btn rp-ui-btn--soft"
          onClick={() => setShowDelete(false)}
          disabled={deleting}
        >
          Cancel
        </button>

        <button
          className="rp-ui-btn rp-ui-btn--danger rp-glow"
          onClick={deleteCustomer}
          disabled={deleting}
        >
          {deleting ? "Deleting…" : "Yes, Delete"}
        </button>
      </div>
    </div>
  </div>
)}



  /* -------- load customer -------- */
  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setErr(null);

        // ✅ rpFetch returns Response in your project → parse JSON
        const res = await rpFetch(`/api/customers/${id}`, { cache: "no-store" } as any);
        const json: any = typeof (res as any)?.json === "function" ? await (res as any).json() : res;

        if (!alive) return;

        if (!json?.ok) {
          throw new Error(json?.error || "Failed to load customer");
        }

        const c = json.customer || {};
        setForm({
          customer_code: c.customer_code || "",
          name: c.name || "",
          phone: c.phone || "",
          email: c.email || "",
          address: c.address || "",
          opening_balance: String(c.opening_balance ?? "0.00"),
          client: c.client || "",
        });
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load customer");
      }
    }

    if (id) load();

    return () => {
      alive = false;
    };
  }, [id]);

  function update(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

 useEffect(() => {
  let alive = true;

  async function loadActivity() {
    try {
      const res = await rpFetch(`/api/customers/${id}/activity`, {
        cache: "no-store",
      } as any);

      const json: any =
        typeof (res as any)?.json === "function"
          ? await (res as any).json()
          : res;

      if (!alive) return;

      if (json?.ok) {
        setActivity(json.activity);
      }
    } catch {
      /* silent */
    }
  }

  if (id) loadActivity();
  return () => {
    alive = false;
  };
}, [id]);



  /* -------- save -------- */
  async function save() {
    if (!form.name.trim()) {
      setErr("Customer name is required.");
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      const res = await rpFetch(`/api/customers/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          opening_balance: Number(form.opening_balance || 0),
        }),
      } as any);

      const json: any = typeof (res as any)?.json === "function" ? await (res as any).json() : res;

      if (!json?.ok) {
        throw new Error(json?.error || "Update failed");
      }

      router.push("/customers");
    } catch (e: any) {
      setErr(e?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rp-app">
      <div className="rp-bg" />
      <div className="rp-shell">
        <main className="rp-main">
          {/* ===== HEADER ===== */}
          <header className="rp-top rp-card-anim">
            <div>
              <Link className="rp-ui-btn rp-ui-btn--soft rp-glow" href="/customers">
                ← Customers
              </Link>
            </div>

            <div className="rp-top-center--stacked">
              <div className="rp-top-logo rp-top-logo--xl">
                <img src="/images/logo/logo.png" alt="Ram Pottery" width={44} height={44} />
              </div>

              <div className="rp-top-center-text">
                <div className="rp-top-title">Edit Customer</div>
                <div className="rp-top-subtitle">Profile • Activity • Pricing</div>
              </div>

              <div className="rp-breadcrumb">
                <span>Dashboard</span> → <span>Customers</span> → <b>Edit</b>
              </div>
            </div>

            <div />
          </header>


 {activity && (
  <section className="rp-kpi-grid rp-card-anim" style={{ marginBottom: 18 }}>
    <div className="rp-kpi">
      <div className="rp-kpi-label">Invoices</div>
      <div className="rp-kpi-value">{activity.invoices_count}</div>
      <div className="rp-kpi-sub">Total count</div>
    </div>

    <div className="rp-kpi">
      <div className="rp-kpi-label">Total Invoiced</div>
      <div className="rp-kpi-value">
        Rs {activity.total_invoiced.toFixed(2)}
      </div>
      <div className="rp-kpi-sub">Gross</div>
    </div>

    <div className="rp-kpi">
      <div className="rp-kpi-label">Paid</div>
      <div className="rp-kpi-value">
        Rs {activity.total_paid.toFixed(2)}
      </div>
      <div className="rp-kpi-sub">Collected</div>
    </div>

    <div className="rp-kpi rp-kpi--danger">
      <div className="rp-kpi-label">Outstanding</div>
      <div className="rp-kpi-value">
        Rs {activity.outstanding.toFixed(2)}
      </div>
      <div className="rp-kpi-sub">Balance due</div>
    </div>
  </section>
)}


          {/* ===== FORM ===== */}
          <section className="rp-panel rp-card-anim">
            <div className="rp-panel-head">
              <div>
                <div className="rp-panel-title">Customer Details</div>
                <div className="rp-panel-sub">Update party information and balances</div>
              </div>
            </div>

            <div className="rp-panel-body">
              <div className="rp-grid rp-form-grid">
                <label className="rp-field">
                  <span>Customer Code</span>
                  <input value={form.customer_code} onChange={(e) => update("customer_code", e.target.value)} />
                </label>

                <label className="rp-field">
                  <span>Customer Name *</span>
                  <input value={form.name} onChange={(e) => update("name", e.target.value)} />
                </label>

                <label className="rp-field">
                  <span>Phone</span>
                  <input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                </label>

                <label className="rp-field">
                  <span>Email</span>
                  <input value={form.email} onChange={(e) => update("email", e.target.value)} />
                </label>

                <label className="rp-field rp-field--full">
                  <span>Address</span>
                  <textarea rows={3} value={form.address} onChange={(e) => update("address", e.target.value)} />
                </label>

                <label className="rp-field">
                  <span>Opening Balance</span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.opening_balance}
                    onChange={(e) => update("opening_balance", e.target.value)}
                  />
                  <small>{formatRs(Number(form.opening_balance))}</small>
                </label>

                <label className="rp-field">
                  <span>Client / Category</span>
                  <input value={form.client} onChange={(e) => update("client", e.target.value)} />
                </label>
              </div>

              {err && <div className="rp-error-line">{err}</div>}

              <div className="rp-row rp-row--right" style={{ marginTop: 22 }}>
                <button className="rp-ui-btn rp-ui-btn--soft rp-glow" onClick={() => router.push("/customers")}>
                  Cancel
                </button>

                <button className="rp-ui-btn rp-ui-btn--danger rp-glow" disabled={loading} onClick={save}>
                  {loading ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
