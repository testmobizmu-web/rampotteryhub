"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";

export default function InvoiceReprintPage() {
  const params = useParams<{ id: string }>();
  const id = String(params?.id || "");

  const openUrl = useMemo(() => `/invoices/${encodeURIComponent(id)}/print`, [id]);
  const printUrl = useMemo(() => `/invoices/${encodeURIComponent(id)}/print?autoprint=1`, [id]);

  const [busy, setBusy] = useState(false);

  function onPrint() {
    setBusy(true);

    const w = window.open(printUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => {
      setBusy(false);
      if (!w) alert("Popup blocked. Please allow popups then try Print again.");
    }, 600);
  }

  return (
    <div className="rpprint-wrap">
      <div className="rpprint-top">
        <div>
          <div className="rpprint-h">Invoice Print Center</div>
          <div className="rpprint-p">Preview and print a clean A4 VAT Invoice.</div>
        </div>

        <div className="rpprint-actions">
          <button className="rpbtn rpbtn-ghost" onClick={() => window.history.back()}>
            ← Back
          </button>

          <a className="rpbtn rpbtn-ghost" href={openUrl} target="_blank" rel="noreferrer">
            Open Print View
          </a>

          <button className="rpbtn rpbtn-primary" onClick={onPrint} disabled={busy}>
            {busy ? "Preparing…" : "Print / Reprint"}
          </button>
        </div>
      </div>

      <div className="rpprint-grid">
        <div className="card">
          <div className="cardhead">
            <div className="cardtitle">Preview</div>
            <div className="badge">A4</div>
          </div>

          <div className="frame">
            <iframe className="pv" src={openUrl} title="Invoice Preview" />
          </div>
        </div>

        <div className="side">
          <div className="sidecard">
            <div className="sideh">Print Tips</div>
            <ul className="list">
              <li>Select A4</li>
              <li>Enable Background graphics</li>
              <li>Margins: Default / None</li>
            </ul>
          </div>

          <div className="sidecard">
            <div className="sideh">Invoice</div>
            <div className="kv">
              <div className="k">ID</div>
              <div className="v">{id}</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .rpprint-wrap {
          min-height: 100vh;
          padding: 18px;
          background: #0b0f19;
          color: #e9eefc;
        }

        .rpprint-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 12px;
          z-index: 10;
        }

        .rpprint-h {
          font-size: 18px;
          font-weight: 900;
          letter-spacing: 0.2px;
        }
        .rpprint-p {
          font-size: 12px;
          opacity: 0.8;
          margin-top: 2px;
        }

        .rpprint-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        .rpbtn {
          height: 40px;
          padding: 0 14px;
          border-radius: 12px;
          font-weight: 800;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          color: #e9eefc;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
        }
        .rpbtn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .rpbtn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .rpbtn-primary {
          background: linear-gradient(135deg, #e11d48, #ef4444);
          border-color: rgba(255, 255, 255, 0.18);
          box-shadow: 0 10px 24px rgba(225, 29, 72, 0.25);
        }

        .rpprint-grid {
          margin-top: 14px;
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 14px;
        }
        @media (max-width: 1100px) {
          .rpprint-grid {
            grid-template-columns: 1fr;
          }
        }

        .card,
        .sidecard {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          overflow: hidden;
        }

        .cardhead {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .cardtitle {
          font-weight: 900;
        }
        .badge {
          font-size: 12px;
          font-weight: 900;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .frame {
          padding: 12px;
          background: rgba(0, 0, 0, 0.2);
        }
        .pv {
          width: 100%;
          height: calc(100vh - 220px);
          border: 0;
          border-radius: 12px;
          background: #fff;
        }

        .side {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .sidecard {
          padding: 14px;
        }
        .sideh {
          font-weight: 900;
          margin-bottom: 8px;
        }
        .list {
          margin: 0;
          padding-left: 18px;
          opacity: 0.9;
          font-size: 13px;
          line-height: 1.5;
        }

        .kv {
          display: grid;
          grid-template-columns: 80px 1fr;
          gap: 8px;
          font-size: 13px;
        }
        .k {
          opacity: 0.75;
        }
        .v {
          font-weight: 900;
        }
      `}</style>
    </div>
  );
}
