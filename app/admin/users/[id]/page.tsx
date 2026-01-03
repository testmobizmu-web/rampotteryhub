"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const PERMS = [
  { key: "canViewReports", label: "Can view reports" },
  { key: "canEditInvoices", label: "Can create/edit invoices" },
  { key: "canEditPayments", label: "Can record payments" },
  { key: "canVoidInvoices", label: "Can void invoices/credit notes" },
  { key: "canEditStock", label: "Can edit stock" },
  { key: "canManageUsers", label: "Can manage users" },
] as const;

type PermKey = (typeof PERMS)[number]["key"];

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("sales");
  const [active, setActive] = useState(true);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch(`/api/admin/users/${id}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed");
      const u = json.user;
      setUsername(u.username || "");
      setFullName(u.full_name || "");
      setPhone(u.phone || "");
      setRole(u.role || "sales");
      setActive(Boolean(u.is_active));
      setPermissions(u.permissions || {});
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  function toggle(k: string) {
    setPermissions((p) => ({ ...p, [k]: !p[k] }));
  }

  const dirty = useMemo(() => true, [username, fullName, phone, role, active, permissions]);

  async function save(applyPreset: boolean) {
    try {
      setSaving(true);
      setErr(null);

      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          phone,
          role,
          is_active: active,
          permissions,
          applyPreset,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed");

      router.push("/admin/users");
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-sm opacity-70">Loading…</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Edit User</h1>
          <p className="text-sm opacity-70">{username}</p>
        </div>
        <button className="px-4 py-2 rounded-xl border" onClick={() => router.push("/admin/users")}>
          Back
        </button>
      </div>

      {err && <div className="p-3 rounded-xl border text-sm">{err}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-4 space-y-3">
          <div className="space-y-1">
            <div className="text-sm opacity-70">Full name</div>
            <input className="w-full border rounded-xl px-3 py-2" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div className="space-y-1">
            <div className="text-sm opacity-70">Phone</div>
            <input className="w-full border rounded-xl px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="space-y-1">
            <div className="text-sm opacity-70">Role</div>
            <select className="w-full border rounded-xl px-3 py-2" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="admin">admin</option>
              <option value="accounting">accounting</option>
              <option value="sales">sales</option>
              <option value="viewer">viewer</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Active
          </label>

          <div className="flex gap-2 flex-wrap">
            <button disabled={saving || !dirty} className="px-4 py-2 rounded-xl border" onClick={() => save(false)}>
              {saving ? "Saving…" : "Save"}
            </button>

            <button disabled={saving} className="px-4 py-2 rounded-xl border" onClick={() => save(true)}>
              Apply Preset + Save
            </button>
          </div>
        </div>

        <div className="rounded-2xl border p-4 space-y-3">
          <div className="text-sm font-medium">Permissions</div>
          <div className="space-y-2">
            {PERMS.map((p) => (
              <label key={p.key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(permissions[p.key])}
                  onChange={() => toggle(p.key)}
                />
                {p.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
