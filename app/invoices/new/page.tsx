// app/invoices/new/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const VAT_RATE = 0.15;

type Customer = { id: number; name: string };
type Product = {
  id: number;
  sku: string | null;
  name: string | null;
  units_per_box: number | null;
};

type InvoiceItem = {
  id: number;
  productId: string;
  itemCode: string;
  uom: "BOX" | "PCS";
  box: number;
  unitPerBox: number;
  pcsQty: number;
  totalQty: number;
  description: string;
  unitPriceExcl: number;
  unitVat: number;
  unitPriceIncl: number;
  lineTotalIncl: number;
};

export default function NewInvoicePage() {
  const router = useRouter();

  const [customerId, setCustomerId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [purchaseOrderNo, setPurchaseOrderNo] = useState("");
  const [salesRep, setSalesRep] = useState("Mr Koushal");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 1,
      productId: "",
      itemCode: "",
      uom: "BOX",
      box: 0,
      unitPerBox: 0,
      pcsQty: 0,
      totalQty: 0,
      description: "",
      unitPriceExcl: 0,
      unitVat: 0,
      unitPriceIncl: 0,
      lineTotalIncl: 0,
    },
  ]);

  useEffect(() => {
    async function load() {
      const { data: c } = await supabase
        .from("customers")
        .select("id, name")
        .order("name");
      setCustomers(c ?? []);

      const { data: p } = await supabase
        .from("products")
        .select("id, sku, name, units_per_box")
        .order("sku");
      setProducts(p ?? []);
    }
    load();
  }, []);

  async function fetchPartywisePrice(productId: number) {
    if (!customerId) return 0;
    const res = await fetch(
      `/api/pricing?customerId=${customerId}&productId=${productId}`
    );
    const json = await res.json();
    return json.ok ? Number(json.priceExclVat) : 0;
  }

  const recalcRow = (row: InvoiceItem): InvoiceItem => {
    const totalQty =
      row.uom === "BOX"
        ? row.box * row.unitPerBox
        : row.pcsQty || 0;

    const unitVat = +(row.unitPriceExcl * VAT_RATE).toFixed(2);
    const unitIncl = +(row.unitPriceExcl + unitVat).toFixed(2);

    return {
      ...row,
      totalQty,
      unitVat,
      unitPriceIncl: unitIncl,
      lineTotalIncl: +(unitIncl * totalQty).toFixed(2),
    };
  };

  // ✅ FIXED (no async setState)
  const handleItemChange = async (
    id: number,
    field: keyof InvoiceItem,
    value: string
  ) => {
    const prev = items;

    const updated = await Promise.all(
      prev.map(async (row) => {
        if (row.id !== id) return row;

        let next: InvoiceItem = {
          ...row,
          [field]:
            field === "productId" || field === "uom"
              ? (value as any)
              : Number(value) || 0,
        } as InvoiceItem;

        if (field === "productId") {
          const p = products.find((x) => x.id === Number(value));
          const price = await fetchPartywisePrice(Number(value));

          next = {
            ...next,
            productId: value,
            itemCode: p?.sku || "",
            description: p?.name || "",
            unitPerBox: p?.units_per_box || 1,
            unitPriceExcl: price,
          };
        }

        return recalcRow(next);
      })
    );

    setItems(updated);
  };

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        productId: "",
        itemCode: "",
        uom: "BOX",
        box: 0,
        unitPerBox: 0,
        pcsQty: 0,
        totalQty: 0,
        description: "",
        unitPriceExcl: 0,
        unitVat: 0,
        unitPriceIncl: 0,
        lineTotalIncl: 0,
      },
    ]);
  };

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (s, r) => s + r.totalQty * r.unitPriceExcl,
      0
    );
    const vat = subtotal * VAT_RATE;
    return { subtotal, vat, total: subtotal + vat };
  }, [items]);

  const handleSave = async () => {
    const clean = items.filter((r) => r.productId && r.totalQty > 0);

    const res = await fetch("/api/invoices/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        invoiceDate,
        purchaseOrderNo,
        salesRep,
        vatPercent: 15,
        subtotal: totals.subtotal,
        vatAmount: totals.vat,
        totalAmount: totals.total,
        discountPercent: 0,
        discountAmount: 0,
        items: clean.map((r) => ({
          product_id: Number(r.productId),
          uom: r.uom,
          box_qty: r.box,
          units_per_box: r.unitPerBox,
          pcs_qty: r.uom === "PCS" ? r.pcsQty : null,
          total_qty: r.totalQty,
          unit_price_excl_vat: r.unitPriceExcl,
          unit_vat: r.unitVat,
          unit_price_incl_vat: r.unitPriceIncl,
          line_total: r.lineTotalIncl,
        })),
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.ok) {
      alert(json.error || "Failed");
      return;
    }

    router.push(`/invoices/${json.invoiceId}`);
  };

  return (
    <div>
      <h1>New Invoice</h1>

      <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
        <option value="">Select Customer</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Unit</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id}>
              <td>
                <select
                  value={r.productId}
                  onChange={(e) =>
                    handleItemChange(r.id, "productId", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} — {p.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>{r.uom}</td>
              <td>{r.totalQty}</td>
              <td>{r.unitPriceExcl.toFixed(2)}</td>
              <td>{r.lineTotalIncl.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={addRow}>+ Add Row</button>
      <button onClick={handleSave}>Save Invoice</button>
    </div>
  );
}


