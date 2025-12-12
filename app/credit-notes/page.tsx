"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Row = { id: number; note_number: string; date: string; amount: number; customer_name?: string | null; };

export default function CreditNotesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch("/api/credit-notes/list");
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || "Failed to load credit notes");
        setRows(json.notes ?? json ?? []);
      } catch (e: any) {
        setErr(e.message || "Error loading credit notes");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="rp-page-main">
      <div className="rp-page-header">
        <div className="rp-page-title-block">
          <h1>Credit Notes</h1>
          <p>View and print credit notes.</p>
        </div>
        <div className="rp-page-actions">
          <button className="btn-primary-red" onClick={() => router.push("/credit-notes/new")}>
            + New Credit Note
          </button>
        </div>
      </div>

      <div className="rp-table-card">
        <div className="rp-table-card-header">
          <div className="rp-table-card-title">Credit notes list</div>
        </div>

        {loading && <p style={{ fontSize: 12 }}>Loading…</p>}
        {err && <p style={{ fontSize: 12, color: "#b91c1c" }}>{err}</p>}

        {!loading && !err && (
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Date</th>
                <th>Customer</th>
                <th style={{ textAlign: "right" }}>Amount (Rs)</th>
              </tr>
            </thead>
            <tbody>
              {!rows.length && (
                <tr><td colSpan={4} style={{ fontSize: 12 }}>No credit notes yet.</td></tr>
              )}
              {rows.map(r => (
                <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => router.push(`/credit-notes/${r.id}`)}>
                  <td>{r.note_number}</td>
                  <td>{new Date(r.date).toLocaleDateString("en-GB")}</td>
                  <td>{r.customer_name || "-"}</td>
                  <td style={{ textAlign: "right" }}>{(r.amount || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
