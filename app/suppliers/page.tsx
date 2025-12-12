// app/suppliers/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type Supplier = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
};

export default function SuppliersPage() {
  const [list, setList] = useState<Supplier[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const load = async () => {
    const { data } = await supabase.from("suppliers").select("*").order("name");
    setList(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) {
      alert("Supplier name is required");
      return;
    }
    const { error } = await supabase.from("suppliers").insert({
      name,
      phone,
      email,
      address,
    });
    if (error) {
      alert(error.message);
      return;
    }
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-semibold">Suppliers</h1>
        <Link href="/" className="btn btn-ghost">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="card mb-4">
        <h2 className="font-semibold text-sm mb-2">Add / Edit Supplier</h2>
        <div className="form-row mb-2">
          <div>
            <label className="form-label">Supplier Name *</label>
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Clay raw material supplier"
            />
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
        <div className="form-row mb-2">
          <div>
            <label className="form-label">Email</label>
            <input
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Address</label>
            <input
              className="form-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Add Supplier
        </button>
      </div>

      <div className="card">
        <h2 className="font-semibold text-sm mb-2">Supplier List</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.phone}</td>
                <td>{s.email}</td>
                <td>{s.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

