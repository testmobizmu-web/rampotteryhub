"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

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
  box_qty: number | null;
  units_per_box: number | null;
  total_qty: number | null;
  unit_price_excl_vat: number | null;
  unit_vat: number | null;
  products: ProductInfo | null;

  // computed (client side)
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
function money(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CreditNoteDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [cn, setCn] = useState<CreditNoteView | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const id = Number(params?.id);

  useEffect(() => {
    if (!id) return;

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

      const boxQty = n2(r.box_qty);
      const unitsPerBox = n2(r.units_per_box);

      // fallback: total_qty = box * units_per_box if missing
      const qty = n2(r.total_qty ?? boxQty * unitsPerBox);
      const lineTotal = round2(incl * qty);

      return {
        ...r,
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
      <div style={{ padding: 22, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
        Loading credit note…
      </div>
    );
  }

  if (!cn || err) {
    return (
      <div style={{ padding: 22, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
        <div style={{ marginBottom: 12, fontWeight: 900 }}>
          Credit note not found
        </div>
        <div style={{ color: "#e11d48", fontWeight: 900 }}>{err ? `Error: ${err}` : ""}</div>
        <button
          onClick={() => router.push("/credit-notes")}
          style={{
            marginTop: 14,
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,.15)",
            padding: "10px 12px",
            fontWeight: 900,
            cursor: "pointer",
            background: "white",
          }}
        >
          ← Back to Credit Notes
        </button>
      </div>
    );
  }

  const customer = cn.customers;

  // ======= Company header (edit to your real details if needed) =======
  const COMPANY = {
    name: "RAM POTTERY LTD",
    tagline1: "MANUFACTURER & IMPORTER OF QUALITY CLAY",
    tagline2: "PRODUCTS AND OTHER RELIGIOUS ITEMS",
    address: "Robert Kennedy Street, Reunion Maurel, Petit Raffray - Mauritius",
    tel: "+230 57788884  +230 58060268  +230 52522844",
    email: "info@rampottery.com",
    web: "www.rampottery.com",
    brn: "C17144377",
    vat: "VAT:123456789",
  };

  // Totals box lines you show in template
  const prevBalance = 0; // if you later store it, map here
  const grossTotal = round2(computed.totalAmount + prevBalance);
  const amountPaid = 0; // credit notes often 0; if stored, map here
  const balanceRemaining = round2(grossTotal - amountPaid);

  const docNo = cn.credit_note_number || `#${cn.id}`;
  const docDate = fmtDate(cn.credit_note_date);

  const red = "#e30613";
  const border = "#111";

  return (
    <div className="rp-print-page">
      {/* Screen controls (hidden on print) */}
      <div className="rp-print-controls print-hidden">
        <button className="rp-btn" onClick={() => router.push("/credit-notes")}>
          ← Back
        </button>
        <button className="rp-btn rp-btn-primary" onClick={() => window.print()}>
          🖨 Print / Save PDF
        </button>
      </div>

      {/* ===== A4 DOCUMENT ===== */}
      <div className="rp-a4">
        <div className="rp-doc">
          {/* HEADER OUTER BOX */}
          <div className="rp-headerbox">
            <div className="rp-head-grid">
              {/* Logo */}
              <div className="rp-head-logo">
                <Image
                  src="/images/logo/logo.png"
                  alt="Ram Pottery Logo"
                  width={140}
                  height={140}
                  priority
                  style={{ width: 140, height: 140, objectFit: "contain" }}
                />
              </div>

              {/* Center text */}
              <div className="rp-head-center">
                <div className="rp-title">{COMPANY.name}</div>
                <div className="rp-sub">{COMPANY.tagline1}</div>
                <div className="rp-sub">{COMPANY.tagline2}</div>

                <div className="rp-addr">{COMPANY.address}</div>

                <div className="rp-line">
                  <span className="rp-red">Tel:</span> {COMPANY.tel}
                </div>
                <div className="rp-line">
                  <span className="rp-red">Email:</span> {COMPANY.email}{" "}
                  <span className="rp-red">Web:</span> {COMPANY.web}
                </div>

                <div className="rp-doc-type">CREDIT NOTE</div>
              </div>
            </div>
          </div>

          {/* CUSTOMER + META ROW */}
          <div className="rp-row2">
            {/* CUSTOMER DETAILS BOX */}
            <div className="rp-box">
              <div className="rp-box-head">CUSTOMER DETAILS</div>
              <div className="rp-box-body">
                <div className="rp-field">
                  <div className="rp-lbl">Name:</div>
                  <div className="rp-val">{customer?.name || ""}</div>
                </div>
                <div className="rp-field">
                  <div className="rp-lbl">ADDRESS:</div>
                  <div className="rp-val">{customer?.address || ""}</div>
                </div>
                <div className="rp-field">
                  <div className="rp-lbl">Tel:</div>
                  <div className="rp-val">{customer?.phone || ""}</div>
                </div>

                <div className="rp-field rp-dual">
                  <div className="rp-dual-left">
                    <div className="rp-lbl">BRN:</div>
                    <div className="rp-val">{customer?.brn || ""}</div>
                  </div>
                  <div className="rp-dual-right">
                    <div className="rp-lbl">VAT No:</div>
                    <div className="rp-val">{customer?.vat_no || ""}</div>
                  </div>
                </div>

                <div className="rp-field">
                  <div className="rp-lbl">CUSTOMER CODE:</div>
                  <div className="rp-val">{customer?.customer_code || ""}</div>
                </div>
              </div>
            </div>

            {/* META BOX */}
            <div className="rp-box">
              <div className="rp-box-head rp-box-head-split">
                <span>BRN: {COMPANY.brn}</span>
                <span> {COMPANY.vat}</span>
              </div>

              <div className="rp-box-body">
                <div className="rp-field">
                  <div className="rp-lbl">CREDIT NOTE NO:</div>
                  <div className="rp-val">{docNo}</div>
                </div>
                <div className="rp-field">
                  <div className="rp-lbl">DATE:</div>
                  <div className="rp-val">{docDate}</div>
                </div>
                <div className="rp-field">
                  <div className="rp-lbl">PURCHASE ORDER NO:</div>
                  <div className="rp-val">{cn.purchase_order_no || ""}</div>
                </div>

                <div className="rp-field rp-sales">
                  <div className="rp-lbl">SALES REP:</div>
                  <div className="rp-val">
                    {cn.sales_rep ? `Mr ${cn.sales_rep}` : ""}{" "}
                    <span className="rp-red" style={{ marginLeft: 10 }}>
                      Tel:
                    </span>{" "}
                    {cn.sales_rep_phone || ""}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <div className="rp-tablebox">
            <table className="rp-table">
              <thead>
                <tr>
                  <th>SN</th>
                  <th>ITEM CODE</th>
                  <th>BOX</th>
                  <th>UNIT PER BOX</th>
                  <th>TOTAL QTY</th>
                  <th className="rp-desc">DESCRIPTION</th>
                  <th>UNIT PRICE (Excl Vat)</th>
                  <th>VAT</th>
                  <th>UNIT PRICE (Incl Vat)</th>
                  <th>TOTAL AMOUNT (Incl Vat)</th>
                </tr>
              </thead>
              <tbody>
                {computed.items.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="rp-empty">
                      No items
                    </td>
                  </tr>
                ) : (
                  computed.items.map((r, idx) => (
                    <tr key={r.id}>
                      <td className="rp-num">{idx + 1}</td>
                      <td>{r.products?.item_code || ""}</td>
                      <td className="rp-num">{n2(r.box_qty) ? n2(r.box_qty) : ""}</td>
                      <td className="rp-num">{n2(r.units_per_box) ? n2(r.units_per_box) : ""}</td>
                      <td className="rp-num">{n2(r.total_qty) ? n2(r.total_qty) : ""}</td>
                      <td className="rp-desc">{r.products?.name || ""}</td>
                      <td className="rp-money">{money(n2(r.unit_price_excl_vat))}</td>
                      <td className="rp-money">{money(n2(r.unit_vat))}</td>
                      <td className="rp-money">{money(n2(r.unit_price_incl_vat))}</td>
                      <td className="rp-money">{money(n2(r.line_total))}</td>
                    </tr>
                  ))
                )}

                {/* Add blank rows to mimic template height (so totals sit at bottom like your picture) */}
                {Array.from({ length: Math.max(0, 10 - computed.items.length) }).map((_, i) => (
                  <tr key={`blank-${i}`} className="rp-blank">
                    <td>&nbsp;</td><td /><td /><td /><td /><td /><td /><td /><td /><td />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* NOTES + TOTALS */}
          <div className="rp-bottom">
            {/* NOTES */}
            <div className="rp-notes">
              <div className="rp-notes-title">Note:</div>
              <ul>
                <li>Goods once sold cannot be returned or exchanged.</li>
                <li>For any other manufacturing defects, must provide this invoice for a refund or exchange.</li>
                <li>
                  Customer must verify that the quantity of goods conforms with their invoice; otherwise, we will not be
                  responsible after delivery
                </li>
                <li>Interest of 1% above the bank rate will be charged on sum due if not settled within 30 days.</li>
                <li>All cheques to be issued on <b>RAM POTTERY LTD.</b></li>
                <li>Bank transfer to <b className="rp-red">000 44 570 46 59 MCB Bank</b></li>
              </ul>
            </div>

            {/* TOTALS BOX */}
            <div className="rp-totals">
              <table className="rp-totals-table">
                <tbody>
                  <tr>
                    <td>SUB TOTAL</td>
                    <td className="rp-money">{money(computed.subtotal)}</td>
                  </tr>
                  <tr>
                    <td>VAT 15%</td>
                    <td className="rp-money">{money(computed.vatAmount)}</td>
                  </tr>
                  <tr>
                    <td><b>TOTAL AMOUNT</b></td>
                    <td className="rp-money"><b>{money(computed.totalAmount)}</b></td>
                  </tr>
                  <tr>
                    <td>PREVIOUS BALANCE</td>
                    <td className="rp-money">{money(prevBalance)}</td>
                  </tr>
                  <tr>
                    <td><b>GROSS TOTAL</b></td>
                    <td className="rp-money"><b>{money(grossTotal)}</b></td>
                  </tr>
                  <tr>
                    <td>AMOUNT PAID</td>
                    <td className="rp-money">{money(amountPaid)}</td>
                  </tr>
                  <tr>
                    <td><b>BALANCE REMAINING</b></td>
                    <td className="rp-money"><b>{money(balanceRemaining)}</b></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SIGNATURES */}
          <div className="rp-sign">
            <div className="rp-sign-col">
              <div className="rp-sign-line" />
              <div className="rp-sign-label">Signature</div>
              <div className="rp-sign-sub">Prepared by:</div>
            </div>
            <div className="rp-sign-col">
              <div className="rp-sign-line" />
              <div className="rp-sign-label">Signature</div>
              <div className="rp-sign-sub">Delivered by:</div>
            </div>
            <div className="rp-sign-col">
              <div className="rp-sign-line" />
              <div className="rp-sign-label">Customer Signature</div>
              <div className="rp-sign-sub">Customer Name: <i>Please verify before sign</i></div>
            </div>
          </div>

          {/* BOTTOM RED STRIP */}
          <div className="rp-strip">
            We thank you for your purchase and look forward to being of service to you again
          </div>
        </div>
      </div>

      {/* ===== GLOBAL/PRINT CSS ===== */}
      <style jsx global>{`
        /* keep print clean */
        .print-hidden { display: block; }
        @media print {
          .print-hidden { display: none !important; }
        }

        .rp-print-page{
          font-family: Arial, Helvetica, sans-serif;
          background:#f3f4f6;
          padding: 16px 10px;
        }

        .rp-print-controls{
          max-width: 980px;
          margin: 0 auto 12px auto;
          display:flex;
          gap:10px;
          justify-content:flex-end;
        }
        .rp-btn{
          border:1px solid rgba(0,0,0,.2);
          background:#fff;
          padding:10px 12px;
          border-radius:10px;
          font-weight:900;
          cursor:pointer;
        }
        .rp-btn-primary{
          border-color: ${red};
          background:${red};
          color:#fff;
        }

        /* A4 sizing */
        .rp-a4{
          max-width: 980px;
          margin: 0 auto;
        }
        .rp-doc{
          background:#fff;
          border:2px solid ${border};
        }

        @page { size: A4; margin: 10mm; }
        @media print{
          body{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .rp-print-page{ background:#fff; padding:0; }
          .rp-a4{ max-width: none; margin:0; }
          .rp-doc{ border:2px solid ${border}; }
        }

        /* Header */
        .rp-headerbox{
          border-bottom: 2px solid ${border};
          padding: 12px 12px 6px 12px;
        }
        .rp-head-grid{
          display:grid;
          grid-template-columns: 170px 1fr;
          gap: 10px;
          align-items:center;
        }
        .rp-head-logo{ display:flex; justify-content:center; align-items:center; }
        .rp-head-center{ text-align:center; }
        .rp-title{
          color:${red};
          font-size: 34px;
          font-weight: 900;
          letter-spacing: .08em;
          line-height:1.1;
        }
        .rp-sub{
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .02em;
          margin-top: 2px;
        }
        .rp-addr{
          margin-top: 6px;
          font-size: 12px;
          font-weight: 700;
        }
        .rp-line{
          margin-top: 4px;
          font-size: 11px;
          font-weight: 700;
        }
        .rp-red{ color:${red}; font-weight:900; }
        .rp-doc-type{
          margin-top: 6px;
          color:${red};
          font-size: 13px;
          font-weight: 900;
          letter-spacing: .15em;
        }

        /* Row 2 boxes */
        .rp-row2{
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 10px 12px 12px 12px;
        }
        .rp-box{
          border: 2px solid ${border};
        }
        .rp-box-head{
          background:${red};
          color:#fff;
          font-weight: 900;
          letter-spacing: .06em;
          font-size: 12px;
          padding: 7px 10px;
          text-transform: uppercase;
          display:flex;
          justify-content:flex-start;
        }
        .rp-box-head-split{
          justify-content: space-between;
          gap: 10px;
        }
        .rp-box-body{
          padding: 10px 10px 8px 10px;
          font-size: 12px;
          font-weight: 700;
        }
        .rp-field{
          display:grid;
          grid-template-columns: 140px 1fr;
          gap: 8px;
          padding: 4px 0;
        }
        .rp-sales{
          grid-template-columns: 140px 1fr;
        }
        .rp-lbl{
          color:${red};
          font-weight: 900;
          text-transform: uppercase;
        }
        .rp-val{ color:#111; font-weight: 800; }
        .rp-dual{
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .rp-dual-left, .rp-dual-right{
          display:grid;
          grid-template-columns: 60px 1fr;
          gap: 8px;
          align-items:center;
        }

        /* Table */
        .rp-tablebox{
          border-top: 2px solid ${border};
          border-bottom: 2px solid ${border};
          margin: 0 12px;
        }
        .rp-table{
          width:100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        .rp-table thead th{
          background:${red};
          color:#fff;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .04em;
          padding: 8px 6px;
          border: 1px solid ${border};
          text-transform: uppercase;
        }
        .rp-table td{
          border: 1px solid ${border};
          padding: 7px 6px;
          font-size: 11px;
          font-weight: 700;
          vertical-align: top;
          height: 28px;
        }
        .rp-table .rp-desc{ width: 26%; }
        .rp-num{ text-align:center; font-variant-numeric: tabular-nums; }
        .rp-money{ text-align:right; font-variant-numeric: tabular-nums; }
        .rp-empty{ text-align:center; padding: 18px 6px; font-weight: 900; }
        .rp-blank td{ height: 28px; }

        /* Bottom area */
        .rp-bottom{
          display:grid;
          grid-template-columns: 1.2fr .8fr;
          gap: 14px;
          padding: 12px;
          align-items: start;
        }
        .rp-notes{
          border-left: 2px solid ${border};
          padding-left: 10px;
        }
        .rp-notes-title{
          color:${red};
          font-weight: 900;
          font-style: italic;
          margin-bottom: 6px;
        }
        .rp-notes ul{
          margin: 0;
          padding-left: 16px;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.35;
        }
        .rp-notes li{ margin: 6px 0; }
        .rp-totals{
          border: 2px solid ${border};
        }
        .rp-totals-table{
          width:100%;
          border-collapse: collapse;
        }
        .rp-totals-table td{
          border: 1px solid ${border};
          padding: 8px 8px;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        /* Signatures */
        .rp-sign{
          display:grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 18px;
          padding: 26px 12px 14px 12px;
          border-top: 2px solid ${border};
        }
        .rp-sign-col{ text-align:center; }
        .rp-sign-line{
          height: 1px;
          background: ${border};
          margin: 18px 0 8px 0;
        }
        .rp-sign-label{
          font-size: 11px;
          font-weight: 900;
        }
        .rp-sign-sub{
          margin-top: 6px;
          font-size: 11px;
          font-weight: 700;
        }

        /* Bottom strip */
        .rp-strip{
          background:${red};
          color:#fff;
          font-weight: 900;
          font-style: italic;
          text-align:center;
          padding: 8px 10px;
          border-top: 2px solid ${border};
          letter-spacing: .02em;
          font-size: 12px;
        }

        /* Mobile: stack boxes */
        @media (max-width: 860px){
          .rp-row2{ grid-template-columns: 1fr; }
          .rp-bottom{ grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}


