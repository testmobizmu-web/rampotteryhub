"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type InvoiceItem = {
  id: number;
  productId: string;
  itemCode: string;
  box: number;
  unitPerBox: number;
  totalQty: number;
  description: string;
  unitPriceExcl: number;
  vatAmount: number;
  unitPriceIncl: number;
  totalAmount: number;
};

export default function NewInvoicePage() {
  const router = useRouter();

  // --------- HEADER / META STATE ---------
  const [customerId, setCustomerId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [purchaseOrderNo, setPurchaseOrderNo] = useState("");
  const [salesRep, setSalesRep] = useState("Mr Koushal");

  // --------- TOTALS & BALANCE STATE ---------
  const [discountPercent, setDiscountPercent] = useState(0);
  const [previousBalance, setPreviousBalance] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);

  // --------- ITEMS STATE ---------
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 1,
      productId: "",
      itemCode: "",
      box: 0,
      unitPerBox: 0,
      totalQty: 0,
      description: "",
      unitPriceExcl: 0,
      vatAmount: 0,
      unitPriceIncl: 0,
      totalAmount: 0,
    },
  ]);

  // --------- ITEM EDITING ---------
  const handleItemChange = (
    id: number,
    field: keyof InvoiceItem,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const updated: InvoiceItem = {
          ...row,
          [field]:
            field === "description" ||
            field === "productId" ||
            field === "itemCode"
              ? value
              : Number(value) || 0,
        };

        // Recalculate derived fields
        const qty = updated.totalQty;
        const unitExcl = updated.unitPriceExcl;
        const vatRate = 0.15; // 15%

        updated.vatAmount = +(unitExcl * vatRate).toFixed(2);
        updated.unitPriceIncl = +(unitExcl + updated.vatAmount).toFixed(2);
        updated.totalAmount = +(qty * updated.unitPriceIncl).toFixed(2);

        return updated;
      })
    );
  };

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        productId: "",
        itemCode: "",
        box: 0,
        unitPerBox: 0,
        totalQty: 0,
        description: "",
        unitPriceExcl: 0,
        vatAmount: 0,
        unitPriceIncl: 0,
        totalAmount: 0,
      },
    ]);
  };

  // --------- TOTALS (DERIVED) ---------
  const subTotal = items.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  const discountAmount = +(subTotal * (discountPercent / 100)).toFixed(2);
  const totalAfterDiscount = +(subTotal - discountAmount).toFixed(2);
  const vatTotal = +(totalAfterDiscount * 0.15).toFixed(2);
  const totalAmount = +(totalAfterDiscount + vatTotal).toFixed(2);
  const grossTotal = totalAmount;
  const balanceRemaining = +(previousBalance + grossTotal - amountPaid).toFixed(
    2
  );

  // --------- SAVE HANDLER ---------
  const handleSave = async () => {
    try {
      if (!customerId) {
        alert("Please select a customer before saving.");
        return;
      }

      if (!invoiceDate) {
        alert("Please select an invoice date.");
        return;
      }

      // Clean / validate items
      const cleanItems = items.filter(
        (row) =>
          row.productId &&
          row.totalQty > 0 &&
          row.unitPriceExcl >= 0
      );

      if (!cleanItems.length) {
        alert("Please add at least one item.");
        return;
      }

      // Format items to match invoice_items table
      const formattedItems = cleanItems.map((row) => ({
        product_id: Number(row.productId) || null,
        box_qty: row.box || 0,
        units_per_box: row.unitPerBox || 0,
        total_qty: row.totalQty || 0,
        unit_price_excl_vat: row.unitPriceExcl || 0,
        unit_vat: row.vatAmount || 0,
      }));

      // Payload expected by /api/invoices/create
      const payload = {
        customerId,
        invoiceDate,
        purchaseOrderNo,
        salesRep,

        subtotal: subTotal,
        discountPercent,
        discountAmount,
        vatAmount: vatTotal,
        totalAmount,
        previousBalance,
        amountPaid,
        grossTotal,
        balanceRemaining,

        items: formattedItems,
      };

      const res = await fetch("/api/invoices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save invoice");
      }

      alert(`Invoice ${json.invoiceNumber} saved successfully!`);
      router.push(`/invoices/${json.invoiceId}`);
    } catch (err: any) {
      console.error("Save invoice error:", err);
      alert(err.message || "Unexpected error while saving invoice");
    }
  };

  // --------- RENDER ---------
  return (
    <div className="rp-app rp-invoice-page">
      <aside className="rp-sidebar">
        <div className="rp-sidebar-logo">
          <Image
            src="/images/logo/logo.png"
            alt="Ram Pottery Logo"
            width={34}
            height={34}
          />
          <div>
            <div className="rp-sidebar-logo-title">Ram Pottery Ltd</div>
            <div className="rp-sidebar-logo-sub">
              Online Accounting &amp; Stock Manager
            </div>
          </div>
        </div>
        <button
          className="rp-nav-item"
          onClick={() => router.push("/")}
          style={{ marginTop: 16 }}
        >
          ← Back to Dashboard
        </button>
      </aside>

      <main className="rp-page-main rp-invoice-main">
        <div className="rp-invoice-paper">
          {/* TOP HEADER */}
          <header className="rp-invoice-header">
            <div className="rp-invoice-logo-block">
              <Image
                src="/images/logo/logo.png"
                alt="Ram Pottery Logo"
                width={70}
                height={70}
              />
              <div className="rp-invoice-logo-text">
                <h1>RAM POTTERY LTD</h1>
                <p>MANUFACTURER &amp; IMPORTER OF QUALITY CLAY</p>
                <p>PRODUCTS AND OTHER RELIGIOUS ITEMS</p>
                <p>
                  Robert Kennedy Street, Reunion Maurel, Petit Raffray - Mauritius
                </p>
                <p>
                  Tel: +230 57788884 +230 58060268 +230 52522844 &nbsp; Email:
                  info@rampottery.com &nbsp; Web: www.rampottery.com
                </p>
              </div>
            </div>
            <div className="rp-invoice-title-row">
              <div className="rp-invoice-title">VAT INVOICE</div>
            </div>
          </header>

          {/* BRN / VAT STRIP */}
          <div className="rp-invoice-brn-row">
            <div className="rp-invoice-brn-cell">
              BRN: C17144377 | VAT: 123456789
            </div>
          </div>

          {/* CUSTOMER + ACCOUNT DETAILS */}
          <section className="rp-invoice-top-grid">
            <div className="rp-invoice-customer-box">
              <div className="rp-invoice-section-heading red">
                CUSTOMER DETAILS
              </div>
              <div className="rp-invoice-field-row">
                <label>Customer:</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">Select customer…</option>
                  {/* TODO: map your real customers here */}
                </select>
              </div>
              <div className="rp-invoice-field-row">
                <label>Name:</label>
                <input disabled value="(auto from customer)" />
              </div>
              <div className="rp-invoice-field-row">
                <label>Address:</label>
                <textarea rows={2} disabled value="(customer address)" />
              </div>
              <div className="rp-invoice-field-row">
                <label>Tel:</label>
                <input disabled value="(customer phone)" />
              </div>
              <div className="rp-invoice-field-row">
                <label>BRN:</label>
                <input disabled value="-" />
                <label>VAT No:</label>
                <input disabled value="-" />
              </div>
              <div className="rp-invoice-field-row">
                <label>Customer Code:</label>
                <input disabled value="(auto)" />
              </div>
            </div>

            <div className="rp-invoice-account-box">
              <div className="rp-invoice-section-heading red">
                ACCOUNT / INVOICE DETAILS
              </div>
              <div className="rp-invoice-field-row">
                <label>Invoice No:</label>
                <input disabled value="(auto on save – RP-xxxx)" />
              </div>
              <div className="rp-invoice-field-row">
                <label>Date:</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
              <div className="rp-invoice-field-row">
                <label>Purchase Order No:</label>
                <input
                  value={purchaseOrderNo}
                  onChange={(e) => setPurchaseOrderNo(e.target.value)}
                />
              </div>
              <div className="rp-invoice-field-row">
                <label>Sales Rep:</label>
                <input
                  value={salesRep}
                  onChange={(e) => setSalesRep(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* ITEMS TABLE */}
          <section className="rp-invoice-items">
            <table>
              <thead>
                <tr>
                  <th>SN</th>
                  <th>ITEM CODE</th>
                  <th>BOX</th>
                  <th>UNIT PER BOX</th>
                  <th>TOTAL QTY</th>
                  <th>DESCRIPTION</th>
                  <th>UNIT PRICE (Excl Vat)</th>
                  <th>VAT</th>
                  <th>UNIT PRICE (Incl Vat)</th>
                  <th>TOTAL AMOUNT (Incl Vat)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, idx) => (
                  <tr key={row.id}>
                    <td>{idx + 1}</td>
                    <td>
                      <input
                        value={row.itemCode}
                        onChange={(e) =>
                          handleItemChange(row.id, "itemCode", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.box}
                        onChange={(e) =>
                          handleItemChange(row.id, "box", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.unitPerBox}
                        onChange={(e) =>
                          handleItemChange(row.id, "unitPerBox", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.totalQty}
                        onChange={(e) =>
                          handleItemChange(row.id, "totalQty", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        value={row.description}
                        onChange={(e) =>
                          handleItemChange(
                            row.id,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.unitPriceExcl}
                        onChange={(e) =>
                          handleItemChange(
                            row.id,
                            "unitPriceExcl",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td>
                      <input disabled value={row.vatAmount.toFixed(2)} />
                    </td>
                    <td>
                      <input disabled value={row.unitPriceIncl.toFixed(2)} />
                    </td>
                    <td>
                      <input disabled value={row.totalAmount.toFixed(2)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button className="rp-invoice-add-row" type="button" onClick={addRow}>
              + Add Item Row
            </button>
          </section>

          {/* NOTES + TOTALS */}
          <section className="rp-invoice-bottom-grid">
            <div className="rp-invoice-notes">
              <div className="rp-invoice-notes-title">Note:</div>
              <ul>
                <li>Goods once sold cannot be returned or exchanged.</li>
                <li>
                  For any other manufacturing defects, must provide this invoice
                  for a refund or exchange.
                </li>
                <li>
                  Customer must verify that the quantity of goods conforms with
                  their invoice; otherwise, we will not be responsible after
                  delivery.
                </li>
                <li>
                  Interest of 1% above the bank rate will be charged on sum due
                  if not settled within 30 days.
                </li>
                <li>All cheques to be issued on RAM POTTERY LTD.</li>
                <li>
                  Bank transfer to <strong>000 44 570 46 59 MCB Bank</strong>
                </li>
              </ul>
            </div>

            <div className="rp-invoice-totals">
              <div className="rp-invoice-field-row">
                <label>Discount %</label>
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) =>
                    setDiscountPercent(Number(e.target.value) || 0)
                  }
                />
              </div>
              <div className="rp-invoice-field-row">
                <label>Discount Amount (Rs)</label>
                <input disabled value={discountAmount.toFixed(2)} />
              </div>
              <div className="rp-invoice-field-row">
                <label>SUB TOTAL</label>
                <input disabled value={subTotal.toFixed(2)} />
              </div>
              <div className="rp-invoice-field-row">
                <label>VAT 15%</label>
                <input disabled value={vatTotal.toFixed(2)} />
              </div>
              <div className="rp-invoice-field-row">
                <label>TOTAL AMOUNT</label>
                <input disabled value={totalAmount.toFixed(2)} />
              </div>
              <div className="rp-invoice-field-row">
                <label>PREVIOUS BALANCE</label>
                <input
                  type="number"
                  value={previousBalance}
                  onChange={(e) =>
                    setPreviousBalance(Number(e.target.value) || 0)
                  }
                />
              </div>
              <div className="rp-invoice-field-row">
                <label>GROSS TOTAL</label>
                <input disabled value={grossTotal.toFixed(2)} />
              </div>
              <div className="rp-invoice-field-row">
                <label>AMOUNT PAID</label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) =>
                    setAmountPaid(Number(e.target.value) || 0)
                  }
                />
              </div>
              <div className="rp-invoice-field-row">
                <label>BALANCE REMAINING</label>
                <input disabled value={balanceRemaining.toFixed(2)} />
              </div>
            </div>
          </section>

          {/* SIGNATURES + FOOTLINE */}
          <section className="rp-invoice-signatures">
            <div>
              <div className="sig-line" />
              <div className="sig-label">Signature – Prepared by: Manish</div>
            </div>
            <div>
              <div className="sig-line" />
              <div className="sig-label">Signature – Delivered by:</div>
            </div>
            <div>
              <div className="sig-line" />
              <div className="sig-label">
                Customer Signature – Customer Name:
              </div>
            </div>
          </section>

          <div className="rp-invoice-footer-bar">
            We thank you for your purchase and look forward to being of service
            to you again
          </div>

          {/* ACTION BUTTONS */}
          <div className="rp-invoice-actions">
            <button
              type="button"
              className="btn-soft"
              onClick={() => router.push("/invoices")}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary-red"
              onClick={handleSave}
            >
              Save Invoice
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

