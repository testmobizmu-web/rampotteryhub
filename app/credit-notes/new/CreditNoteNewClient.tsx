// app/credit-notes/new/CreditNoteNewClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const VAT_RATE = 0.15;

type Customer = { id: number; name: string; customer_code: string | null };
type Product = {
  id: number;
  sku: string | null;
  name: string | null;
  selling_price: number | null;
};

type CNItem = {
  id: number;
  productId: string;
  sku: string;
  description: string;
  qty: number;
  unitExcl: number;
  unitVat: number;
  unitIncl: number;
  lineTotal: number;
};

function recalc(item: CNItem): CNItem {
  const unitVat = +(item.unitExcl * VAT_RATE).toFixed(2);
  const unitIncl = +(item.unitExcl + unitVat).toFixed(2);
  const lineTotal = +(unitIncl * (item.qty || 0)).toFixed(2);
  return { ...item, unitVat, unitIncl, lineTotal };
}

export default function CreditNoteNewClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [creditNoteDate, setCreditNoteDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [invoiceId, setInvoiceId] = useState(""); // optional link
  const [reason, setReason] = useState("");

  const [items, setItems] = useState<CNItem[]>([
    {
      id: 1,
      productId: "",
      sku: "",
      description: "",
      qty: 0,
      unitExcl: 0,
      unitVat: 0,
      unitIncl: 0,
      lineTotal: 0,
    },
  ]);

  useEffect(() => {
    async function load() {
      const { data: c } = await supabase
        .from("customers")
        .select("id, name, customer_code")
        .order("name");
      setCustomers((c ?? []) as Customer[]);

      const { data: p } = await supabase
        .from("products")
        .select("id, sku, name, selling_price")
        .order("sku");
      setProducts((p ?? []) as Product[]);
    }
    load();
  }, []);

  // ✅ Prefill from invoice page link
  useEffect(() => {
    const cId = searchParams.get("customerId");
    const invId = searchParams.get("invoiceId");

    if (cId && /^\d+$/.test(cId)) setCustomerId(cId);
    if (invId && /^\d+$/.test(invId)) setInvoiceId(invId);
  }, [searchParams]);

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (s, r) => s + (r.qty || 0) * (r.unitExcl || 0),
      0
    );
    const vat = subtotal * VAT_RATE;
    const total = subtotal + vat;
    return {
      subtotal: +subtotal.toFixed(2),
      vat: +vat.toFixed(2),
      total: +total.toFixed(2),
    };
  }, [items]);

  const updateItem = (id: number, patch: Partial<CNItem>) => {
    setItems((prev) =>
      prev.map((r) => (r.id === id ? recalc({ ...r, ...patch }) : r))
    );
  };

  const handleSelectProduct = (id: number, productId: string) => {
    const p = products.find((x) => x.id === Number(productId));
    updateItem(id, {
      productId,
      sku: p?.sku || "",
      description: p?.name || "",
      unitExcl: Number(p?.selling_price || 0),
    });
  };

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        productId: "",
        sku: "",
        description: "",
        qty: 0,
        unitExcl: 0,
        unitVat: 0,
        unitIncl: 0,
        lineTotal: 0,
      },
    ]);
  };

  const removeRow = (id: number) => {
    setItems((prev) => prev.filter((r) => r.id !== id));
  };

  const save = async () => {
    if (!customerId) return alert("Select a customer first.");
    const clean = items.filter((r) => r.productId && r.qty > 0);
    if (!clean.length) return alert("Add at least 1 item with qty > 0");

    const res = await fetch("/api/credit-notes/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: Number(customerId),
        creditNoteDate,
        invoiceId: invoiceId ? Number(invoiceId) : null,
        reason: reason || null,
        subtotal: totals.subtotal,
        vatAmount: totals.vat,
        totalAmount: totals.total,
        items: clean.map((r) => ({
          product_id: Number(r.productId),
          total_qty: r.qty,
          unit_price_excl_vat: r.unitExcl,
          unit_vat: r.unitVat,
          unit_price_incl_vat: r.unitIncl,
          line_total: r.lineTotal,
        })),
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.ok) {
      alert(json.error || "Failed to create credit note");
      return;
    }

    router.push(`/credit-notes/${json.creditNoteId}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-semibold">New Credit Note</h1>
        <button className="btn btn-ghost" onClick={() => router.push("/credit-notes")}>
          ← Back
        </button>
      </div>

      <div className="card mb-4">
        <div className="form-row mb-2">
          <div>
            <label className="form-label">Customer *</label>
            <select
              className="form-input"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customer_code ? `${c.customer_code} — ` : ""}
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Credit Note Date *</label>
            <input
              type="date"
              className="form-input"
              value={creditNoteDate}
              onChange={(e) => setCreditNoteDate(e.target.value)}
            />
          </div>
        </div>

        <div className="form-row mb-2">
          <div>
            <label className="form-label">Related Invoice ID (optional)</label>
            <input
              className="form-input"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              placeholder="e.g. 123"
            />
          </div>

          <div>
            <label className="form-label">Reason (optional)</label>
            <input
              className="form-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Returned goods / Damaged / Price adjustment…"
            />
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <h2 className="font-semibold text-sm mb-2">Items</h2>

        <table className="table">
           <thead>
            <tr>
             <th style={{ width: 240 }}>Product</th>
             <th>Desc</th>
             <th style={{ width: 90 }}>Qty</th>
             <th style={{ width: 130 }}>Unit Excl</th>
             <th style={{ width: 110 }}>VAT</th>
             <th style={{ width: 130 }}>Unit Incl</th>
             <th style={{ width: 140 }}>Line Total</th>
             <th style={{ width: 90 }}></th>
           </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td>
                  <select
                    className="form-input"
                    value={r.productId}
                    onChange={(e) => handleSelectProduct(r.id, e.target.value)}
                  >
                    <option value="">Select</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sku} — {p.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{r.description || "—"}</td>
                <td>
                  <input
                    className="form-input"
                    inputMode="numeric"
                    value={r.qty}
                    onChange={(e) =>
                      updateItem(r.id, { qty: Number(e.target.value) || 0 })
                    }
                  />
                </td>
                <td>
                  <input
                    className="form-input"
                    inputMode="decimal"
                    value={r.unitExcl}
                    onChange={(e) =>
                      updateItem(r.id, { unitExcl: Number(e.target.value) || 0 })
                    }
                  />
                </td>
                <td>{r.unitVat.toFixed(2)}</td>
                <td>{r.unitIncl.toFixed(2)}</td>
                <td>{r.lineTotal.toFixed(2)}</td>
                <td>
                  {items.length > 1 && (
                    <button className="btn btn-ghost" onClick={() => removeRow(r.id)}>
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex gap-2 mt-3">
          <button className="btn btn-ghost" onClick={addRow}>
            + Add Row
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <h2 className="font-semibold text-sm mb-2">Totals</h2>
        <div className="form-row mb-2">
          <div>
            <label className="form-label">Subtotal (Excl VAT)</label>
            <input className="form-input" disabled value={totals.subtotal.toFixed(2)} />
          </div>
          <div>
            <label className="form-label">VAT 15%</label>
            <input className="form-input" disabled value={totals.vat.toFixed(2)} />
          </div>
          <div>
            <label className="form-label">Total (Incl VAT)</label>
            <input className="form-input" disabled value={totals.total.toFixed(2)} />
          </div>
        </div>

        <button className="btn btn-primary" onClick={save}>
          Save Credit Note
        </button>
      </div>
    </div>
  );
}
