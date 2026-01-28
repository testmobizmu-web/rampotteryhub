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
  vatPercentLabel?: string;
  vat_amount?: number | null;
  total_amount?: number | null;
  previous_balance?: number | null;
  amount_paid?: number | null;
  balance_remaining?: number | null;

  discount_percent?: number | null;
  discount_amount?: number | null;
};

export type RamPotteryDocItem = {
  sn: number;
  item_code?: string;
  uom?: string; // BOX / PCS
  box_qty?: number; // box qty or pcs qty
  units_per_box?: number; // unit per box
  total_qty?: number; // total qty
  description?: string;
  unit_price_excl_vat?: number;
  unit_vat?: number;
  unit_price_incl_vat?: number;
  line_total?: number;
};

export type RamPotteryDocProps = {
  variant: "INVOICE" | "CREDIT_NOTE";

  docNoLabel: string;
  docNoValue: string;

  dateLabel: string;
  dateValue: string;

  purchaseOrderLabel?: string;
  purchaseOrderValue?: string;

  salesRepName?: string;
  salesRepPhone?: string;

  customer: Party;
  company: DocCompany;

  items: RamPotteryDocItem[];

  totals: Totals;

  preparedBy?: string | null;
  deliveredBy?: string | null;

};

function n2(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

function fmtMoney(v: any) {
  const x = n2(v);
  // Always 2dp like your screenshot
  return x.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function RamPotteryDoc(props: RamPotteryDocProps) {
  const {
    variant,
    docNoLabel,
    docNoValue,
    dateLabel,
    dateValue,
    purchaseOrderLabel,
    purchaseOrderValue,
    salesRepName,
    salesRepPhone,
    customer,
    company,
    items,
    totals,
    preparedBy,
    deliveredBy,
  } = props;

  const docTitle = variant === "CREDIT_NOTE" ? "VAT CREDIT NOTE" : "VAT INVOICE";

  const showPO = Boolean(purchaseOrderLabel);
  const poVal = purchaseOrderValue || "";

  const brn = company?.brn || "";
  const vat = company?.vat_no || "";

  return (
    <div className="rpdoc-page">
      {/* ===== HEADER (logo left, title center) ===== */}
      <div className="rpdoc-headerTop">
        <div className="rpdoc-headerTop-left">
          <Image
            className="rpdoc-logoTop"
            src="/images/logo/logo.png"
            alt="Ram Pottery Logo"
            width={800}
            height={300}
            priority
          />
        </div>

        <div className="rpdoc-headerTop-center">
          <h1 className="rpdoc-titleOneRow">RAM POTTERY LTD</h1>

          <div className="rpdoc-subTwoRows">
            <div>MANUFACTURER &amp; IMPORTER OF QUALITY CLAY</div>
            <div>PRODUCTS AND OTHER RELIGIOUS ITEMS</div>
          </div>

          <div className="rpdoc-addrTwoRows">
            <div>Robert Kennedy Street, Reunion Maurel,</div>
            <div>Petit Raffray - Mauritius</div>
          </div>

          <div className="rpdoc-phonesOneRow">
            <span>Tel: +230 57788884 +230 58060268 +230 52522844</span>
          </div>

          <div className="rpdoc-mailWebOneRow">
            <span>Email: info@rampottery.com</span>
            <span className="rpdoc-gap" />
            <span>Web: www.rampottery.com</span>
          </div>

          <div className="rpdoc-docOneRow">{docTitle}</div>
        </div>

        <div className="rpdoc-headerTop-right" />
      </div>

      {/* ===== TOP BOXES ===== */}
      <div className="rpdoc-topgrid">
        {/* CUSTOMER DETAILS */}
        <div className="rpdoc-box">
          <div className="rpdoc-box-title">CUSTOMER DETAILS</div>
          <div className="rpdoc-box-body">
            <div className="rpdoc-row">
              <div className="k">Name:</div>
              <div className="v">{customer?.name || ""}</div>
            </div>
            <div className="rpdoc-row">
              <div className="k">ADDRESS:</div>
              <div className="v">{customer?.address || ""}</div>
            </div>
            <div className="rpdoc-row">
              <div className="k">Tel:</div>
              <div className="v">{customer?.phone || ""}</div>
            </div>

            <div className="rpdoc-row-split">
              <div className="rpdoc-pair">
                <div className="k">BRN:</div>
                <div className="v">{customer?.brn || ""}</div>
              </div>
              <div className="rpdoc-pair">
                <div className="k">VAT No:</div>
                <div className="v">{customer?.vat_no || ""}</div>
              </div>
            </div>

            <div className="rpdoc-row">
              <div className="k">CUSTOMER CODE:</div>
              <div className="v">{customer?.customer_code || ""}</div>
            </div>
          </div>
        </div>

        {/* BRN/VAT + INVOICE DETAILS */}
        <div className="rpdoc-box">
          <div className="rpdoc-box-title">
            BRN:&nbsp;{brn}&nbsp;|&nbsp;VAT:{vat}
          </div>
          <div className="rpdoc-box-body">
            <div className="rpdoc-row">
              <div className="k">{docNoLabel}</div>
              <div className="v">{docNoValue}</div>
            </div>
            <div className="rpdoc-row">
              <div className="k">{dateLabel}</div>
              <div className="v">{dateValue}</div>
            </div>

            {showPO ? (
              <div className="rpdoc-row">
                <div className="k">{purchaseOrderLabel}</div>
                <div className="v">{poVal}</div>
              </div>
            ) : null}

            <div className="rpdoc-row">
              <div className="k">SALES REP:</div>
              <div className="v">
                {salesRepName || ""}
                {salesRepPhone ? (
                  <>
                    <span className="rpdoc-gap" />
                    <span className="rpdoc-red">Tel: {salesRepPhone}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ITEMS TABLE ===== */}
      <table className="rpdoc-table2">
        <colgroup>
          <col style={{ width: "4%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "29%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "8%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>SN</th>
            <th>ITEM CODE</th>
            <th>BOX</th>
            <th>UNIT PER BOX</th>
            <th>TOTAL QTY</th>
            <th>DESCRIPTION</th>
            <th>UNIT PRICE<br />(EXCL VAT)</th>
            <th>VAT</th>
            <th>UNIT PRICE<br />(INCL VAT)</th>
            <th>TOTAL AMOUNT<br />(INCL VAT)</th>
          </tr>
        </thead>
        <tbody>
          {(items?.length ? items : []).map((it) => {
            const uom = (it.uom || "BOX").toUpperCase();
            const boxQty = n2(it.box_qty);
            const upb = n2(it.units_per_box);
            const totalQty = n2(it.total_qty);

            return (
              <tr key={it.sn}>
                <td className="c">{it.sn}</td>
                <td className="c">{it.item_code || ""}</td>
                <td className="c">{uom}</td>
                <td className="c">{upb ? String(upb) : ""}</td>
                <td className="c">{totalQty ? String(totalQty) : String(boxQty || 0)}</td>
                <td className="l desc">{it.description || ""}</td>
                <td className="r">{fmtMoney(it.unit_price_excl_vat)}</td>
                <td className="r">{fmtMoney(it.unit_vat)}</td>
                <td className="r">{fmtMoney(it.unit_price_incl_vat)}</td>
                <td className="r">{fmtMoney(it.line_total)}</td>
              </tr>
            );
          })}

          {/* If you want fixed height like the screenshot even with few lines */}
          {items.length < 6
            ? Array.from({ length: 6 - items.length }).map((_, i) => (
                <tr key={`blank-${i}`}>
                  <td className="c">&nbsp;</td>
                  <td className="c">&nbsp;</td>
                  <td className="c">&nbsp;</td>
                  <td className="c">&nbsp;</td>
                  <td className="c">&nbsp;</td>
                  <td className="l desc">&nbsp;</td>
                  <td className="r">&nbsp;</td>
                  <td className="r">&nbsp;</td>
                  <td className="r">&nbsp;</td>
                  <td className="r">&nbsp;</td>
                </tr>
              ))
            : null}
        </tbody>
      </table>

      {/* ===== NOTES + TOTALS ===== */}
      <div className="rpdoc-bottomgrid">
        <div className="rpdoc-notes">
          <div className="rpdoc-notes-title">Note:</div>
          <ul>
            <li>Goods once sold cannot be returned or exchanged.</li>
            <li>For any other manufacturing defects, must provide this invoice for a refund or exchange.</li>
            <li>
              Customer must verify that the quantity of goods conforms with their invoice; otherwise, we will not be
              responsible after delivery
            </li>
            <li>
              Interest of <span className="redStrong">1%</span> above the bank rate will be charged on sum due if not
              settled within <span className="redStrong">30 days</span>.
            </li>
            <li>All cheques to be issued on RAM POTTERY LTD.</li>
            <li>Bank transfer to: 000 44 570 46 59 MCB Bank</li>
          </ul>
        </div>

        <div className="rpdoc-totals">
          <div className="trow">
            <div>SUB TOTAL</div>
            <div className="money">{fmtMoney(totals?.subtotal)}</div>
          </div>
          <div className="trow">
            <div>{(totals?.vatPercentLabel || "VAT").toUpperCase()}</div>
            <div className="money">{fmtMoney(totals?.vat_amount)}</div>
          </div>
          <div className="trow">
            <div>TOTAL AMOUNT</div>
            <div className="money">{fmtMoney(totals?.total_amount)}</div>
          </div>
          <div className="trow">
            <div>PREVIOUS BALANCE</div>
            <div className="money">{fmtMoney(totals?.previous_balance)}</div>
          </div>
          <div className="trow">
            <div>GROSS TOTAL</div>
            <div className="money">{fmtMoney(totals?.balance_remaining ?? totals?.total_amount)}</div>
          </div>
          <div className="trow">
            <div>AMOUNT PAID</div>
            <div className="money">{fmtMoney(totals?.amount_paid)}</div>
          </div>
          <div className="trow">
            <div>BALANCE REMAINING</div>
            <div className="money">{fmtMoney(totals?.balance_remaining)}</div>
          </div>
        </div>
      </div>

      {/* ===== SIGNATURES ===== */}
      <div className="rpdoc-sign">
        <div className="signcol">
          <div className="line" />
          <div className="label">Signature</div>
          <div className="meta">Prepared by: {preparedBy || ""}</div>
        </div>

        <div className="signcol">
          <div className="line" />
          <div className="label">Signature</div>
          <div className="meta">Delivered by: {deliveredBy || ""}</div>
        </div>

        <div className="signcol">
          <div className="line" />
          <div className="label">Customer Signature</div>
          <div className="meta">
            Customer Name: __________________
            <br />
            <i>Please verify before sign</i>
          </div>
        </div>
      </div>

      {/* ✅ IMPORTANT: keep the same bottom spacing as screenshot, but NO red thank-you bar */}
      <div className="rpdoc-footerSpace" />
    </div>
  );
}
