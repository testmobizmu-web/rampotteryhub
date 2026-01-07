"use client";

import Image from "next/image";
import React from "react";

type Party = {
  name?: string | null;
  address?: string | null;
  phone?: string | null;
  brn?: string | null;
  vat_no?: string | null;
  customer_code?: string | null;
};

type DocCompany = {
  brn?: string | null;
  vat_no?: string | null;
};

type Totals = {
  subtotal?: number | null;
  vatPercentLabel?: string; // e.g. "VAT 15%"
  vat_amount?: number | null;
  total_amount?: number | null;
  previous_balance?: number | null;
  amount_paid?: number | null;
  balance_remaining?: number | null;

  // ✅ snapshot values stored in invoice (audit-proof)
  discount_percent?: number | null;
  discount_amount?: number | null;
};

export type RamPotteryDocProps = {
  variant: "INVOICE" | "CREDIT_NOTE";
  docNoLabel: string;
  docNoValue: string;
  dateLabel: string;
  dateValue: string;
  purchaseOrderLabel?: string;
  purchaseOrderValue?: string | null;

  salesRepName?: string | null;
  salesRepPhone?: string | null;

  customer: Party;
  company?: DocCompany;

  tableHeaderRightTitle?: string;

  items: Array<{
    sn: number;
    item_code?: string | null;

    uom?: string | null; // "BOX" | "PCS"
    box_qty?: number | null; // used as qty input for both BOX/PCS
    units_per_box?: number | null; // blank when PCS
    total_qty?: number | null;

    description?: string | null;
    unit_price_excl_vat?: number | null;
    unit_vat?: number | null;
    unit_price_incl_vat?: number | null;
    line_total?: number | null;
  }>;

  totals: Totals;

  preparedBy?: string | null;
  deliveredBy?: string | null;

  footerThanksText?: string;
};

function money(n: any) {
  const v = Number(n || 0);
  return Number.isFinite(v) ? v.toFixed(2) : "0.00";
}

function safe(s: any) {
  return String(s ?? "");
}

function uomLabel(u: any) {
  const x = String(u || "BOX").toUpperCase();
  return x === "PCS" ? "PCS" : "BOX";
}

/**
 * LOCKED A4 PRINT TEMPLATE
 */
export default function RamPotteryDoc(props: RamPotteryDocProps) {
  const {
    variant,
    docNoLabel,
    docNoValue,
    dateLabel,
    dateValue,
    purchaseOrderLabel = "PURCHASE ORDER NO:",
    purchaseOrderValue,
    salesRepName,
    salesRepPhone,
    customer,
    company,
    tableHeaderRightTitle,
    items,
    totals,
    preparedBy,
    deliveredBy,
    footerThanksText = "We thank you for your purchase and look forward to being of service to you again",
  } = props;

  const titleTop = "RAM POTTERY LTD";
  const subLine1 = "MANUFACTURER & IMPORTER OF QUALITY CLAY";
  const subLine2 = "PRODUCTS AND OTHER RELIGIOUS ITEMS";

  const addrLine1 = "Robert Kennedy Street, Reunion Maurel,";
  const addrLine2 = "Petit Raffray - Mauritius";

  const vatLabel = totals.vatPercentLabel || "VAT 15%";

  const brn = (company?.brn || "").trim();
  const vatNo = (company?.vat_no || "").trim();

  const repName = (salesRepName || "").trim();
  const repPhone = (salesRepPhone || "").trim();

  const gross = Number(totals.total_amount || 0) + Number(totals.previous_balance || 0);

  const hasDiscount =
    Number(totals.discount_amount || 0) > 0 || Number(totals.discount_percent || 0) > 0;

  return (
    <div className="rpdoc-wrap">
      <div className="rpdoc-page">
        {/* HEADER */}
        <div className="rpdoc-header">
          <div className="rpdoc-logo rpdoc-logo--big">
            <Image
              src="/images/logo/logo.png"
              alt="Ram Pottery Logo"
              width={190}
              height={190}
              priority
            />
          </div>

          <div className="rpdoc-head-center">
            <div
              className="rpdoc-title"
              style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
              {titleTop}
            </div>

            <div className="rpdoc-sub">{subLine1}</div>
            <div className="rpdoc-sub">{subLine2}</div>

            <div className="rpdoc-addr">
              {addrLine1}
              <br />
              {addrLine2}
            </div>

            <div className="rpdoc-contacts">
              <span>
                <b>Tel:</b> +230 57788884 +230 58060268 +230 52522844
              </span>
              <span>
                <b>Email:</b> info@rampottery.com
              </span>
              <span>
                <b>Web:</b> www.rampottery.com
              </span>
            </div>

            <div className="rpdoc-midtitle">
              {tableHeaderRightTitle ||
                (variant === "INVOICE" ? "VAT INVOICE" : "CREDIT NOTE")}
            </div>
          </div>

          <div className="rpdoc-logo-spacer" />
        </div>

        {/* TOP BOXES */}
        <div className="rpdoc-topgrid">
          <div className="rpdoc-box">
            <div className="rpdoc-box-title">CUSTOMER DETAILS</div>
            <div className="rpdoc-box-body">
              <div className="rpdoc-row">
                <span className="k">Name:</span>
                <span className="v">{customer?.name || ""}</span>
              </div>

              <div className="rpdoc-row">
                <span className="k">ADDRESS:</span>
                <span className="v">{customer?.address || ""}</span>
              </div>

              <div className="rpdoc-row">
                <span className="k">Tel:</span>
                <span className="v">{customer?.phone || ""}</span>
              </div>

              <div className="rpdoc-row rpdoc-row-split rpdoc-row-split--left">
                <span className="rpdoc-pair">
                  <span className="k">BRN:</span>
                  <span className="v">{customer?.brn || ""}</span>
                </span>

                <span className="rpdoc-pair">
                  <span className="k">VAT No:</span>
                  <span className="v">{customer?.vat_no || ""}</span>
                </span>
              </div>

              <div className="rpdoc-row rpdoc-row-grid">
                <span className="k">CUSTOMER CODE:</span>
                <span className="v">{customer?.customer_code || ""}</span>
              </div>
            </div>
          </div>

          <div className="rpdoc-box">
            <div className="rpdoc-box-title rpdoc-box-title-center">
              BRN: {brn} {brn || vatNo ? "|" : ""} VAT:{vatNo}
            </div>

            <div className="rpdoc-box-body">
              <div className="rpdoc-row">
                <span className="k">{docNoLabel}</span>
                <span className="v">{docNoValue}</span>
              </div>

              <div className="rpdoc-row">
                <span className="k">{dateLabel}</span>
                <span className="v">{dateValue}</span>
              </div>

              <div className="rpdoc-row">
                <span className="k">{purchaseOrderLabel}</span>
                <span className="v">{purchaseOrderValue || ""}</span>
              </div>

              <div className="rpdoc-row rpdoc-row-split">
                <span>
                  <span className="k">SALES REP:</span>{" "}
                  <span className="v">{repName}</span>
                </span>

                <span>
                  {repPhone ? (
                    <>
                      <span className="k">Tel:</span>{" "}
                      <span className="v">{repPhone}</span>
                    </>
                  ) : (
                    <span className="v"></span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <table className="rpdoc-table2">
          <thead className="rpdoc-thead2">
            <tr>
              <th className="c-sn">SN</th>
              <th className="c-code">ITEM CODE</th>
              <th className="c-box">BOX</th>
              <th className="c-upb">UNIT PER BOX</th>
              <th className="c-tqty">TOTAL QTY</th>
              <th className="c-desc">DESCRIPTION</th>
              <th className="c-ex">
                UNIT PRICE<br />(Excl Vat)
              </th>
              <th className="c-vat">VAT</th>
              <th className="c-inc">
                UNIT PRICE<br />(Incl Vat)
              </th>
              <th className="c-total">
                TOTAL AMOUNT<br />(Incl Vat)
              </th>
            </tr>
          </thead>

          <tbody className="rpdoc-tbody2">
            {(items || []).map((it) => {
              const u = uomLabel(it.uom);
              const qty = it.box_qty ?? "";
              const upb = u === "PCS" ? "" : it.units_per_box ?? "";

              return (
                <tr className="rpdoc-tr2" key={it.sn}>
                  <td className="rpdoc-center">{it.sn}</td>
                  <td className="rpdoc-center">{it.item_code || ""}</td>
                  <td className="rpdoc-center">
                    {u === "PCS" ? `PCS ${safe(qty)}` : safe(qty)}
                  </td>
                  <td className="rpdoc-center">{safe(upb)}</td>
                  <td className="rpdoc-center">{safe(it.total_qty ?? "")}</td>
                  <td className="rpdoc-desc2">{it.description || ""}</td>
                  <td className="rpdoc-num">{money(it.unit_price_excl_vat)}</td>
                  <td className="rpdoc-num">{money(it.unit_vat)}</td>
                  <td className="rpdoc-num">{money(it.unit_price_incl_vat)}</td>
                  <td className="rpdoc-num">{money(it.line_total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* BOTTOM GRID */}
        <div className="rpdoc-bottomgrid">
          <div className="rpdoc-notes">
            <div className="rpdoc-notes-title">Note:</div>
            <ul>
              <li>Goods once sold cannot be returned or exchanged.</li>
              <li>
                For any other manufacturing defects, must provide this invoice for
                a refund or exchange.
              </li>
              <li>
                Customer must verify that the quantity of goods conforms with
                their invoice; otherwise, we will not be responsible after
                delivery
              </li>
              <li>
                Interest of 1% above the bank rate will be charged on sum due if
                not settled within 30 days.
              </li>
              <li>
                All cheques to be issued on <b>RAM POTTERY LTD</b>.
              </li>
              <li>
                Bank transfer to <b>000 44 570 46 59</b> MCB Bank
              </li>
            </ul>
          </div>

          <div className="rpdoc-totals">
            <div className="rpdoc-trow">
              <span>SUB TOTAL</span>
              <span className="rpdoc-money">{money(totals.subtotal)}</span>
            </div>

            <div className="rpdoc-trow">
              <span>{vatLabel}</span>
              <span className="rpdoc-money">{money(totals.vat_amount)}</span>
            </div>

            {/* ✅ DISCOUNT — ONLY IF CUSTOMER DISCOUNT APPLIED (invoice snapshot) */}
            {hasDiscount ? (
              <div className="rpdoc-trow rpdoc-trow-discount">
                <span>
                  DISCOUNT
                  {Number(totals.discount_percent || 0) > 0
                    ? ` (${Number(totals.discount_percent || 0).toFixed(0)}%)`
                    : ""}
                </span>
                <span className="rpdoc-money">- {money(totals.discount_amount)}</span>
              </div>
            ) : null}

            <div className="rpdoc-trow rpdoc-trow-strong">
              <span>TOTAL AMOUNT</span>
              <span className="rpdoc-money">{money(totals.total_amount)}</span>
            </div>

            <div className="rpdoc-trow">
              <span>PREVIOUS BALANCE</span>
              <span className="rpdoc-money">{money(totals.previous_balance)}</span>
            </div>

            <div className="rpdoc-trow rpdoc-trow-strong">
              <span>GROSS TOTAL</span>
              <span className="rpdoc-money">{money(gross)}</span>
            </div>

            <div className="rpdoc-trow">
              <span>AMOUNT PAID</span>
              <span className="rpdoc-money">{money(totals.amount_paid)}</span>
            </div>

            <div className="rpdoc-trow rpdoc-trow-strong">
              <span>BALANCE REMAINING</span>
              <span className="rpdoc-money">{money(totals.balance_remaining)}</span>
            </div>
          </div>
        </div>
        {/* ✅ IMPORTANT: rpdoc-bottomgrid is CLOSED HERE */}

        {/* SIGNATURES */}
        <div className="rpdoc-sign">
          <div className="rpdoc-signcol">
            <div className="rpdoc-line" />
            <div>Signature</div>
            <div>Prepared by: {preparedBy || ""}</div>
          </div>

          <div className="rpdoc-signcol">
            <div className="rpdoc-line" />
            <div>Signature</div>
            <div>Delivered by: {deliveredBy || ""}</div>
          </div>

          <div className="rpdoc-signcol">
            <div className="rpdoc-line" />
            <div>Customer Signature</div>
            <div>Customer Name: __________________</div>
            <div>
              <i>Please verify before sign</i>
            </div>
          </div>
        </div>

        <div className="rpdoc-footerbar">{footerThanksText}</div>
      </div>

      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 10mm;
        }

        .rpdoc-table2 thead {
          display: table-header-group;
        }
        .rpdoc-table2 tfoot {
          display: table-footer-group;
        }

        .rpdoc-table2 tr {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .rpdoc-wrap {
            background: transparent !important;
          }

          .rpdoc-logo--big img {
            width: 56mm !important;
            height: auto !important;
          }
        }

        .rpdoc-row-split--left {
          display: flex;
          justify-content: flex-start;
          gap: 18px;
          flex-wrap: wrap;
        }
        .rpdoc-row-split--left .rpdoc-pair {
          display: inline-flex;
          gap: 6px;
          align-items: baseline;
        }

        .rpdoc-trow-discount {
          color: #8a0000;
          font-weight: 700;
        }

        .rpdoc-trow-strong {
          font-weight: 900;
          border-top: 1px solid #000;
          margin-top: 4px;
          padding-top: 4px;
        }

        .rpdoc-row-grid {
          display: grid;
          grid-template-columns: 42mm 1fr;
          gap: 6px;
          align-items: baseline;
        }
      `}</style>
    </div>
  );
}
