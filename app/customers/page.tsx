// app/customers/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type Customer = {
  id: number;
  customer_code: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
};

export default function CustomersPage() {
  const [list, setList] = useState<Customer[]>([]);

  const [customerCode, setCustomerCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const load = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("id, customer_code, name, phone, email, address")
      .order("name");

    if (error) {
      alert(error.message);
      return;
    }

    setList((data ?? []) as Customer[]);
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
      customer_code: customerCode.trim() || null,
      name: name.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      address: address.trim() || null,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setCustomerCode("");
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
            <label className="form-label">Customer Code</label>
            <input
              className="form-input"
              value={customerCode}
              onChange={(e) => setCustomerCode(e.target.value)}
              placeholder="CUST-001"
            />
          </div>

          <div>
            <label className="form-label">Customer Name *</label>
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Anytime Anywhere Tour Operator Ltd"
            />
          </div>
        </div>

        <div className="form-row mb-2">
          <div>
            <label className="form-label">Phone</label>
            <input
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+230 5778 8884"
            />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@client.com"
            />
          </div>
        </div>

        <div className="form-row mb-2">
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
              <th>Code</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {list.map((c) => (
              <tr key={c.id}>
                <td>{c.customer_code || "—"}</td>
                <td>{c.name}</td>
                <td>{c.phone || "—"}</td>
                <td>{c.email || "—"}</td>
                <td>{c.address || "—"}</td>
                <td>
                  <Link
                    href={`/customers/${c.id}/pricing`}
                    className="btn btn-ghost"
                  >
                    Pricing →
                  </Link>
                </td>
              </tr>
            ))}

            {list.length === 0 && (
              <tr>
                <td colSpan={6}>No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
