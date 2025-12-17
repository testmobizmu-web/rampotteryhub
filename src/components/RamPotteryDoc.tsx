// src/components/RamPotteryDoc.tsx
"use client";

import Image from "next/image";
import React from "react";

type HeaderProps = {
  docTitle: string; // "VAT INVOICE" | "CREDIT NOTE"
  statusText?: string; // "PAID" / "UNPAID" / "ISSUED"
};

type CustomerBlock = {
  customerCode?: string | null;
  name?: string | null;
  address?: string | null;
  tel?: string | null;
  brn?: string | null;
  vatNo?: string | null;
};

type RightBlockLine = { label: string; value?: string | null; extraLabel?: string; extraValue?: string | null };

type TotalsRow = { label: string; value: string };

export function RamPotteryDoc(props: {
  header: HeaderProps;
  customer: CustomerBlock;
  rightBlockTitle: string; // "INVOICE DETAILS" | "CREDIT NOTE DETAILS"
  rightLines: RightBlockLine[];
  tableHead: React.ReactNode;
  tableBody: React.ReactNode;
  totals: TotalsRow[];
  notes?: React.ReactNode;
  footerLeft?: string;   // Prepared by
  footerMiddle?: string; // Delivered by
  footerRight?: string;  // Customer signature
}) {
  const {
    header,
    customer,
    rightBlockTitle,
    rightLines,
    tableHead,
    tableBody,
    totals,
    notes,
    footerLeft = "Prepared by:",
    footerMiddle = "Delivered by:",
    footerRight = "Customer Signature",
  } = props;

  return (
    <div className="rpd-page">
      <div className="rpd-paper">
        {/* TOP HEADER */}
        <div className="rpd-top">
          <div className="rpd-top-inner">
            <div className="rpd-brand">
              <div className="rpd-logo">
                <Image src="/images/logo/logo.png" alt="Ram Pottery" width={92} height={92} />
              </div>

              <div className="rpd-brand-text">
                <div className="rpd-title">RAM POTTERY LTD</div>
                <div className="rpd-sub">MANUFACTURER &amp; IMPORTER OF QUALITY CLAY</div>
                <div className="rpd-sub">PRODUCTS AND OTHER RELIGIOUS ITEMS</div>

                <div className="rpd-line">
                  Robert Kennedy Street, Reunion Maurel, Petit Raffray - Mauritius
                </div>

                <div className="rpd-line rpd-redline">
                  Tel: +230 57788884  +230 58060268  +230 52522844
                </div>
                <div className="rpd-line rpd-redline">
                  Email: info@rampottery.com  Web: www.rampottery.com
                </div>

                <div className="rpd-docname">{header.docTitle}</div>
              </div>
            </div>
          </div>
        </div>

        {/* BRN/VAT BAR */}
        <div className="rpd-bar">
          <div className="rpd-bar-inner">
            <div className="rpd-bar-text">BRN: C17144377 | VAT: 123456789</div>
          </div>
        </div>

        {/* TWO BOXES */}
        <div className="rpd-two">
          {/* LEFT: CUSTOMER */}
          <div className="rpd-box">
            <div className="rpd-box-head">CUSTOMER DETAILS</div>
            <div className="rpd-box-body">
              <div className="rpd-row"><span className="rpd-lbl">Name:</span><span className="rpd-val">{customer.name || ""}</span></div>
              <div className="rpd-row"><span className="rpd-lbl">ADDRESS:</span><span className="rpd-val">{customer.address || ""}</span></div>
              <div className="rpd-row"><span className="rpd-lbl">Tel:</span><span className="rpd-val">{customer.tel || ""}</span></div>

              <div className="rpd-row rpd-row-split">
                <div><span className="rpd-lbl">BRN:</span> <span className="rpd-val">{customer.brn || ""}</span></div>
                <div><span className="rpd-lbl">VAT No:</span> <span className="rpd-val">{customer.vatNo || ""}</span></div>
              </div>

              <div className="rpd-row"><span className="rpd-lbl">CUSTOMER CODE:</span><span className="rpd-val">{customer.customerCode || ""}</span></div>
            </div>
          </div>

          {/* RIGHT: DOC DETAILS */}
          <div className="rpd-box">
            <div className="rpd-box-head">
              {rightBlockTitle}
              {header.statusText ? <span className="rpd-status">STATUS: {header.statusText}</span> : null}
            </div>

            <div className="rpd-box-body">
              {rightLines.map((ln, idx) => (
                <div className="rpd-row" key={idx}>
                  <span className="rpd-lbl">{ln.label}</span>
                  <span className="rpd-val">{ln.value || ""}</span>
                  {ln.extraLabel ? (
                    <span className="rpd-inline">
                      <span className="rpd-lbl" style={{ marginLeft: 16 }}>{ln.extraLabel}</span>
                      <span className="rpd-val">{ln.extraValue || ""}</span>
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="rpd-table-wrap">
          <table className="rpd-table">
            <thead>{tableHead}</thead>
            <tbody>{tableBody}</tbody>
          </table>
        </div>

        {/* BOTTOM NOTES + TOTALS */}
        <div className="rpd-bottom">
          <div className="rpd-notes">
            <div className="rpd-notes-title">Note:</div>
            {notes || (
              <ul className="rpd-notes-list">
                <li>Goods once sold cannot be returned or exchanged.</li>
                <li>Customer must verify the quantity of goods before delivery.</li>
                <li>Interest of 1% above bank rate will be charged on sum due if not settled within 30 days.</li>
                <li>All cheques to be issued on RAM POTTERY LTD.</li>
                <li>Bank transfer to 000 44 570 46 59 MCB Bank</li>
              </ul>
            )}
          </div>

          <div className="rpd-totals">
            {totals.map((t, i) => (
              <div className="rpd-tline" key={i}>
                <div className="rpd-tlbl">{t.label}</div>
                <div className="rpd-tval">{t.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SIGNATURES */}
        <div className="rpd-signs">
          <div className="rpd-sign">
            <div className="rpd-sign-line" />
            <div className="rpd-sign-lbl">Signature</div>
            <div className="rpd-sign-sub">{footerLeft}</div>
          </div>

          <div className="rpd-sign">
            <div className="rpd-sign-line" />
            <div className="rpd-sign-lbl">Signature</div>
            <div className="rpd-sign-sub">{footerMiddle}</div>
          </div>

          <div className="rpd-sign">
            <div className="rpd-sign-line" />
            <div className="rpd-sign-lbl">{footerRight}</div>
            <div className="rpd-sign-sub">Customer Name: __________________</div>
            <div className="rpd-sign-sub"><i>Please verify before sign</i></div>
          </div>
        </div>

        {/* FOOTER RED BAR */}
        <div className="rpd-footer">
          We thank you for your purchase and look forward to being of service to you again
        </div>
      </div>
    </div>
  );
}
