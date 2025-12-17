// app/customers/[id]/pricing/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Customer = {
  id: number;
  name: string | null;
  customer_code: string | null;
};

type Product = {
  id: number;
  sku: string | null;
  name: string | null;
  selling_price: number | null;
};

type PriceRow = {
  customer_id: number;
  product_id: number;
  unit_price_excl_vat: number;
};

export default function CustomerPricingPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const customerId = Number(params.id);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [priceMap, setPriceMap] = useState<Record<number, string>>({});
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!customerId) return;

    async function loadAll() {
      // Customer
      const { data: c, error: cErr } = await supabase
        .from("customers")
        .select("id, name, customer_code")
        .eq("id", customerId)
        .single();

      if (cErr) {
        alert(cErr.message);
        return;
      }
      setCustomer(c as Customer);

      // Products (default prices)
      const { data: p, error: pErr } = await supabase
        .from("products")
        .select("id, sku, name, selling_price")
        .order("sku");

      if (pErr) {
        alert(pErr.message);
        return;
      }
      setProducts((p ?? []) as Product[]);

      // Existing partywise prices for this customer
      const res = await fetch(`/api/pricing?customerId=${customerId}`, {
        cache: "no-store",
      });
      const json = await res.json();

      if (!json.ok) {
        alert(json.error || "Failed to load customer prices");
        return;
      }

      const map: Record<number, string> = {};
      (json.prices as PriceRow[]).forEach((r) => {
        map[r.product_id] = String(Number(r.unit_price_excl_vat));
      });
      setPriceMap(map);
    }

    loadAll();
  }, [customerId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;

    return products.filter((p) => {
      const sku = (p.sku || "").toLowerCase();
      const name = (p.name || "").toLowerCase();
      return sku.includes(q) || name.includes(q);
    });
  }, [products, search]);

  function setPrice(productId: number, value: string) {
    setPriceMap((prev) => ({ ...prev, [productId]: value }));
  }

  async function saveAll() {
    setSaving(true);
    try {
      const rows = Object.entries(priceMap)
        .map(([productIdStr, priceStr]) => {
          const productId = Number(productIdStr);
          const n = Number(priceStr);

          if (!productId) return null;
          if (priceStr === "" || Number.isNaN(n)) return null;

          return {
            customerId,
            productId,
            unit_price_excl_vat: n,
          };
        })
        .filter(Boolean);

      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rows),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Save failed");
      }

      alert("✅ Prices saved successfully");
    } catch (e: any) {
      alert(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function saveOne(productId: number) {
    const raw = priceMap[productId];
    const n = Number(raw);

    if (raw === "" || Number.isNaN(n)) {
      alert("Enter a valid price first.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          productId,
          unit_price_excl_vat: n,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Save failed");
    } catch (e: any) {
      alert(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-lg font-semibold">Customer Pricing</h1>
          <div className="text-sm opacity-70">
            {customer?.customer_code ? (
              <>
                <strong>{customer.customer_code}</strong> — {customer?.name || ""}
              </>
            ) : (
              customer?.name || ""
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={() => router.push("/customers")}>
            ← Back
          </button>
          <button className="btn btn-primary" disabled={saving} onClick={saveAll}>
            {saving ? "Saving…" : "💾 Save All"}
          </button>
        </div>
      </div>

      <div className="card mb-3">
        <div className="form-row">
          <div>
            <label className="form-label">Search product</label>
            <input
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type SKU or name…"
            />
          </div>
        </div>
        <p className="text-xs opacity-70 mt-2">
          Set <strong>Price Excl VAT</strong> for this customer. If empty, invoice will use default product price.
        </p>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 140 }}>SKU</th>
              <th>Product</th>
              <th style={{ width: 140 }}>Default Price</th>
              <th style={{ width: 180 }}>Customer Price (Excl VAT)</th>
              <th style={{ width: 120 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>{p.sku || "—"}</td>
                <td>{p.name || "—"}</td>
                <td>{Number(p.selling_price || 0).toFixed(2)}</td>
                <td>
                  <input
                    className="form-input"
                    value={priceMap[p.id] ?? ""}
                    onChange={(e) => setPrice(p.id, e.target.value)}
                    placeholder="e.g. 25.00"
                    inputMode="decimal"
                  />
                </td>
                <td>
                  <button
                    className="btn btn-ghost"
                    disabled={saving}
                    onClick={() => saveOne(p.id)}
                    title="Save this row"
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5}>No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
