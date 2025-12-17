import React from "react";

type Party = {
  name?: string | null;
  address?: string | null;
  phone?: string | null;
  brn?: string | null;
  vat_no?: string | null;
  customer_code?: string | null;
};

export type DocLine = {
  sn: number;
  item_code: string;
  box: number | null;
  unit_per_box: number | null;
  total_qty: number | null;
  description: string;
  unit_excl: number;
  vat: number;
  unit_incl: number;
  line_total: number;
};

type Props = {
  docType: "VAT INVOICE" | "CREDIT NOTE";
  docNoLabel: string; // "INVOICE NO" / "CREDIT NOTE NO"
  docNoValue: string;
  dateValue: string;
  poNo?: string | null;

  // Company block (you can hardcode)
  companyBrn: string;
  companyVat: string;

  salesRep?: string | null;
  salesRepPhone?: string | null;

  customer: Party;

  lines: DocLine[];

  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  previousBalance?: number;
  grossTotal?: number;
  amountPaid?: number;
  balanceRemaining?: number;

  preparedBy?: string | null;
  deliveredBy?: string | null;

  footerText?: string;
};

export default function RamPotteryDoc(p: Props) {
  const money = (n: any) => Number(n || 0).toFixed(2);

  return (
    <div className="rp-doc-wrap">
      <div className="rp-doc">
        <div className="rp-sheet">
          {/* Header */}
          <div className="rp-top">
            <div className="rp-logo-box">
              {/* Use your logo path in /public */}
              <img className="rp-logo-img" src="/images/logo/logo.png" alt="Ram Pottery" />
            </div>

            <div>
              <div className="rp-brand">RAM POTTERY LTD</div>
              <div className="rp-subline">MANUFACTURER &amp; IMPORTER OF QUALITY CLAY PRODUCTS AND OTHER RELIGIOUS ITEMS</div>
              <div className="rp-addr">Robert Kennedy Street, Reunion Maurel, Petit Raffray - Mauritius</div>
              <div className="rp-contacts">
                <b>Tel:</b> +230 57788884 +230 58060268 +230 52522844
              </div>
              <div className="rp-contacts">
                <b>Email:</b> info@rampottery.com &nbsp; <b>Web:</b> www.rampottery.com
              </div>

              <div className="rp-doc-title">{p.docType}</div>
            </div>
          </div>

          {/* Customer + Doc details boxes */}
          <div className="rp-row2">
            <div className="rp-box">
              <div className="rp-box-h">CUSTOMER DETAILS</div>
              <div className="rp-box-body">
                <div className="rp-kv">
                  <b>Name:</b>
                  <div className="rp-val">{p.customer?.name || ""}</div>
                </div>
                <div className="rp-kv">
                  <b>ADDRESS:</b>
                  <div className="rp-val">{p.customer?.address || ""}</div>
                </div>
                <div className="rp-kv">
                  <b>Tel:</b>
                  <div className="rp-val">{p.customer?.phone || ""}</div>
                </div>
                <div className="rp-kv">
                  <b>BRN:</b>
                  <div className="rp-val">{p.customer?.brn || ""}</div>
                </div>
                <div className="rp-kv">
                  <b>VAT No:</b>
                  <div className="rp-val">{p.customer?.vat_no || ""}</div>
                </div>
                <div className="rp-kv">
                  <b>CUSTOMER CODE:</b>
                  <div className="rp-val">{p.customer?.customer_code || ""}</div>
                </div>
              </div>
            </div>

            <div className="rp-box">
              <div className="rp-right-h">
                BRN: {p.companyBrn} / VAT:{p.companyVat}
              </div>
              <div className="rp-box-body">
                <div className="rp-kv">
                  <b>{p.docNoLabel}:</b>
                  <div className="rp-val">{p.docNoValue}</div>
                </div>
                <div className="rp-kv">
                  <b>DATE:</b>
                  <div className="rp-val">{p.dateValue}</div>
                </div>
                <div className="rp-kv">
                  <b>PURCHASE ORDER NO:</b>
                  <div className="rp-val">{p.poNo || ""}</div>
                </div>
                <div className="rp-kv">
                  <b>SALES REP:</b>
                  <div className="rp-val">
                    {p.salesRep || ""} &nbsp;&nbsp; <b style={{ color: "var(--rp-red)" }}>Tel:</b>{" "}
                    {p.salesRepPhone || ""}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="rp-items">
            <table className="rp-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>SN</th>
                  <th style={{ width: 90 }}>ITEM CODE</th>
                  <th style={{ width: 55 }}>BOX</th>
                  <th style={{ width: 80 }}>UNIT<br />PER BOX</th>
                  <th style={{ width: 90 }}>TOTAL QTY</th>
                  <th>DESCRIPTION</th>
                  <th style={{ width: 95 }}>UNIT PRICE<br />(Excl Vat)</th>
                  <th style={{ width: 70 }}>VAT</th>
                  <th style={{ width: 95 }}>UNIT PRICE<br />(Incl Vat)</th>
                  <th style={{ width: 110 }}>TOTAL AMOUNT<br />(Incl Vat)</th>
                </tr>
              </thead>
              <tbody>
                {p.lines.map((ln) => (
                  <tr key={ln.sn}>
                    <td className="center">{ln.sn}</td>
                    <td className="center">{ln.item_code}</td>
                    <td className="center">{ln.box ?? ""}</td>
                    <td className="center">{ln.unit_per_box ?? ""}</td>
                    <td className="center">{ln.total_qty ?? ""}</td>
                    <td>{ln.description}</td>
                    <td className="right">{money(ln.unit_excl)}</td>
                    <td className="right">{money(ln.vat)}</td>
                    <td className="right">{money(ln.unit_incl)}</td>
                    <td className="right">{money(ln.line_total)}</td>
                  </tr>
                ))}

                {/* pad empty rows for same height (optional) */}
                {Array.from({ length: Math.max(0, 10 - p.lines.length) }).map((_, i) => (
                  <tr key={`pad-${i}`}>
                    <td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes + totals */}
          <div className="rp-bottom">
            <div className="rp-notes">
              <div className="rp-notes-title">Note:</div>
              <ul>
                <li>Goods once sold cannot be returned or exchanged.</li>
                <li>For any other manufacturing defects, must provide this invoice for a refund or exchange.</li>
                <li>Customer must verify that the quantity of goods conforms with their invoice; otherwise, we will not be responsible after delivery</li>
                <li>Interest of 1% above the bank rate will be charged on sum due if not settled within 30 days.</li>
                <li>All cheques to be issued on <b>RAM POTTERY LTD</b>.</li>
                <li>Bank transfer to <b>000 44 570 46 59 MCB Bank</b></li>
              </ul>
            </div>

            <div className="rp-totals">
              <div className="rp-totals-row rp-totals-muted">
                <div className="rp-totals-l">SUB TOTAL</div>
                <div className="rp-totals-r">{money(p.subtotal)}</div>
              </div>
              <div className="rp-totals-row rp-totals-muted">
                <div className="rp-totals-l">VAT 15%</div>
                <div className="rp-totals-r">{money(p.vatAmount)}</div>
              </div>
              <div className="rp-totals-row">
                <div className="rp-totals-l">TOTAL AMOUNT</div>
                <div className="rp-totals-r">{money(p.totalAmount)}</div>
              </div>

              <div className="rp-totals-row rp-totals-muted">
                <div className="rp-totals-l">PREVIOUS BALANCE</div>
                <div className="rp-totals-r">{money(p.previousBalance)}</div>
              </div>
              <div className="rp-totals-row">
                <div className="rp-totals-l">GROSS TOTAL</div>
                <div className="rp-totals-r">{money(p.grossTotal)}</div>
              </div>
              <div className="rp-totals-row rp-totals-muted">
                <div className="rp-totals-l">AMOUNT PAID</div>
                <div className="rp-totals-r">{money(p.amountPaid)}</div>
              </div>
              <div className="rp-totals-row">
                <div className="rp-totals-l">BALANCE REMAINING</div>
                <div className="rp-totals-r">{money(p.balanceRemaining)}</div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="rp-sign">
            <div className="rp-sign-grid">
              <div>
                <div className="rp-sign-line"></div>
                <div className="rp-sign-cap">Signature</div>
                <div className="rp-sign-small">Prepared by: {p.preparedBy || ""}</div>
              </div>
              <div>
                <div className="rp-sign-line"></div>
                <div className="rp-sign-cap">Signature</div>
                <div className="rp-sign-small">Delivered by: {p.deliveredBy || ""}</div>
              </div>
              <div>
                <div className="rp-sign-line"></div>
                <div className="rp-sign-cap">Customer Signature</div>
                <div className="rp-sign-small">
                  Customer Name: <i>Please verify before sign</i>
                </div>
              </div>
            </div>

            <div className="rp-footerbar">
              {p.footerText || "We thank you for your purchase and look forward to being of service to you again"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
