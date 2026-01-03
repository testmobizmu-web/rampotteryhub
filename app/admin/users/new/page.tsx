"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewUserPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("sales");
  const [applyPreset, setApplyPreset] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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
      router.push("/admin/users");
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-2xl font-semibold">Create User</h1>

      {err && <div className="p-3 rounded-xl border text-sm">{err}</div>}

      <div className="space-y-3 rounded-2xl border p-4">
        <div className="space-y-1">
          <div className="text-sm opacity-70">Username</div>
          <input className="w-full border rounded-xl px-3 py-2" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

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
          <input type="checkbox" checked={applyPreset} onChange={(e) => setApplyPreset(e.target.checked)} />
          Apply default permissions preset for this role
        </label>

        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 rounded-xl border"
        >
          {saving ? "Saving…" : "Create"}
        </button>
      </div>
    </div>
  );
}
