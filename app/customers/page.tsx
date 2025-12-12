// app/customers/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type Customer = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
};

export default function CustomersPage() {
  const [list, setList] = useState<Customer[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const load = async () => {
    const { data } = await supabase.from("customers").select("*").order("name");
    setList(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) {
      alert("Customer name is required");
      return;
    }
    const { error } = await supabase.from("customers").insert({
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
        <h1 className="text-lg font-semibold">Customers</h1>
        <Link href="/" className="btn btn-ghost">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="card mb-4">
        <h2 className="font-semibold text-sm mb-2">Add / Edit Customer</h2>
        <div className="form-row mb-2">
          <div>
            <label className="form-label">Customer Name *</label>
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Anytime Anywhere Tour Operator Ltd"
            />
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="5778 8884"
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
              placeholder="info@client.com"
            />
          </div>
          <div>
            <label className="form-label">Address</label>
            <input
              className="form-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Grand Baie"
            />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Add Customer
        </button>
      </div>

      <div className="card">
        <h2 className="font-semibold text-sm mb-2">Customer List</h2>
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
            {list.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.email}</td>
                <td>{c.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
