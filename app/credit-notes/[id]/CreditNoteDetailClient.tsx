"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import RamPotteryDoc from "@/components/print/RamPotteryDoc";
import { rpFetch } from "@/lib/rpFetch";

function n2(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

type ApiResponse = {
  ok: boolean;
  error?: string;
  credit_note?: any;
  items?: any[];
};

function formatDDMMYYYY(v: any) {
  const s = String(v || "").trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  try {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yy = d.getFullYear();
      return `${dd}/${mm}/${yy}`;
    }
  } catch {}
  return s;
}

async function waitForImages() {
  const imgs = Array.from(document.images || []);
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) return resolve();
          img.onload = () => resolve();
          img.onerror = () => resolve();
        })
    )
  );
}

export default function CreditNoteDetailClient() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);

  // hydrate-safe role
  const [rpUser, setRpUser] = useState<any>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("rp_user") || "";
      if (!raw) return;
      setRpUser(JSON.parse(raw));
    } catch {
      setRpUser(null);
    }
  }, []);

  const isAdmin = String(rpUser?.role || "").toLowerCase() === "admin";

  // ---- derived ----
  const cn = data?.credit_note || null;
  const items = useMemo(() => (Array.isArray(data?.items) ? (data!.items as any[]) : []), [data]);
  const customer = cn?.customers || null;

  const docDate = useMemo(() => formatDDMMYYYY(cn?.credit_note_date), [cn?.credit_note_date]);

  const companyBrn = useMemo(() => {
    const v = (process.env.NEXT_PUBLIC_COMPANY_BRN || "").trim();
    return v || "C17144377";
  }, []);

  const companyVat = useMemo(() => {
    const v = (process.env.NEXT_PUBLIC_COMPANY_VAT || "").trim();
    return v || "123456789";
  }, []);

  const totals = useMemo(() => {
    const subtotal = n2(cn?.subtotal);
    const vatAmount = n2(cn?.vat_amount);
    const total = n2(cn?.total_amount);
    return { subtotal, vatAmount, total };
  }, [cn?.subtotal, cn?.vat_amount, cn?.total_amount]);

  // ✅ mapped items for RamPotteryDoc
  const itemsMapped = useMemo(() => {
    return items.map((r, idx) => {
      const total_qty = n2(r.total_qty);
      const unit_price_excl_vat = n2(r.unit_price_excl_vat);
      const unit_vat = n2(r.unit_vat);

      const unit_price_incl_vat = n2(r.unit_price_incl_vat ?? unit_price_excl_vat + unit_vat);
      const line_total = n2(r.line_total ?? unit_price_incl_vat * total_qty);

      return {
        sn: idx + 1,
        item_code: r.products?.item_code || r.products?.sku || "",
        uom: "PCS",
        box_qty: total_qty,
        units_per_box: 1,
        total_qty,
        description: r.description || r.products?.name || "",
        unit_price_excl_vat,
        unit_vat,
        unit_price_incl_vat,
        line_total,
      };
    });
  }, [items]);

  // ✅ totals object for RamPotteryDoc
  const totalsObject = useMemo(() => {
    return {
      subtotal: totals.subtotal,
      vatPercentLabel: "VAT",
      vat_amount: totals.vatAmount,
      total_amount: totals.total,

      previous_balance: 0,
      amount_paid: 0,
      balance_remaining: 0,
    };
  }, [totals.subtotal, totals.vatAmount, totals.total]);

  async function loadCreditNote(): Promise<ApiResponse | null> {
    const id = params?.id;
    if (!id) return null;

    try {
      setLoading(true);
      setActionError(null);

      const res = await rpFetch(`/api/credit-notes/get/${id}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed to load credit note");

      setData(json);
      return json;
    } catch (err: any) {
      setActionError(err?.message || "Error loading credit note");
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCreditNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  useEffect(() => {
    const onAfterPrint = () => setPrinting(false);
    window.addEventListener("afterprint", onAfterPrint);
    return () => window.removeEventListener("afterprint", onAfterPrint);
  }, []);

  async function handlePrint() {
    try {
      setPrinting(true);
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      await waitForImages();
      setTimeout(() => window.print(), 80);
    } catch {
      try {
        window.print();
      } finally {
        setTimeout(() => setPrinting(false), 600);
      }
    }
  }

  // ---- UI states ----
  if (loading) {
    return <div style={{ padding: 24, textAlign: "center", fontWeight: 900 }}>Loading credit note…</div>;
  }

  if (!cn) {
    return (
      <div style={{ padding: 24, color: "#b91c1c", fontWeight: 900 }}>
        {actionError || "Credit note not found"}
      </div>
    );
  }

  return (
    <div className={`rp-cn-shell ${printing ? "is-printing" : ""}`}>
      {/* Print overlay */}
      {printing ? (
        <div
          className="print-hidden"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.40)",
            display: "grid",
            placeItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,.96)",
              padding: 18,
              borderRadius: 16,
              width: 360,
              border: "1px solid rgba(0,0,0,.10)",
              boxShadow: "0 20px 55px rgba(0,0,0,0.30)",
              textAlign: "center",
              fontWeight: 950,
              backdropFilter: "blur(10px)",
            }}
          >
            Preparing print…
            <div style={{ marginTop: 8, fontSize: 12, fontWeight: 750, opacity: 0.75 }}>
              If the dialog doesn’t appear, press Ctrl+P.
            </div>
          </div>
        </div>
      ) : null}

      {/* Premium top bar */}
      <header className="rp-cn-topbar print-hidden">
        <button className="rp-cn-brand" onClick={() => router.push("/credit-notes")} type="button">
          <span className="rp-cn-logo">
            <Image src="/images/logo/logo.png" alt="Ram Pottery Logo" width={34} height={34} />
          </span>
          <span className="rp-cn-brand-text">
            <span className="t1">Ram Pottery Ltd</span>
            <span className="t2">Credit Note • View / Print</span>
          </span>
        </button>

        <div className="rp-cn-actions">
          <button className="rp-cn-btn" onClick={() => router.push("/credit-notes")} type="button">
            ← Back
          </button>

          <button className="rp-cn-btn rp-cn-btn--primary" onClick={handlePrint} type="button">
            🖨 View / Print
          </button>
        </div>
      </header>

      <div className="rp-cn-body">
        {/* Left info panel */}
        <aside className="rp-cn-panel print-hidden">
          <div className="rp-cn-card">
            <div className="rp-cn-card-title">Credit Note</div>

            <div className="rp-kv">
              <div className="k">Credit Note No</div>
              <div className="v">{cn.credit_note_number || `CN-${cn.id}`}</div>
            </div>
            <div className="rp-kv">
              <div className="k">Date</div>
              <div className="v">{docDate}</div>
            </div>
            <div className="rp-kv">
              <div className="k">Status</div>
              <div className="v">
                <span className="rp-pill">{String(cn.status || "").toUpperCase() || "ISSUED"}</span>
              </div>
            </div>

            <div className="rp-sep" />

            <div className="rp-cn-card-title">Customer</div>
            <div className="rp-kv">
              <div className="k">Name</div>
              <div className="v">{customer?.name || "-"}</div>
            </div>
            <div className="rp-kv">
              <div className="k">Phone</div>
              <div className="v">{customer?.phone || "-"}</div>
            </div>
            <div className="rp-kv">
              <div className="k">Code</div>
              <div className="v">{customer?.customer_code || "-"}</div>
            </div>

            <div className="rp-sep" />

            <div className="rp-cn-card-title">Company</div>
            <div className="rp-kv">
              <div className="k">BRN</div>
              <div className="v">{companyBrn || "-"}</div>
            </div>
            <div className="rp-kv">
              <div className="k">VAT</div>
              <div className="v">{companyVat || "-"}</div>
            </div>

            <div className="rp-sep" />

            <div className="rp-cn-card-title">Totals</div>
            <div className="rp-kv">
              <div className="k">Subtotal</div>
              <div className="v">{totals.subtotal.toFixed(2)}</div>
            </div>
            <div className="rp-kv">
              <div className="k">VAT</div>
              <div className="v">{totals.vatAmount.toFixed(2)}</div>
            </div>
            <div className="rp-kv">
              <div className="k">Total</div>
              <div className="v">{totals.total.toFixed(2)}</div>
            </div>

            {!isAdmin ? <div className="rp-hint">(Admin-only actions hidden)</div> : null}
          </div>
        </aside>

        {/* Document preview */}
        <main className="rp-cn-preview">
          <div className="rp-cn-paperwrap">
            <RamPotteryDoc
              variant="CREDIT_NOTE"
              docNoLabel="CREDIT NOTE NO:"
              docNoValue={cn.credit_note_number || `CN-${cn.id}`}
              dateLabel="DATE:"
              dateValue={docDate}
              purchaseOrderLabel="REFERENCE:"
              purchaseOrderValue={cn.invoice_id ? String(cn.invoice_id) : cn.reason || ""}
              salesRepName=""
              salesRepPhone=""
              customer={{
                customer_code: customer?.customer_code ?? "",
                name: customer?.name ?? "",
                address: customer?.address ?? "",
                phone: customer?.phone ?? "",
                brn: "",
                vat_no: "",
              }}
              company={{
                brn: companyBrn,
                vat_no: companyVat,
              }}
              items={itemsMapped}
              totals={totalsObject}
              preparedBy={undefined}
              deliveredBy={undefined}
            />
          </div>
        </main>
      </div>

      <style jsx global>{`
        .rp-cn-shell {
          min-height: 100vh;
          background: radial-gradient(1200px 600px at 10% 10%, rgba(227, 6, 19, 0.16), transparent 60%),
            radial-gradient(900px 520px at 90% 0%, rgba(255, 255, 255, 0.09), transparent 55%), #0b1220;
          color: #e5e7eb;
        }

        .rp-cn-topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          background: rgba(10, 15, 28, 0.78);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .rp-cn-brand {
          display: flex;
          gap: 10px;
          align-items: center;
          cursor: pointer;
          user-select: none;
          border: none;
          background: transparent;
          color: inherit;
          padding: 0;
        }

        .rp-cn-brand-text {
          display: grid;
          line-height: 1.1;
        }
        .rp-cn-brand-text .t1 {
          font-weight: 950;
          letter-spacing: 0.2px;
        }
        .rp-cn-brand-text .t2 {
          font-size: 12px;
          opacity: 0.78;
          margin-top: 2px;
        }

        .rp-cn-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .rp-cn-btn {
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
          padding: 10px 12px;
          border-radius: 14px;
          font-weight: 900;
          cursor: pointer;
          transition: transform 0.12s ease, background 0.12s ease;
        }
        .rp-cn-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-1px);
        }

        .rp-cn-btn--primary {
          border-color: rgba(239, 68, 68, 0.55);
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.28), rgba(239, 68, 68, 0.12));
        }
        .rp-cn-btn--primary:hover {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.36), rgba(239, 68, 68, 0.16));
        }

        .rp-cn-body {
          display: grid;
          grid-template-columns: 330px 1fr;
          gap: 16px;
          padding: 16px;
        }
        @media (max-width: 980px) {
          .rp-cn-body {
            grid-template-columns: 1fr;
          }
        }

        .rp-cn-panel .rp-cn-card {
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          border-radius: 18px;
          padding: 14px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
        }

        .rp-cn-card-title {
          font-weight: 950;
          letter-spacing: 0.2px;
          margin-bottom: 10px;
        }

        .rp-kv {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 0;
        }
        .rp-kv .k {
          font-size: 12px;
          opacity: 0.72;
        }
        .rp-kv .v {
          font-weight: 900;
          text-align: right;
        }

        .rp-pill {
          display: inline-flex;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(239, 68, 68, 0.16);
          border: 1px solid rgba(239, 68, 68, 0.38);
          font-weight: 950;
          letter-spacing: 0.03em;
        }

        .rp-sep {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 10px 0;
        }
        .rp-hint {
          margin-top: 10px;
          font-size: 12px;
          opacity: 0.7;
        }

        .rp-cn-preview {
          min-width: 0;
        }
        .rp-cn-paperwrap {
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          padding: 14px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        @media print {
          .print-hidden {
            display: none !important;
          }
          .rp-cn-shell {
            background: #fff !important;
            color: #000 !important;
          }
          .rp-cn-body {
            display: block;
            padding: 0 !important;
          }
          .rp-cn-paperwrap {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}

