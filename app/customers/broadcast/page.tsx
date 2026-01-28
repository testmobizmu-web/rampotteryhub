"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { rpFetch } from "@/lib/rpFetch";

type Row = {
  customerName: string;
  whatsapp: string;
  balance: number;
  message: string;
  waLink: string;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function moneyRs(n: number) {
  const x = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(x);
}

function csvEscape(s: string) {
  const v = String(s ?? "");
  if (/[,"\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function rowsToCsv(rows: Row[]) {
  const header = ["Customer", "WhatsApp", "Balance", "Message", "waLink"];
  const lines = rows.map((r) =>
    [
      csvEscape(r.customerName),
      csvEscape(r.whatsapp),
      csvEscape(moneyRs(r.balance)),
      csvEscape(r.message),
      csvEscape(r.waLink),
    ].join(",")
  );
  return [header.join(","), ...lines].join("\n");
}

export default function BroadcastPage() {
  const [mode, setMode] = useState<"OVERDUE" | "STATEMENT">("OVERDUE");
  const [from, setFrom] = useState<string>(todayISO());
  const [to, setTo] = useState<string>(todayISO());

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [openIndex, setOpenIndex] = useState<number>(0);

  const copyAllText = useMemo(() => {
    // One big copy block: each customer section separated by lines
    return rows
      .map((r, i) => {
        return [
          `#${i + 1} ${r.customerName} (${r.whatsapp})`,
          `Balance: Rs ${moneyRs(r.balance)}`,
          r.message,
          r.waLink,
          `------------------------------`,
        ].join("\n");
      })
      .join("\n");
  }, [rows]);

  async function load() {
    setLoading(true);
    setErr(null);
    setRows([]);
    setOpenIndex(0);

    try {
      const qs =
        mode === "STATEMENT"
          ? `?type=STATEMENT&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
          : `?type=OVERDUE`;

      const res = await rpFetch(`/api/customers/broadcast${qs}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed to load broadcast list");

      setRows((json.list || []) as Row[]);
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function copyAll() {
    if (!rows.length) return;
    try {
      await navigator.clipboard.writeText(copyAllText);
      alert("Copied ✅");
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = copyAllText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      alert("Copied ✅");
    }
  }

  function openNext() {
    if (!rows.length) return;
    const idx = Math.min(openIndex, rows.length - 1);
    const r = rows[idx];
    window.open(r.waLink, "_blank", "noopener,noreferrer");
    setOpenIndex((v) => Math.min(v + 1, rows.length - 1));
  }

  function exportCsv() {
    if (!rows.length) return;
    const csv = rowsToCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${mode === "OVERDUE" ? "overdue" : "statement"}-whatsapp-links.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="rp-app" style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Link href="/customers" prefetch={false} className="rp-ui-btn rp-ui-btn--brand">
          ← Customers
        </Link>

        <div style={{ fontWeight: 950, fontSize: 20 }}>WhatsApp Broadcast</div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="rp-ui-btn" type="button" onClick={copyAll} disabled={!rows.length}>
            Copy all
          </button>
          <button className="rp-ui-btn rp-ui-btn--brand" type="button" onClick={openNext} disabled={!rows.length}>
            Open next ({rows.length ? Math.min(openIndex + 1, rows.length) : 0}/{rows.length})
          </button>
          <button className="rp-ui-btn rp-ui-btn--danger" type="button" onClick={exportCsv} disabled={!rows.length}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="rp-card" style={{ marginTop: 14, padding: 14, borderRadius: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 900 }}>Type</span>
            <select
              className="rp-input"
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              style={{ minWidth: 220 }}
            >
              <option value="OVERDUE">Overdue</option>
              <option value="STATEMENT">Statement (Date Range)</option>
            </select>
          </label>

          {mode === "STATEMENT" ? (
            <>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 900 }}>From</span>
                <input className="rp-input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 900 }}>To</span>
                <input className="rp-input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </label>
            </>
          ) : null}

          <button className="rp-ui-btn rp-ui-btn--danger rp-glow" type="button" onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Generate List"}
          </button>
        </div>

        {err ? (
          <div style={{ marginTop: 10, padding: 10, borderRadius: 12, border: "1px solid rgba(0,0,0,.15)" }}>
            <b>Error:</b> {err}
          </div>
        ) : null}
      </div>

      {/* List */}
      <div className="rp-card" style={{ marginTop: 14, padding: 14, borderRadius: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div style={{ fontWeight: 950 }}>Results: {rows.length}</div>
          <div style={{ fontWeight: 900, opacity: 0.75 }}>
            Tip: Use <b>Open next</b> to send one-by-one.
          </div>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {rows.map((r, i) => (
            <div
              key={i}
              style={{
                border: "1px solid rgba(0,0,0,.12)",
                borderRadius: 14,
                padding: 12,
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 950 }}>
                  #{i + 1} {r.customerName}
                </div>
                <div style={{ fontWeight: 900 }}>
                  Balance: Rs {moneyRs(r.balance)}
                </div>
              </div>

              <div style={{ opacity: 0.85, fontWeight: 850 }}>
                WhatsApp: {r.whatsapp}
              </div>

              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  background: "rgba(0,0,0,.04)",
                  padding: 10,
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,.08)",
                  fontWeight: 800,
                }}
              >
                {r.message}
              </pre>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <button
                  className="rp-ui-btn"
                  type="button"
                  onClick={() => window.open(r.waLink, "_blank", "noopener,noreferrer")}
                >
                  Open WhatsApp
                </button>
                <button
                  className="rp-ui-btn rp-ui-btn--brand"
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(r.waLink);
                      alert("Link copied ✅");
                    } catch {
                      alert("Copy failed (browser blocked).");
                    }
                  }}
                >
                  Copy Link
                </button>
              </div>
            </div>
          ))}

          {!rows.length && !loading ? (
            <div style={{ opacity: 0.7, fontWeight: 850, padding: 10 }}>
              Generate a list above to see customers.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
