"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type InvoiceRow = {
  id: number;
  invoice_number: string | null;
  invoice_date: string | null;
  status: string | null;
  total_amount: number | null;
  balance_remaining: number | null;
  amount_paid: number | null;
  customers: { name: string | null; customer_code: string | null }[]; // ✅ normalized array
};

function formatDateGb(d: string | null) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-GB");
  } catch {
    return "—";
  }
}

function statusBadgeClass(status: string | null) {
  const s = String(status || "").toUpperCase();
  if (s === "PAID") return "rp-badge rp-badge-paid";
  if (s === "UNPAID") return "rp-badge rp-badge-unpaid";
  if (s === "PARTIAL") return "rp-badge rp-badge-partial";
  return "rp-badge rp-badge-neutral";
}

export default function InvoicesPage() {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);

    // ✅ IMPORTANT: gross_total REMOVED (column doesn't exist)
    const { data, error } = await supabase
      .from("invoices")
      .select(
        `
        id,
        invoice_number,
        invoice_date,
        status,
        total_amount,
        balance_remaining,
        amount_paid,
        customers ( name, customer_code )
      `
      )
      .order("invoice_date", { ascending: false })
      .order("id", { ascending: false });

    if (error) {
      alert(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    const normalized: InvoiceRow[] =
      (data ?? []).map((r: any) => ({
        id: Number(r.id),
        invoice_number: r.invoice_number ?? null,
        invoice_date: r.invoice_date ?? null,
        status: r.status ?? null,
        total_amount: r.total_amount ?? null,
        balance_remaining: r.balance_remaining ?? null,
        amount_paid: r.amount_paid ?? null,
        customers: Array.isArray(r.customers)
          ? r.customers
          : r.customers
          ? [r.customers]
          : [],
      })) || [];

    setRows(normalized);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;

    return rows.filter((r) => {
      const c = r.customers?.[0];
      const customerName = (c?.name || "").toLowerCase();
      const customerCode = (c?.customer_code || "").toLowerCase();
      const invNo = (r.invoice_number || "").toLowerCase();
      const st = (r.status || "").toLowerCase();

      return (
        customerName.includes(s) ||
        customerCode.includes(s) ||
        invNo.includes(s) ||
        st.includes(s)
      );
    });
  }, [rows, q]);

  return (
    <div>
      {/* Badge styles (same as credit notes) */}
      <style jsx global>{`
        .rp-badge {
          display: inline-flex;
          align-items: center;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.02em;
          border: 1px solid transparent;
          white-space: nowrap;
        }
        .rp-badge-paid {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border-color: rgba(16, 185, 129, 0.25);
        }
        .rp-badge-unpaid {
          background: rgba(239, 68, 68, 0.15);
          color: #fb7185;
          border-color: rgba(239, 68, 68, 0.25);
        }
        .rp-badge-partial {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          border-color: rgba(245, 158, 11, 0.25);
        }
        .rp-badge-neutral {
          background: rgba(148, 163, 184, 0.15);
          color: rgba(15, 23, 42, 0.75);
          border-color: rgba(148, 163, 184, 0.25);
        }
      `}</style>

      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-lg font-semibold">Invoices</h1>
          <div className="text-xs opacity-70">Reprint / view invoices • premium listing</div>
        </div>

        <div className="flex gap-2">
          <Link href="/invoices/new" className="btn btn-primary">
            + New Invoice
          </Link>
        </div>
      </div>

      <div className="card mb-4">
        <div className="form-row">
          <div>
            <label className="form-label">Search</label>
            <input
              className="form-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search invoice no, customer, code, status…"
            />
          </div>

          <div className="flex items-end gap-2">
            <button className="btn btn-ghost" onClick={load} disabled={loading}>
              {loading ? "Loading…" : "Refresh"}
            </button>
            <Link href="/" className="btn btn-ghost">
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-sm mb-2">List</h2>

        <table className="table">
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total (Rs)</th>
              <th>Paid (Rs)</th>
              <th>Balance (Rs)</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r) => {
              const c = r.customers?.[0];
              const customerLabel = c
                ? `${c.customer_code ? c.customer_code + " — " : ""}${c.name || ""}`
                : "—";

              const total = Number(r.total_amount ?? 0);
              const paid = Number(r.amount_paid ?? 0);
              const bal =
                r.balance_remaining != null
                  ? Number(r.balance_remaining)
                  : Math.max(0, total - paid);

              return (
                <tr key={r.id}>
                  <td>{r.invoice_number || `#${r.id}`}</td>
                  <td>{formatDateGb(r.invoice_date)}</td>
                  <td>{customerLabel}</td>
                  <td>{total.toFixed(2)}</td>
                  <td>{paid.toFixed(2)}</td>
                  <td>{bal.toFixed(2)}</td>
                  <td>
                    <span className={statusBadgeClass(r.status)}>
                      {String(r.status || "—").toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <Link href={`/invoices/${r.id}`} className="btn btn-ghost">
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8}>No invoices found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
