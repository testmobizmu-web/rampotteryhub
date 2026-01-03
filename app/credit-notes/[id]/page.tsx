"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import RamPotteryDocCreditNote from "@/components/RamPotteryDocCreditNote";

type CustomerInfo = {
  id: number;
  name: string | null;
  address: string | null;
  phone: string | null;
  brn: string | null;
  vat_no: string | null;
  customer_code: string | null;
};

type ProductInfo = { id: number; item_code: string | null; name: string | null };

type CreditNoteItemView = {
  id: number;
  product_id: number | null;

  // qty fields
  uom?: string | null; // may exist in DB now
  box_qty: number | null;
  units_per_box: number | null;
  total_qty: number | null;

  // pricing
  unit_price_excl_vat: number | null;
  unit_vat: number | null;

  products: ProductInfo | null;

  // computed on client:
  unit_price_incl_vat?: number;
  line_total?: number;
};

type CreditNoteView = {
  id: number;
  credit_note_number: string | null;
  credit_note_date: string | null;

  purchase_order_no?: string | null;
  sales_rep?: string | null;
  sales_rep_phone?: string | null;

  subtotal: number | null;
  vat_amount: number | null;
  total_amount: number | null;

  status: string | null;

  customers: CustomerInfo | null;
  credit_note_items: CreditNoteItemView[] | null;
};

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
function n2(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}
function fmtDate(s: string | null | undefined) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return String(s);
  return d.toLocaleDateString("en-GB");
}

export default function CreditNoteReprintPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);

  const [cn, setCn] = useState<CreditNoteView | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [voiding, setVoiding] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("rp_user") || "";
      const u = raw ? JSON.parse(raw) : null;
      setIsAdmin(String(u?.role || "").toLowerCase() === "admin");
    } catch {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    if (!id || !Number.isFinite(id) || id <= 0) {
      setLoading(false);
      setErr("Invalid credit note id");
      return;
    }

    async function load() {
      setLoading(true);
      setErr(null);

      const { data, error } = await supabase
        .from("credit_notes")
        .select(
          `
          id,
          credit_note_number,
          credit_note_date,
          subtotal,
          vat_amount,
          total_amount,
          status,
          sales_rep,
          sales_rep_phone,
          purchase_order_no,
          customers (
            id,
            name,
            address,
            phone,
            brn,
            vat_no,
            customer_code
          ),
          credit_note_items (
            id,
            product_id,
            uom,
            box_qty,
            units_per_box,
            total_qty,
            unit_price_excl_vat,
            unit_vat,
            products ( id, item_code, name )
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        setErr(error.message);
        setCn(null);
      } else {
        setCn(data as unknown as CreditNoteView);
      }

      setLoading(false);
    }

    load();
  }, [id]);

  const computed = useMemo(() => {
    const items = (cn?.credit_note_items || []).map((r) => {
      const ex = n2(r.unit_price_excl_vat);
      const vat = n2(r.unit_vat);
      const incl = round2(ex + vat);

      const uom = String(r.uom || "BOX").toUpperCase();
      const boxQty = n2(r.box_qty);
      const unitsPerBox = n2(r.units_per_box);

      // If total_qty is present, use it; else compute:
      // BOX: boxQty * unitsPerBox
      // PCS: boxQty (stored in box_qty as qty input)
      const fallbackQty = uom === "PCS" ? boxQty : boxQty * unitsPerBox;
      const qty = n2(r.total_qty ?? fallbackQty);

      const lineTotal = round2(incl * qty);

      return {
        ...r,
        uom,
        total_qty: qty,
        unit_price_incl_vat: incl,
        line_total: lineTotal,
      };
    });

    const subtotal = round2(n2(cn?.subtotal));
    const vatAmount = round2(n2(cn?.vat_amount));
    const totalAmount = round2(n2(cn?.total_amount ?? subtotal + vatAmount));

    return { items, subtotal, vatAmount, totalAmount };
  }, [cn]);

  if (loading) {
    return (
      <div className="rp-soft-page">
        <div className="rp-soft-card">Loading credit note…</div>
        <style jsx global>{baseScreenCss}</style>
      </div>
    );
  }

  if (!cn || err) {
    return (
      <div className="rp-soft-page">
        <div className="rp-soft-card">
          <div className="rp-soft-title">Credit note not found</div>
          <div className="rp-soft-err">{err ? `Error: ${err}` : ""}</div>
          <button className="rp-ui-btn rp-ui-btn--brand" onClick={() => router.push("/credit-notes")}>
            <span className="rp-ui-btn__dot" aria-hidden="true" /> ← Back to Credit Notes
          </button>
        </div>
        <style jsx global>{baseScreenCss}</style>
      </div>
    );
  }

  const statusUpper = String(cn.status || "ISSUED").toUpperCase();
  const isVoid = statusUpper === "VOID";

  async function handleVoid() {
    if (!cn || isVoid) return;

    const ok = confirm(
      "This will VOID the credit note and reverse stock.\nThis action cannot be undone.\n\nProceed?"
    );
    if (!ok) return;

    try {
      setVoiding(true);

      const res = await fetch(`/api/credit-notes/${cn.id}/void`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-rp-user": localStorage.getItem("rp_user") || "",
        },
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to void credit note");

      router.refresh();
    } catch (e: any) {
      alert(e?.message || "Failed to VOID credit note");
    } finally {
      setVoiding(false);
    }
  }

  const mappedItems = computed.items.map((r, idx) => ({
    sn: idx + 1,
    item_code: r.products?.item_code,
    uom: r.uom || "BOX",
    box_qty: r.box_qty,
    units_per_box: r.units_per_box,
    total_qty: r.total_qty,
    description: r.products?.name,
    unit_price_excl_vat: r.unit_price_excl_vat,
    unit_vat: r.unit_vat,
    unit_price_incl_vat: r.unit_price_incl_vat,
    line_total: r.line_total,
  }));

  // Totals (credit note usually has no running balances; keep 0 unless you add later)
  const prevBalance = 0;
  const grossTotal = round2(computed.totalAmount + prevBalance);
  const amountPaid = 0;
  const balanceRemaining = round2(grossTotal - amountPaid);

  const docNo = cn.credit_note_number || `#${cn.id}`;
  const docDate = fmtDate(cn.credit_note_date);

  return (
    <div className="rp-print-shell">
      {/* Top controls (screen only) */}
      <div className="rp-print-top print-hidden">
        <div className="rp-print-left">
          <button className="rp-ui-btn" onClick={() => router.push("/credit-notes")}>
            <span className="rp-ui-btn__dot" aria-hidden="true" /> ← Back
          </button>

          <span className={`rp-badge ${isVoid ? "rp-badge--void" : "rp-badge--issued"}`}>
            {isVoid ? "VOID (LOCKED)" : statusUpper}
          </span>

          <span className="rp-soft-pill">
            Credit Note: <b>{docNo}</b>
          </span>
        </div>

        <div className="rp-print-right">
          {isAdmin && (
            <button
              className="rp-ui-btn rp-ui-btn--danger"
              onClick={handleVoid}
              disabled={isVoid || voiding}
              title={isVoid ? "Already VOID" : "VOID credit note"}
            >
              <span className="rp-ui-btn__dot" aria-hidden="true" />
              {voiding ? "Voiding…" : "🛑 VOID"}
            </button>
          )}

          <button
            className="rp-ui-btn rp-ui-btn--brand"
            onClick={() => window.print()}
            disabled={isVoid}
            title={isVoid ? "VOID credit notes are locked" : "Print / Save PDF"}
          >
            <span className="rp-ui-btn__dot" aria-hidden="true" />
            🖨 Print / Save PDF
          </button>
        </div>
      </div>

      {isVoid && (
        <div className="rp-note rp-note--warn print-hidden">
          🔒 This credit note is VOID and locked. Reprint is disabled.
        </div>
      )}

      {/* ✅ LOCKED A4 TEMPLATE (shared engine) */}
      <RamPotteryDocCreditNote
        docNoLabel="CREDIT NOTE NO:"
        docNoValue={docNo}
        dateLabel="DATE:"
        dateValue={docDate}
        purchaseOrderValue={cn.purchase_order_no || ""}
        salesRepName={cn.sales_rep || ""}
        salesRepPhone={cn.sales_rep_phone || ""}
        customer={{
          name: cn.customers?.name,
          address: cn.customers?.address,
          phone: cn.customers?.phone,
          brn: cn.customers?.brn,
          vat_no: cn.customers?.vat_no,
          customer_code: cn.customers?.customer_code,
        }}
        company={{
          brn: "C17144377",
          vat_no: "123456789",
        }}
        items={mappedItems}
        totals={{
          subtotal: computed.subtotal,
          vat_amount: computed.vatAmount,
          total_amount: computed.totalAmount,
          previous_balance: prevBalance,
          amount_paid: amountPaid,
          balance_remaining: balanceRemaining,
          vatPercentLabel: "VAT 15%",
        }}
      />

      <style jsx global>{baseScreenCss}</style>
    </div>
  );
}

/* ------------------ Screen (premium) CSS ------------------ */
const baseScreenCss = `
  .rp-soft-page{
    padding: 18px;
    background: radial-gradient(900px 400px at 10% 0%, rgba(184,0,0,.08), transparent 55%),
                radial-gradient(700px 340px at 90% 0%, rgba(0,0,0,.08), transparent 55%),
                #f3f4f6;
    min-height: 100vh;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
  }
  .rp-soft-card{
    max-width: 980px;
    margin: 0 auto;
    background: rgba(255,255,255,.95);
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 18px;
    padding: 16px;
    box-shadow: 0 18px 50px rgba(0,0,0,.10);
  }
  .rp-soft-title{ font-weight: 1000; font-size: 16px; margin-bottom: 6px;}
  .rp-soft-err{ color:#e11d48; font-weight: 900; margin-bottom: 12px;}

  .rp-ui-btn{
    border: 1px solid rgba(0,0,0,.12);
    background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(245,245,245,.98));
    border-radius: 14px;
    padding: 10px 12px;
    font-weight: 950;
    cursor: pointer;
    box-shadow: 0 10px 22px rgba(0,0,0,.10);
    display: inline-flex;
    align-items: center;
    gap: 10px;
    transition: transform .12s ease, box-shadow .12s ease, filter .12s ease;
  }
  .rp-ui-btn:hover{
    transform: translateY(-1px);
    box-shadow: 0 14px 30px rgba(0,0,0,.14);
    filter: brightness(1.02);
  }
  .rp-ui-btn:active{ transform: translateY(0); box-shadow: 0 10px 22px rgba(0,0,0,.10); }
  .rp-ui-btn:disabled{ opacity:.55; cursor:not-allowed; transform:none; }

  .rp-ui-btn__dot{
    width: 10px; height: 10px; border-radius: 999px;
    background: radial-gradient(circle at 30% 30%, #fff, rgba(255,255,255,.2) 40%, rgba(255,255,255,0) 70%),
                #b80000;
    box-shadow: 0 0 0 4px rgba(184,0,0,.10);
  }

  .rp-ui-btn--brand{
    background: linear-gradient(180deg, rgba(184,0,0,.98), rgba(150,0,0,.98));
    color:#fff;
    border-color: rgba(184,0,0,.55);
  }
  .rp-ui-btn--brand:hover{ filter: brightness(1.06); }
  .rp-ui-btn--danger{
    background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(245,245,245,.98));
    color:#7f1d1d;
    border-color: rgba(127,29,29,.35);
  }

  .rp-badge{
    font-weight: 1000;
    font-size: 12px;
    padding: 7px 10px;
    border-radius: 999px;
    border: 1px solid rgba(0,0,0,.12);
    background: rgba(255,255,255,.95);
    display: inline-flex;
    align-items:center;
    gap: 8px;
  }
  .rp-badge--issued{ color:#065f46; border-color: rgba(6,95,70,.22); background: rgba(16,185,129,.10); }
  .rp-badge--void{ color:#991b1b; border-color: rgba(153,27,27,.22); background: rgba(239,68,68,.10); }

  .rp-soft-pill{
    padding: 8px 10px;
    border-radius: 999px;
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(0,0,0,.08);
    font-weight: 900;
  }

  .rp-note{
    max-width: 980px;
    margin: 10px auto 0 auto;
    border-radius: 14px;
    padding: 10px 12px;
    font-weight: 950;
    border: 1px solid rgba(0,0,0,.10);
  }
  .rp-note--warn{
    background: rgba(239,68,68,.10);
    border-color: rgba(153,27,27,.18);
    color:#991b1b;
  }

  .rp-print-shell{
    background: radial-gradient(900px 400px at 10% 0%, rgba(184,0,0,.08), transparent 55%),
                radial-gradient(700px 340px at 90% 0%, rgba(0,0,0,.08), transparent 55%),
                #f3f4f6;
    min-height: 100vh;
    padding: 16px 10px;
    font-family: Arial, Helvetica, sans-serif;
  }

  .rp-print-top{
    max-width: 980px;
    margin: 0 auto 10px auto;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap: 10px;
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 18px;
    padding: 12px;
    box-shadow: 0 18px 50px rgba(0,0,0,.10);
  }
  .rp-print-left, .rp-print-right{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
`;
