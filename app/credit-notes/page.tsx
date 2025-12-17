"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type CreditNoteRow = {
  id: number;
  credit_note_number: string | null;
  credit_note_date: string | null;
  status: string | null;
  total_amount: number | null;
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

function csvEscape(value: any) {
  const s = String(value ?? "");
  const needs = /[",\n\r]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needs ? `"${escaped}"` : escaped;
}

function downloadCsv(filename: string, rows: Record<string, any>[]) {
  const headers = Object.keys(rows[0] || {});
  const lines = [
    headers.map(csvEscape).join(","),
    ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

export default function CreditNotesPage() {
  const [rows, setRows] = useState<CreditNoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from("credit_notes")
      .select(
        `
        id,
        credit_note_number,
        credit_note_date,
        status,
        total_amount,
        customers ( name, customer_code )
      `
      )
      .order("credit_note_date", { ascending: false })
      .order("id", { ascending: false });

    if (error) {
      alert(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    const normalized: CreditNoteRow[] =
      (data ?? []).map((r: any) => ({
        id: Number(r.id),
        credit_note_number: r.credit_note_number ?? null,
        credit_note_date: r.credit_note_date ?? null,
        status: r.status ?? null,
        total_amount: r.total_amount ?? null,
        customers: Array.isArray(r.customers)
          ? r.customers
          : r.customers
          ? [r.customers]
          : [],
      })) || [];

    setRows(normalized);
    setLoading(false);
  }

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
      const cnNo = (r.credit_note_number || "").toLowerCase();
      const st = (r.status || "").toLowerCase();

      return (
        customerName.includes(s) ||
        customerCode.includes(s) ||
        cnNo.includes(s) ||
        st.includes(s)
      );
    });
  }, [rows, q]);

  const handleExportCsv = () => {
    const exportRows = filtered.map((r) => {
      const c = r.customers?.[0];
      return {
        credit_note_number: r.credit_note_number || `#${r.id}`,
        credit_note_date: r.credit_note_date || "",
        customer_code: c?.customer_code || "",
        customer_name: c?.name || "",
        status: String(r.status || "").toUpperCase(),
        total_amount: Number(r.total_amount || 0).toFixed(2),
      };
    });

    if (!exportRows.length) {
      alert("No rows to export.");
      return;
    }

    const file = `credit-notes-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCsv(file, exportRows);
  };

  return (
    <div>
      {/* Badge styles */}
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
          <h1 className="text-lg font-semibold">Credit Notes</h1>
          <div className="text-xs opacity-70">Premium listing • same style as invoices</div>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={handleExportCsv} disabled={loading}>
            Export CSV
          </button>
          <Link href="/credit-notes/new" className="btn btn-primary">
            + New Credit Note
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
              placeholder="Search by customer, code, credit note no, status…"
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
              <th>Credit Note No</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total (Rs)</th>
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

              return (
                <tr key={r.id}>
                  <td>{r.credit_note_number || `#${r.id}`}</td>
                  <td>{formatDateGb(r.credit_note_date)}</td>
                  <td>{customerLabel}</td>
                  <td>{Number(r.total_amount || 0).toFixed(2)}</td>
                  <td>
                    <span className={statusBadgeClass(r.status)}>
                      {String(r.status || "—").toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <Link href={`/credit-notes/${r.id}`} className="btn btn-ghost">
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6}>No credit notes found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
