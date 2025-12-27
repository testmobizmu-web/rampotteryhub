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
};

export type RamPotteryDocProps = {
  variant: "INVOICE" | "CREDIT_NOTE";
  docNoLabel: string; // "INVOICE NO:" / "CREDIT NOTE NO:"
  docNoValue: string; // RP-0001 / CN-0001 etc
  dateLabel: string; // "DATE:"
  dateValue: string; // YYYY-MM-DD or formatted string
  purchaseOrderLabel?: string; // "PURCHASE ORDER NO:"
  purchaseOrderValue?: string | null;

  salesRepName?: string | null;
  salesRepPhone?: string | null;

  customer: Party;
  company?: DocCompany;

  tableHeaderRightTitle?: string; // "VAT INVOICE" / "CREDIT NOTE"
  items: Array<{
    sn: number;
    item_code?: string | null;
    box_qty?: number | null;
    units_per_box?: number | null;
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
  return v.toFixed(2);
}

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
  const addrLine = "Robert Kennedy Street, Reunion Maurel, Petit Raffray - Mauritius";

  const vatLabel = totals.vatPercentLabel || "VAT 15%";

  const brn = (company?.brn || "").trim();
  const vatNo = (company?.vat_no || "").trim();

  const repName = (salesRepName || "").trim();
  const repPhone = (salesRepPhone || "").trim();

  return (
    <div className="rpdoc-wrap">
      <div className="rpdoc-page">
        {/* Header */}
        <div className="rpdoc-header">
          <div className="rpdoc-logo">
            <Image
              src="/images/logo/logo.png"
              alt="Ram Pottery Logo"
              width={140}
              height={140}
              priority
            />
          </div>

          <div className="rpdoc-head-center">
            <div className="rpdoc-title">{titleTop}</div>
            <div className="rpdoc-sub">{subLine1}</div>
            <div className="rpdoc-sub">{subLine2}</div>
            <div className="rpdoc-addr">{addrLine}</div>

            {/* Optional: keep as-is if you already store it somewhere */}
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
        </div>

        {/* Top boxes */}
        <div className="rpdoc-topgrid">
          {/* Customer details */}
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
              <div className="rpdoc-row rpdoc-row-split">
                <span>
                  <span className="k">BRN:</span>{" "}
                  <span className="v">{customer?.brn || ""}</span>
                </span>
                <span>
                  <span className="k">VAT No:</span>{" "}
                  <span className="v">{customer?.vat_no || ""}</span>
                </span>
              </div>
              <div className="rpdoc-row">
                <span className="k">CUSTOMER CODE:</span>
                <span className="v">{customer?.customer_code || ""}</span>
              </div>
            </div>
          </div>

          {/* Invoice details */}
          <div className="rpdoc-box">
            <div className="rpdoc-box-title rpdoc-box-title-center">
              {/* no design change: just avoid "—" */}
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

                {/* no design change: hide Tel label if empty */}
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

        {/* Items table */}
        <div className="rpdoc-table">
          <div className="rpdoc-thead">
            <div>SN</div>
            <div>ITEM CODE</div>
            <div>BOX</div>
            <div>UNIT PER BOX</div>
            <div>TOTAL QTY</div>
            <div>DESCRIPTION</div>
            <div>
              UNIT PRICE
              <br />
              (Excl Vat)
            </div>
            <div>VAT</div>
            <div>
              UNIT PRICE
              <br />
              (Incl Vat)
            </div>
            <div>
              TOTAL AMOUNT
              <br />
              (Incl Vat)
            </div>
          </div>

          <div className="rpdoc-tbody">
            {(items || []).map((it) => (
              <div className="rpdoc-tr" key={it.sn}>
                <div>{it.sn}</div>
                <div>{it.item_code || ""}</div>
                <div>{it.box_qty ?? ""}</div>
                <div>{it.units_per_box ?? ""}</div>
                <div>{it.total_qty ?? ""}</div>
                <div className="rpdoc-desc">{it.description || ""}</div>
                <div>{money(it.unit_price_excl_vat)}</div>
                <div>{money(it.unit_vat)}</div>
                <div>{money(it.unit_price_incl_vat)}</div>
                <div>{money(it.line_total)}</div>
              </div>
            ))}

            {/* Keep a minimum height like the paper template */}
            <div className="rpdoc-emptyspace" />
          </div>
        </div>

        {/* Bottom grid */}
        <div className="rpdoc-bottomgrid">
          {/* Notes */}
          <div className="rpdoc-notes">
            <div className="rpdoc-notes-title">Note:</div>
            <ul>
              <li>Goods once sold cannot be returned or exchanged.</li>
              <li>
                For any other manufacturing defects, must provide this invoice for a refund or
                exchange.
              </li>
              <li>
                Customer must verify that the quantity of goods conforms with their invoice;
                otherwise, we will not be responsible after delivery
              </li>
              <li>
                Interest of 1% above the bank rate will be charged on sum due if not settled within
                30 days.
              </li>
              <li>
                All cheques to be issued on <b>RAM POTTERY LTD</b>.
              </li>
              <li>
                Bank transfer to <b>000 44 570 46 59</b> MCB Bank
              </li>
            </ul>
          </div>

          {/* Totals */}
          <div className="rpdoc-totals">
            <div className="rpdoc-trow">
              <span>SUB TOTAL</span>
              <span>{money(totals.subtotal)}</span>
            </div>
            <div className="rpdoc-trow">
              <span>{vatLabel}</span>
              <span>{money(totals.vat_amount)}</span>
            </div>
            <div className="rpdoc-trow">
              <span>TOTAL AMOUNT</span>
              <span>{money(totals.total_amount)}</span>
            </div>
            <div className="rpdoc-trow">
              <span>PREVIOUS BALANCE</span>
              <span>{money(totals.previous_balance)}</span>
            </div>
            {/* Gross Total is computed visually (no DB column needed) */}
            <div className="rpdoc-trow">
              <span>GROSS TOTAL</span>
              <span>
                {money(Number(totals.total_amount || 0) + Number(totals.previous_balance || 0))}
              </span>
            </div>
            <div className="rpdoc-trow">
              <span>AMOUNT PAID</span>
              <span>{money(totals.amount_paid)}</span>
            </div>
            <div className="rpdoc-trow">
              <span>BALANCE REMAINING</span>
              <span>{money(totals.balance_remaining)}</span>
            </div>
          </div>
        </div>

        {/* Signatures */}
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

        {/* Footer bar */}
        <div className="rpdoc-footerbar">{footerThanksText}</div>
      </div>
    </div>
  );
}
