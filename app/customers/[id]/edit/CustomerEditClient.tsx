"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { rpFetch } from "@/lib/rpFetch";

type Customer = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  customer_code: string | null;
  client: string | null;
  opening_balance: number | null;
};

export default function CustomerEditClient() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [c, setC] = useState<Customer | null>(null);

  // ✅ Any localStorage must be inside useEffect (Netlify SSR-safe)
  const [role, setRole] = useState<string>("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem("rp_user");
      if (raw) setRole(String(JSON.parse(raw)?.role || ""));
    } catch {}
  }, []);

  const isAdmin = useMemo(() => String(role || "").toLowerCase() === "admin", [role]);

  function showToast(m: string) {
    setToast(m);
    window.setTimeout(() => setToast(null), 2200);
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr(null);

        // ✅ IMPORTANT: make sure your API route is /api/customers/get/[id]
        const res = await rpFetch(`/api/customers/get/${id}`, { cache: "no-store" });
        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load customer");

        if (!alive) return;
        setC(json.customer);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Error");
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (id) load();
    return () => {
      alive = false;
    };
  }, [id]);

  async function save() {
    if (!c) return;
    try {
      setSaving(true);
      setErr(null);

      const res = await rpFetch("/api/customers/update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...c }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to save");

      showToast("Saved ✅");
      router.replace("/customers");
    } catch (e: any) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rp-shell">
        <div className="rp-topbar">
          <div className="rp-topbar__title">Edit Customer</div>
        </div>
        <div className="rp-card" style={{ marginTop: 14 }}>
          <div className="rp-muted">Loading customer…</div>
        </div>
      </div>
    );
  }

  if (err) return <div className="rp-print-error">{err}</div>;
  if (!c) return <div className="rp-print-error">Customer not found</div>;

  return (
    <div className="rp-shell">
      {toast && <div className="rp-toast">{toast}</div>}

      <div className="rp-topbar">
        <div>
          <div className="rp-topbar__title">Edit Customer</div>
          <div className="rp-topbar__sub">Update details • Premium UX</div>
        </div>
        <div className="rp-topbar__actions">
          <button className="rp-ui-btn" onClick={() => router.back()} type="button">
            Back
          </button>
          <button
            className="rp-ui-btn rp-ui-btn--brand"
            onClick={save}
            disabled={saving || !isAdmin}
            type="button"
            title={!isAdmin ? "Admin only" : ""}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="rp-card" style={{ marginTop: 12 }}>
        <div className="rp-card-body">
          <div className="rp-grid-2">
            <label className="rp-field">
              <div className="rp-label">Customer Name</div>
              <input
                className="rp-input"
                value={c.name || ""}
                onChange={(e) => setC({ ...c, name: e.target.value })}
              />
            </label>

            <label className="rp-field">
              <div className="rp-label">Phone</div>
              <input
                className="rp-input"
                value={c.phone || ""}
                onChange={(e) => setC({ ...c, phone: e.target.value })}
              />
            </label>

            <label className="rp-field">
              <div className="rp-label">Email</div>
              <input
                className="rp-input"
                value={c.email || ""}
                onChange={(e) => setC({ ...c, email: e.target.value })}
              />
            </label>

            <label className="rp-field">
              <div className="rp-label">Customer Code</div>
              <input
                className="rp-input"
                value={c.customer_code || ""}
                onChange={(e) => setC({ ...c, customer_code: e.target.value })}
              />
            </label>

            <label className="rp-field rp-col-span-2">
              <div className="rp-label">Address</div>
              <input
                className="rp-input"
                value={c.address || ""}
                onChange={(e) => setC({ ...c, address: e.target.value })}
              />
            </label>
          </div>

          {!isAdmin && (
            <div className="rp-note rp-note--warn" style={{ marginTop: 12 }}>
              Admin-only: you can view this page, but cannot save changes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
