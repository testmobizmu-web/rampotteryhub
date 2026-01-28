"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { rpFetch } from "@/lib/rpFetch";
import RamPotteryDoc from "@/components/print/RamPotteryDoc";

type CustomerRow = {
  id: number;
  name: string;
  address: string;
  phone: string;
  whatsapp?: string;
  brn?: string;
  vat_no?: string;
  customer_code: string;
  opening_balance?: number | null;
  discount_percent?: number | null;
};

type ProductRow = {
  id: number;
  item_code: string;
  sku: string;
  name: string;
  description: string;
  units_per_box: number | null;

  // ✅ MUST MATCH API
  price_excl_vat: number;
  vat_rate: number;
};

type Uom = "BOX" | "PCS";

type InvoiceLine = {
  id: string;
  product_id: number | null;

  item_code: string;
  description: string;

  uom: Uom;
  box_qty: number; // qty input (box qty or pcs qty depending on uom)
  units_per_box: number;
  total_qty: number;

  vat_rate: number; // 0 or 15
  unit_price_excl_vat: number;
  unit_vat: number;
  unit_price_incl_vat: number;
  line_total: number;
};

/* ===========================
   ✅ Sales reps (premium picker)
   =========================== */
const SALES_REPS = [
  { name: "Mr Koushal", phone: "59193239" },
  { name: "Mr Akash", phone: "57788884" },
  { name: "Mr Manish", phone: "57788884" },
  { name: "Mr Adesh", phone: "58060268" },
] as const;

type SalesRepName = (typeof SALES_REPS)[number]["name"];

function repPhoneByName(name: string) {
  const r = SALES_REPS.find((x) => x.name === name);
  return r?.phone || "";
}

function n2(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

/** ✅ Commas + decimals only when needed (or force2 for money) */
function fmtNumber(v: any, force2 = false) {
  const x = n2(v);
  const hasDecimals = Math.abs(x % 1) > 0.000001;
  const minFrac = force2 ? 2 : hasDecimals ? 2 : 0;
  const maxFrac = 2;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: minFrac,
    maximumFractionDigits: maxFrac,
  }).format(x);
}

function money(v: any) {
  // money values always show .00
  return fmtNumber(v, true);
}

function intFmt(v: any) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    Math.trunc(n2(v))
  );
}

function uid() {
  try {
    return crypto.randomUUID();
  } catch {
    return String(Date.now()) + "-" + Math.random().toString(16).slice(2);
  }
}

function clampPct(v: any) {
  const x = n2(v);
  return Math.max(0, Math.min(100, x));
}

function recalc(row: InvoiceLine): InvoiceLine {
  const qtyInput = Math.max(0, n2(row.box_qty));
  const uom: Uom = row.uom === "PCS" ? "PCS" : "BOX";
  const upb = uom === "PCS" ? 1 : Math.max(1, Math.trunc(n2(row.units_per_box) || 1));

  const totalQty = uom === "PCS" ? Math.trunc(qtyInput) : Math.trunc(qtyInput * upb);

  const unitEx = Math.max(0, n2(row.unit_price_excl_vat)); // ✅ already discounted if needed
  const rate = row.vat_rate === 0 ? 0 : 15;

  const unitVat = unitEx * (rate / 100);
  const unitInc = unitEx + unitVat;

  return {
    ...row,
    uom,
    units_per_box: upb,
    total_qty: totalQty,
    vat_rate: rate,
    unit_vat: unitVat,
    unit_price_incl_vat: unitInc,
    line_total: totalQty * unitInc,
  };
}

function blankLine(): InvoiceLine {
  return recalc({
    id: uid(),
    product_id: null,
    item_code: "",
    description: "",
    uom: "BOX",
    box_qty: 0,
    units_per_box: 1,
    total_qty: 0,
    vat_rate: 15,
    unit_price_excl_vat: 0,
    unit_vat: 0,
    unit_price_incl_vat: 0,
    line_total: 0,
  });
}

function roleUpper(r?: string) {
  return String(r || "").toUpperCase();
}
function canDuplicate(role?: string) {
  const r = roleUpper(role);
  return r === "ADMIN" || r === "MANAGER";
}

function formatDDMMYYYY(v: any) {
  const s = String(v || "").trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return s;
}

/* ===========================
   ✅ Company vs Client selector
   =========================== */
function guessPartyType(name: string) {
  const s = String(name || "").toUpperCase();
  return /LTD|LIMITED|CO\.|COMPANY|TRADING|ENTERPRISE|INC|LLC/.test(s) ? "COMPANY" : "CLIENT";
}

function normalizeMuPhone(phone: string) {
  // returns digits only (Mauritius default +230)
  const digits = String(phone || "").replace(/[^\d]/g, "");
  if (!digits) return "";
  // already has country code
  if (digits.startsWith("230") && digits.length >= 11) return digits;
  // local 8-digit number
  if (digits.length === 8) return "230" + digits;
  return digits;
}

export default function NewInvoiceClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const duplicateId = searchParams.get("duplicate");

  const [saving, setSaving] = useState(false);
  const [printing, setPrinting] = useState(false);

  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);

  const [customerId, setCustomerId] = useState<number | null>(null);
  const [invoiceDate, setInvoiceDate] = useState<string>("");
  const [purchaseOrderNo, setPurchaseOrderNo] = useState("");

  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  // ✅ reps picker
  const [repOpen, setRepOpen] = useState(false);
  const [salesReps, setSalesReps] = useState<SalesRepName[]>([]);
  const [salesRepPhones, setSalesRepPhones] = useState<string>("");

  const [previousBalance, setPreviousBalance] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);

  const [prevTouched, setPrevTouched] = useState(false);
  const [paidTouched, setPaidTouched] = useState(false);

  // ✅ party-wise discount MUST be automatic
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  const [vatPercent, setVatPercent] = useState<number>(15);

  const [invoiceNumber, setInvoiceNumber] = useState<string>("(Auto when saved)");
  const [lines, setLines] = useState<InvoiceLine[]>([]);

  useEffect(() => {
  setLines((prev) =>
    prev.map((r) => {
      if (!r.product_id) return r;
      const p = products.find((x) => x.id === r.product_id);
      if (!p) return r;

      const baseEx = Number(p.price_excl_vat || 0);
      const disc = Math.max(0, Math.min(100, n2(discountPercent)));
      const discountedEx = baseEx * (1 - disc / 100);

      return recalc({ ...r, unit_price_excl_vat: discountedEx } as InvoiceLine);
    })
  );
}, [discountPercent, products]);


  const [dupFromNo, setDupFromNo] = useState<string | null>(null);
  const [role, setRole] = useState<string>("");

  // Product search modal
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchRowId, setSearchRowId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Customer search modal
  const [custSearchOpen, setCustSearchOpen] = useState(false);
  const [custSearchTerm, setCustSearchTerm] = useState("");

  // ✅ Customer Name Type (Company / Client)
  const [customerNameType, setCustomerNameType] = useState<"COMPANY" | "CLIENT">("COMPANY");
  const [customerNameTypeTouched, setCustomerNameTypeTouched] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("rp_user");
      if (raw) {
        const u = JSON.parse(raw);
        setRole(String(u?.role || ""));
      }
    } catch {}
  }, []);

  useEffect(() => {
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setLines([blankLine()]);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          rpFetch("/api/customers/list", { cache: "no-store" }),
          rpFetch("/api/products/list", { cache: "no-store" }),
        ]);

        const cJson = cRes.ok ? await cRes.json() : {};
        const pJson = pRes.ok ? await pRes.json() : {};

        if (!alive) return;
        setCustomers(cJson.customers || []);
        setProducts(pJson.products || []);
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, []);

 
const customer = useMemo(
  () => customers.find((c) => c.id === customerId) || null,
  [customers, customerId]
);

const hasWhatsApp = useMemo(() => {
  const raw = customer?.whatsapp || customer?.phone || "";
  const d = String(raw).replace(/[^\d]/g, "");
  return d.length > 0;
}, [customer?.whatsapp, customer?.phone]);


{hasWhatsApp ? (
  <button
    type="button"
    className="rp-btn rp-btn--ghost"
    disabled={!customerId}
    title="Send payment update on WhatsApp"
    onClick={() => {
      if (n2(amountPaid) <= 0) {
        alert("Enter an amount paid to send payment update.");
        return;
      }
      openWhatsAppPaymentUpdate(n2(amountPaid));
    }}
  >
    WhatsApp
  </button>
) : null}


 
  // customer-wise auto-fill (discount is always automatic)
  useEffect(() => {
    if (!customerId) return;

    if (!prevTouched) setPreviousBalance(n2(customer?.opening_balance ?? 0));
    if (!paidTouched) setAmountPaid(0);

    // ✅ ALWAYS auto party discount
    setDiscountPercent(n2(customer?.discount_percent ?? 0));

    // ✅ auto company/client from customer name (if user didn’t touch selector)
    if (!customerNameTypeTouched && customer?.name) {

      setCustomerNameType(guessPartyType(customer.name));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    customerId,
    customer?.opening_balance,
    customer?.discount_percent,
    customer?.name,
    prevTouched,
    paidTouched,
    customerNameTypeTouched,
  ]);

  // Close rep popup on outside click
  useEffect(() => {
    function close() {
      setRepOpen(false);
    }
    if (!repOpen) return;
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [repOpen]);

  // DUPLICATE PREFILL
  useEffect(() => {
    if (!duplicateId) return;

    if (!canDuplicate(role)) {
      alert("Only Admin / Manager can duplicate invoices.");
      router.replace("/invoices");
      return;
    }

    let alive = true;

    (async () => {
      try {
        // ✅ IMPORTANT: your working API file is /api/invoices/[id]
        const res = await rpFetch(`/api/invoices/${duplicateId}`, { cache: "no-store" });
        const json = await res.json();
        if (!json?.ok || !alive) return;

        const inv = json.invoice;
        const items = json.items || [];

        setDupFromNo(String(inv.invoice_number || duplicateId));

        setCustomerId(inv.customer_id);
        setPurchaseOrderNo(inv.purchase_order_no || "");

        const repText = String(inv.sales_rep || "").trim();
        const repList = repText
          ? repText.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [];
        setSalesReps(repList as SalesRepName[]);
        setSalesRepPhones(String(inv.sales_rep_phone || ""));

        const invType = String(inv.party_type || inv.customer_name_type || "").toUpperCase();
        if (invType === "COMPANY" || invType === "CLIENT") {
          setCustomerNameTypeTouched(true);
          setCustomerNameType(invType as any);
        }

        setPreviousBalance(0);
        setAmountPaid(0);
        setPrevTouched(false);
        setPaidTouched(false);

        const invVat = n2(inv.vat_percent ?? 15) === 0 ? 0 : 15;
        setVatPercent(invVat);

        // ✅ discount auto from customer anyway, but keep what invoice had if any
        setDiscountPercent(n2(inv.discount_percent ?? 0));

        const cloned = items.map((it: any) =>
          recalc({
            id: uid(),
            product_id: it.product_id,
            item_code: it.products?.item_code || "",
            description: it.description || it.products?.name || "",
            uom: it.uom || "BOX",
            box_qty: it.box_qty || 0,
            units_per_box: it.units_per_box || 1,
            total_qty: it.total_qty || 0,
            vat_rate: n2(it.vat_rate ?? (it.unit_vat > 0 ? 15 : 0)) === 0 ? 0 : 15,
            unit_price_excl_vat: it.unit_price_excl_vat || 0,
            unit_vat: it.unit_vat || 0,
            unit_price_incl_vat: it.unit_price_incl_vat || 0,
            line_total: it.line_total || 0,
          })
        );

        setLines(cloned.length ? cloned : [blankLine()]);
      } catch {}
    })();

    return () => {
      alive = false;
    };
  }, [duplicateId, role, router]);

  const realLines = useMemo(() => lines.filter((l) => !!l.product_id), [lines]);

  const subtotalEx = useMemo(
    () => realLines.reduce((sum, r) => sum + n2(r.total_qty) * n2(r.unit_price_excl_vat), 0),
    [realLines]
  );
  const vatAmount = useMemo(
    () => realLines.reduce((sum, r) => sum + n2(r.total_qty) * n2(r.unit_vat), 0),
    [realLines]
  );
  

  const totalAmount = useMemo(() => subtotalEx + vatAmount, [subtotalEx, vatAmount]);

// Optional: show discount amount as "saved amount" for display (compare with original)
const discountAmount = useMemo(() => {
  const dp = Math.max(0, Math.min(100, n2(discountPercent)));
  if (dp <= 0) return 0;

  // Rebuild "original total" by reversing discount from each unitEx
  const originalSubtotalEx = realLines.reduce((sum, r) => {
    const qty = n2(r.total_qty);
    const discountedUnitEx = n2(r.unit_price_excl_vat);
    const originalUnitEx = dp >= 100 ? 0 : discountedUnitEx / (1 - dp / 100);
    return sum + qty * originalUnitEx;
  }, 0);

  const originalVat = realLines.reduce((sum, r) => {
    const qty = n2(r.total_qty);
    const rate = n2(r.vat_rate) === 0 ? 0 : 15;
    const discountedUnitEx = n2(r.unit_price_excl_vat);
    const originalUnitEx = dp >= 100 ? 0 : discountedUnitEx / (1 - dp / 100);
    return sum + qty * (originalUnitEx * (rate / 100));
  }, 0);

  const originalTotal = originalSubtotalEx + originalVat;
  const discountedTotal = totalAmount;

  return Math.max(0, originalTotal - discountedTotal);
}, [realLines, discountPercent, totalAmount]);


  const grossTotal = useMemo(() => totalAmount + n2(previousBalance), [totalAmount, previousBalance]);

  const balanceRemaining = useMemo(
    () => Math.max(0, grossTotal - n2(amountPaid)),
    [grossTotal, amountPaid]
  );

  function setLine(id: string, patch: Partial<InvoiceLine>) {
  setLines((prev) =>
    prev.map((r) => (r.id === id ? recalc({ ...r, ...patch } as InvoiceLine) : r))
  );
}

  function addRow() {
    setLines((prev) => [...prev, blankLine()]);
  }

  function removeRow(id: string) {
    setRemovingIds((prev) => new Set(prev).add(id));

    window.setTimeout(() => {
      setLines((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 190); // matches CSS animation
  }

  useEffect(() => {
    const done = () => setPrinting(false);
    window.addEventListener("afterprint", done);
    return () => window.removeEventListener("afterprint", done);
  }, []);

  
  const invoiceDatePrint = formatDDMMYYYY(invoiceDate);


  function openWhatsApp() {
  const phone = normalizeMuPhone(customer?.whatsapp || customer?.phone || "");

  if (!phone) {
    alert("Customer WhatsApp / phone number is missing. Add it in customer profile.");
    return;
  }

  const text = buildWhatsAppText({
    invoiceNo: invoiceNumber,
    customerName: customer?.name || "",
    total: totalAmount,
    gross: grossTotal,
    paid: amountPaid,
    balance: balanceRemaining,
    date: invoiceDatePrint,
  });

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}


  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // ignore if modal/popup open
      if (searchOpen || custSearchOpen || repOpen) return;

      const el = e.target as HTMLElement | null;
      const tag = (el?.tagName || "").toLowerCase();
      const isTyping = tag === "input" || tag === "textarea" || tag === "select";

      // SHIFT+ENTER => SAVE (even if typing)
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        onSave();
        return;
      }

      // ENTER => add row (only when NOT typing)
      if (e.key === "Enter" && !e.shiftKey && !isTyping) {
        e.preventDefault();

        // pulse button (optional)
        const addBtn = document.querySelector(".inv-actions-right .rp-btn") as
          | HTMLButtonElement
          | null;
        if (addBtn) {
          addBtn.classList.remove("is-pulse");
          void addBtn.offsetWidth;
          addBtn.classList.add("is-pulse");
        }

        addRow();

        // focus next row qty input
        setTimeout(() => {
          const qtyInputs = Array.from(
            document.querySelectorAll<HTMLInputElement>(".inv-input--qtywide")
          );
          const last = qtyInputs[qtyInputs.length - 1];
          last?.focus();
          last?.select?.();
        }, 0);

        return;
      }

      // CTRL+P => PRINT
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        onPrint();
        return;
      }

      // CTRL+W => WhatsApp (prevent tab close)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "w") {
        e.preventDefault();
        openWhatsApp();
        return;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen, custSearchOpen, repOpen, customerId, lines.length]);

function applyProductToRow(rowId: string, product: ProductRow | null) {
  setLines((prev) =>
    prev.map((r) => {
      if (r.id !== rowId) return r;

      if (!product) {
        return recalc({
          ...r,
          product_id: null,
          item_code: "",
          description: "",
          units_per_box: 1,
          unit_price_excl_vat: 0,
          vat_rate: vatPercent === 0 ? 0 : 15,
          uom: "BOX",
          box_qty: 0,
        });
      }

      const baseEx = Number(product.price_excl_vat || 0);
      const disc = Math.max(0, Math.min(100, n2(discountPercent)));
      const discountedEx = baseEx * (1 - disc / 100);

      return recalc({
        ...r,
        product_id: product.id,
        item_code: product.item_code || product.sku || "",
        description: (product.description || product.name || "").trim(),
        units_per_box: Math.max(1, Number(product.units_per_box || 1)),
        unit_price_excl_vat: discountedEx,
        vat_rate: vatPercent === 0 ? 0 : 15,
        uom: "BOX",
        box_qty: Math.max(1, Math.trunc(Number(r.box_qty || 1))),
      });
    })
  );
}


  function openSearchForRow(rowId: string) {
    setSearchRowId(rowId);
    setSearchTerm("");
    setSearchOpen(true);
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchRowId(null);
    setSearchTerm("");
  }

  const filteredProducts = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    if (!t) return products;
    return products.filter((p) => {
      const code = String(p.item_code || "").toLowerCase();
      const sku = String(p.sku || "").toLowerCase();
      const name = String(p.name || "").toLowerCase();
      const desc = String(p.description || "").toLowerCase();
      return code.includes(t) || sku.includes(t) || name.includes(t) || desc.includes(t);
    });
  }, [products, searchTerm]);

  const filteredCustomers = useMemo(() => {
    const t = custSearchTerm.trim().toLowerCase();
    if (!t) return customers;
    return customers.filter((c) => {
      const name = String(c.name || "").toLowerCase();
      const phone = String(c.phone || "").toLowerCase();
      const code = String(c.customer_code || "").toLowerCase();
      const addr = String(c.address || "").toLowerCase();
      return name.includes(t) || phone.includes(t) || code.includes(t) || addr.includes(t);
    });
  }, [customers, custSearchTerm]);

  function openCustomerSearch() {
    setCustSearchTerm("");
    setCustSearchOpen(true);
  }

  function closeCustomerSearch() {
    setCustSearchOpen(false);
    setCustSearchTerm("");
  }
  
  // 🔔 WhatsApp payment update message
function buildWhatsAppPaymentText(opts: {
  invoiceNo: string;
  customerName: string;
  date: string;
  paidNow: number;
  grossTotal: number;
  balanceRemaining: number;
}) {
  const status =
    opts.paidNow >= opts.grossTotal && opts.grossTotal > 0
      ? "PAID ✅"
      : opts.paidNow > 0
      ? "PARTIALLY PAID ✅"
      : "PENDING";

  return [
    `RAM POTTERY LTD`,
    `Payment update for your invoice`,
    ``,
    `Invoice No: ${opts.invoiceNo}`,
    `Date: ${opts.date}`,
    `Customer: ${opts.customerName}`,
    `Status: ${status}`,
    ``,
    `Amount Paid: Rs ${money(opts.paidNow)}`,
    `Balance Remaining: Rs ${money(opts.balanceRemaining)}`,
    ``,
    `Thank you.`,
  ].join("\n");
}
 
   // 🧾 WhatsApp invoice summary message
   function buildWhatsAppText(opts: {
  invoiceNo: string;
  customerName: string;
  total: number;
  gross: number;
  paid: number;
  balance: number;
  date: string;
}) {
  const status =
    opts.paid >= opts.gross && opts.gross > 0
      ? "PAID ✅"
      : opts.paid > 0
      ? "PARTIALLY PAID ✅"
      : "PENDING";

  return [
    `RAM POTTERY LTD`,
    `Invoice: ${opts.invoiceNo}`,
    `Date: ${opts.date}`,
    `Customer: ${opts.customerName}`,
    `Status: ${status}`,
    ``,
    `Total Amount: Rs ${money(opts.total)}`,
    `Gross Total: Rs ${money(opts.gross)}`,
    `Paid: Rs ${money(opts.paid)}`,
    `Balance: Rs ${money(opts.balance)}`,
    ``,
    `Thank you.`,
  ].join("\n");
}


  function openWhatsAppPaymentUpdate(paidNow: number) {
  const phone = normalizeMuPhone(customer?.whatsapp || customer?.phone || "");
  if (!phone) {
    alert("Customer phone is missing. Add phone number in customer profile.");
    return;
  }

  const text = buildWhatsAppPaymentText({
    invoiceNo: invoiceNumber,
    customerName: customer?.name || "",
    date: invoiceDatePrint, // ✅ fixed
    paidNow: n2(paidNow),
    grossTotal,
    balanceRemaining,
  });

  window.open(
    `https://wa.me/${phone}?text=${encodeURIComponent(text)}`,
    "_blank",
    "noopener,noreferrer"
  );
}
   
 
  async function fetchInvoicePdf(invoiceIdOrNo: string) {
  const res = await rpFetch(`/api/invoices/${encodeURIComponent(invoiceIdOrNo)}/pdf`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "Failed to generate PDF");
  }
  const blob = await res.blob();
  return blob;
}

async function sharePdfToWhatsApp(invoiceIdOrNo: string, messageText: string) {
  const blob = await fetchInvoicePdf(invoiceIdOrNo);
  const fileName = `Invoice-${invoiceIdOrNo}.pdf`;
  const file = new File([blob], fileName, { type: "application/pdf" });

  // ✅ Best: mobile share sheet (WhatsApp appears as an option)
  // Works on Android Chrome + iOS Safari (modern versions)
  const nav: any = navigator;

  if (nav?.share && nav?.canShare?.({ files: [file] })) {
    await nav.share({
      title: `Invoice ${invoiceIdOrNo}`,
      text: messageText,
      files: [file],
    });
    return;
  }

  // Desktop fallback: download PDF + open WhatsApp with text (user attaches manually)
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);

  // open WhatsApp chat with message
  window.open(`https://wa.me/?text=${encodeURIComponent(messageText)}`, "_blank", "noopener,noreferrer");

  alert("PDF downloaded. Please attach it in WhatsApp Web / WhatsApp Desktop.");
}

   
   async function onSave() {
  if (!customerId) return alert("Please select a customer.");
  if (!invoiceDate) return alert("Please select invoice date.");
  if (!salesReps.length) return alert("Please select at least one sales rep.");
  if (realLines.length === 0) return alert("Please add at least one item.");

  setSaving(true);

  try {
    // ✅ Build items exactly aligned with API expectations
    const itemsPayload = realLines.map((l) => {
      const qtyInput = Math.trunc(n2(l.box_qty)); // UI uses box_qty as qty input for both BOX/PCS
      if (qtyInput <= 0) throw new Error("Qty must be at least 1 for all items.");

      const uom: "BOX" | "PCS" = l.uom === "PCS" ? "PCS" : "BOX";
      const upb = uom === "PCS" ? 1 : Math.max(1, Math.trunc(n2(l.units_per_box) || 1));
      const totalQty = uom === "PCS" ? qtyInput : qtyInput * upb;

      return {
        product_id: l.product_id,
        description: l.description || null,
        uom,

        // ✅ send correct qty fields (API normalization expects this)
        box_qty: uom === "BOX" ? qtyInput : null,
        pcs_qty: uom === "PCS" ? qtyInput : null,

        units_per_box: upb,
        total_qty: totalQty,

        unit_price_excl_vat: n2(l.unit_price_excl_vat), // already discounted in UI
        vat_rate: n2(l.vat_rate),
        unit_vat: n2(l.unit_vat),
        unit_price_incl_vat: n2(l.unit_price_incl_vat),
        line_total: n2(l.line_total),
      };
    });

    // ✅ Recompute totals INSIDE onSave (prevents stale React memo/state in WhatsApp msg)
    // Must mirror UI logic (based on discounted unit_ex + unit_vat)
    const subtotalExNow = realLines.reduce(
      (sum, r) => sum + n2(r.total_qty) * n2(r.unit_price_excl_vat),
      0
    );
    const vatNow = realLines.reduce((sum, r) => sum + n2(r.total_qty) * n2(r.unit_vat), 0);
    const totalNow = subtotalExNow + vatNow;

    const prevNow = n2(previousBalance);
    const paidNow = n2(amountPaid);

    const grossNow = totalNow + prevNow;
    const balanceNow = Math.max(0, grossNow - paidNow);

    const payload = {
      customerId,
      invoiceDate,
      purchaseOrderNo: purchaseOrderNo || null,

      salesRep: salesReps.join(", "),
      salesRepPhone: salesRepPhones || salesReps.map(repPhoneByName).filter(Boolean).join(", "),

      previousBalance: prevNow,
      amountPaid: paidNow,

      discountPercent: n2(discountPercent),
      discountAmount: n2(discountAmount), // optional (display), API will ignore in LINE_DISCOUNTED if you want
      pricingMode: "LINE_DISCOUNTED",

      partyType: customerNameType,

      items: itemsPayload,
    };

    const res = await rpFetch("/api/invoices/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed to create invoice");

    const invNo = String(json.invoiceNumber || "(Saved)");
    setInvoiceNumber(invNo);

    // ✅ Auto WhatsApp when PAID or PARTIALLY PAID (with PDF share)
    if (paidNow > 0) {
      setTimeout(() => {
        const msg = buildWhatsAppPaymentText({
          invoiceNo: invNo,
          customerName: customer?.name || "",
          date: invoiceDatePrint,
          paidNow: paidNow,
          grossTotal: grossNow,
          balanceRemaining: balanceNow,
        });

        // Share PDF + message (mobile share sheet OR desktop fallback)
        sharePdfToWhatsApp(invNo, msg).catch((e) =>
          alert(e?.message || "Failed to share invoice PDF")
        );
      }, 250);
    }

    alert(`Invoice saved: ${invNo}`);
  } catch (err: any) {
    alert(err?.message || "Failed to create invoice");
  } finally {
    setSaving(false);
  }
}



    function onPrint() {
    setPrinting(true);

    document.documentElement.classList.add("rp-printing");

    const cleanup = () => {
      document.documentElement.classList.remove("rp-printing");
      setPrinting(false);
      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup);

    // give DOM + fonts + images a moment to render
    setTimeout(() => {
      window.print();
    }, 200);

    // fallback cleanup
    setTimeout(cleanup, 5000);
  }

  // PRINT DATA
  const docItems = useMemo(() => {
    return realLines.map((r, i) => ({
      sn: i + 1,
      item_code: r.item_code,
      uom: r.uom,
      box_qty: Math.trunc(n2(r.box_qty)),
      units_per_box: Math.trunc(n2(r.units_per_box)),
      total_qty: Math.trunc(n2(r.total_qty)),
      description: r.description,
      unit_price_excl_vat: n2(r.unit_price_excl_vat),
      unit_vat: n2(r.unit_vat),
      unit_price_incl_vat: n2(r.unit_price_incl_vat),
      line_total: n2(r.line_total),
    }));
  }, [realLines]);

  const salesRepNamePrint = salesReps.join(", ");
  const salesRepPhonePrint =
    salesRepPhones || salesReps.map(repPhoneByName).filter(Boolean).join(", ");

  return (
    <div className="inv-page">
      {/* Top actions */}
      <div className="inv-actions inv-screen">
        <button type="button" className="rp-btn rp-btn--ghost" onClick={() => router.back()}>
          ← Back
        </button>

        <div className="inv-actions-right">
          <button type="button" className="rp-btn" onClick={addRow}>
            + Add Row
          </button>

          <button
            type="button"
            className="rp-btn rp-btn--ghost"
            disabled={!customerId}
            title="Send payment update on WhatsApp"
            onClick={() => {
            if (n2(amountPaid) <= 0) {
            alert("Enter an amount paid to send payment update.");
            return;
           }
           openWhatsAppPaymentUpdate(n2(amountPaid));
         }}
        >
         WhatsApp
        </button>

          <button
            type="button"
            className="rp-btn"
            onClick={onPrint}
            disabled={printing}
            title="Print A4 invoice"
          >
            {printing ? "Preparing…" : "Print"}
          </button>

          <button
            type="button"
            className="rp-btn rp-btn--primary"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Invoice"}
          </button>
        </div>
      </div>

      {/* ==========================
         SCREEN (everything editable)
         ========================== */}
      <div className="inv-screen inv-form-shell">
        <div className="inv-form-card">
          <div className="inv-form-head">
            <div>
              <div className="inv-form-title">New VAT Invoice</div>
              <div className="inv-form-sub">A4 Print Template Locked (Ram Pottery)</div>

              {dupFromNo ? (
                <div className="inv-dup-badge">
                  Duplicated from <b>{dupFromNo}</b>
                </div>
              ) : null}
            </div>

            <div className="inv-form-meta">
              <div className="inv-meta-row">
                <span className="inv-meta-k">Invoice No</span>
                <span className="inv-meta-v">{invoiceNumber}</span>
              </div>
              <div className="inv-meta-row">
                <span className="inv-meta-k">Date</span>
                <span className="inv-meta-v">{invoiceDate || "—"}</span>
              </div>
            </div>
          </div>

          <div className="inv-form-grid">
            {/* Customer Type selector */}
            <div className="inv-field inv-field--type">
              <label>Customer Type</label>
              <select
                className="inv-input"
                value={customerNameType}
                onChange={(e) => {
                  setCustomerNameTypeTouched(true);
                  setCustomerNameType(e.target.value as any);
                }}
              >
                <option value="COMPANY">Company Name</option>
                <option value="CLIENT">Client Name</option>
              </select>
              <div className="inv-help">Affects the label shown on the invoice header.</div>
            </div>

            {/* Customer select + search */}
            <div className="inv-field inv-field--customer">
              <label>{customerNameType === "COMPANY" ? "Company Name" : "Client Name"}</label>

              <div className="inv-customer-row">
                <select
                  className="inv-input"
                  value={customerId ?? ""}
                  onChange={(e) => {
                    setCustomerId(e.target.value ? Number(e.target.value) : null);
                  }}
                >
                  <option value="">Select…</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="rp-btn rp-btn--ghost inv-search-btn"
                  onClick={openCustomerSearch}
                  title="Search customer"
                >
                  🔍 Search
                </button>
              </div>

              <div className="inv-help">
                {customer ? (
                  <>
                    <span>{customer.address}</span> · <span>{customer.phone}</span>
                  </>
                ) : (
                  <span>Select a customer (or use Search)</span>
                )}
              </div>
            </div>

            {/* Invoice Date */}
            <div className="inv-field inv-field--date">
              <label>Invoice Date</label>
              <input
                className="inv-input"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>

            {/* PO */}
            <div className="inv-field inv-field--po">
              <label>Purchase Order No (optional)</label>
              <input
                className="inv-input"
                value={purchaseOrderNo}
                onChange={(e) => setPurchaseOrderNo(e.target.value)}
                placeholder="Optional"
              />
            </div>

            {/* Sales Reps */}
            <div className="inv-field inv-field--reps">
              <label>Sales Rep(s)</label>

              <div className="inv-rep">
                <button
                  type="button"
                  className="inv-rep-btn"
                  onClick={() => setRepOpen((v) => !v)}
                  aria-expanded={repOpen}
                >
                  <div className="inv-rep-chips">
                    {salesReps.length ? (
                      salesReps.map((n) => (
                        <span key={n} className="inv-chip">
                          {n} ({repPhoneByName(n)})
                          <span
                            className="inv-chip-x"
                            onClick={(e) => {
                              e.stopPropagation();
                              const next = salesReps.filter((x) => x !== n);
                              setSalesReps(next);
                              setSalesRepPhones(next.map(repPhoneByName).filter(Boolean).join(", "));
                            }}
                            title="Remove"
                          >
                            ×
                          </span>
                        </span>
                      ))
                    ) : (
                      <span className="inv-rep-placeholder">Select sales reps…</span>
                    )}
                  </div>
                  <span className="inv-rep-caret">▾</span>
                </button>

                {repOpen ? (
                  <div className="inv-rep-pop" onMouseDown={(e) => e.stopPropagation()}>
                    {SALES_REPS.map((r) => {
                      const active = salesReps.includes(r.name);
                      return (
                        <button
                          key={r.name}
                          type="button"
                          className={"inv-rep-item" + (active ? " is-active" : "")}
                          onClick={() => {
                            const next = active
                              ? salesReps.filter((x) => x !== r.name)
                              : [...salesReps, r.name];

                            setSalesReps(next);
                            setSalesRepPhones(next.map(repPhoneByName).filter(Boolean).join(", "));

                            setRepOpen(false);
                          }}
                        >
                          <span className="inv-rep-name">{r.name}</span>
                          <span className="inv-rep-phone">{r.phone}</span>
                          <span className="inv-rep-check">{active ? "✓" : ""}</span>
                        </button>
                      );
                    })}
                    <div className="inv-rep-hint">Click to select. Click again to remove.</div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* VAT */}
            <div className="inv-field inv-field--vat">
              <label>VAT % (applies to all items)</label>
              <select
                className="inv-input"
                value={vatPercent}
                onChange={(e) => {
                  const next = n2(e.target.value) === 0 ? 0 : 15;
                  setVatPercent(next);
                  setLines((prev) => prev.map((r) => recalc({ ...r, vat_rate: next } as InvoiceLine)));
                }}
              >
                <option value={15}>15%</option>
                <option value={0}>0%</option>
              </select>
            </div>

            {/* Discount */}
            <div className="inv-field inv-field--discount">
              <label>Discount % (Party-wise)</label>
              <input className="inv-input inv-input--right" value={fmtNumber(discountPercent)} readOnly />
              <div className="inv-help">
                {customer ? (
                  <span>
                    Auto from <b>{customer.name}</b>: {fmtNumber(n2(customer.discount_percent ?? 0))}%
                  </span>
                ) : (
                  <span>Auto-fills when you select a customer</span>
                )}
              </div>
            </div>

            {/* Previous Balance */}
            <div className="inv-field inv-field--prev">
              <label>Previous Balance</label>
              <input
                className="inv-input inv-input--right"
                inputMode="decimal"
                value={previousBalance}
                onChange={(e) => {
                  setPrevTouched(true);
                  setPreviousBalance(n2(e.target.value));
                }}
              />
            </div>

            {/* Amount Paid */}
            <div className="inv-field inv-field--paid">
              <label>Amount Paid</label>
              <input
                className="inv-input inv-input--right"
                inputMode="decimal"
                value={amountPaid}
                onChange={(e) => {
                  setPaidTouched(true);
                  setAmountPaid(n2(e.target.value));
                }}
              />
              <div className="inv-help">If Amount Paid &gt; 0, WhatsApp prompt opens after Save.</div>
            </div>
          </div>

          {/* ITEMS TABLE (SCREEN) */}
          <div className="inv-items">
            <div className="inv-items-head">
              <div className="inv-items-title">Items</div>
              <div className="inv-items-sub">Matches printed invoice columns (A4).</div>
            </div>

            <div className="inv-table-wrap">
              <table className="inv-table inv-table--invoiceCols">
                {/* ✅ Hydration-safe colgroup (NO whitespace) */}
                <colgroup>
                  <col style={{ width: "4%" }} />
                  <col style={{ width: "30%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "4%" }} />
                </colgroup>

                <thead>
                  <tr>
                    <th className="inv-th inv-th-center">#</th>
                    <th className="inv-th">PRODUCT</th>
                    <th className="inv-th inv-th-center">BOX / PCS</th>
                    <th className="inv-th inv-th-center">UNIT</th>
                    <th className="inv-th inv-th-center">TOTAL QTY</th>
                    <th className="inv-th inv-th-right">UNIT&nbsp;EX</th>
                    <th className="inv-th inv-th-right">VAT</th>
                    <th className="inv-th inv-th-right">UNIT&nbsp;INC</th>
                    <th className="inv-th inv-th-right">TOTAL</th>
                    <th className="inv-th inv-th-center" />
                  </tr>
                </thead>

                <tbody>
                  {lines.map((r, idx) => {
                    const isReal = !!r.product_id;

                    return (
                      <tr key={r.id} className={removingIds.has(r.id) ? "inv-row--removing" : ""}>
                        <td className="inv-td inv-center">{idx + 1}</td>

                        {/* PRODUCT selector */}
                        <td className="inv-td">
                          <div className="inv-itemcode-cell--prod">
                            <select
                              className="inv-input inv-input--prod"
                              value={r.product_id ?? ""}
                              onChange={(e) => {
                                const pid = e.target.value ? Number(e.target.value) : null;
                                const p = pid ? products.find((x) => x.id === pid) || null : null;
                                applyProductToRow(r.id, p);
                              }}
                            >
                              <option value="">Select…</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.item_code} — {p.name}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              className="inv-search-mini"
                              onClick={() => openSearchForRow(r.id)}
                              title="Search product"
                            >
                              🔍
                            </button>
                          </div>
                        </td>

                        {/* BOX / PCS + Qty */}
                        <td className="inv-td inv-center">
                          <div className="inv-boxcell inv-boxcell--premium">
                            <select
                              className="inv-input inv-input--uom"
                              value={r.uom}
                              onChange={(e) => setLine(r.id, { uom: e.target.value as any })}
                              disabled={!isReal}
                            >
                              <option value="BOX">BOX</option>
                              <option value="PCS">PCS</option>
                            </select>

                            <input
                              className="inv-input inv-input--qty inv-input--qtywide inv-center"
                              value={r.box_qty}
                              onChange={(e) => setLine(r.id, { box_qty: n2(e.target.value) })}
                              onKeyDown={(e) => {
                                if (e.key !== "Enter") return;
                                if (e.shiftKey) return; // Shift+Enter is Save (handled globally)
                                if (!isReal) return;

                                const isLast = idx === lines.length - 1;
                                const q = Math.trunc(n2((e.target as HTMLInputElement).value));

                                if (isLast && q >= 1) {
                                  e.preventDefault();
                                  addRow();
                                  setTimeout(() => {
                                    const qtyInputs = Array.from(
                                      document.querySelectorAll<HTMLInputElement>(".inv-input--qtywide")
                                    );
                                    const last = qtyInputs[qtyInputs.length - 1];
                                    last?.focus();
                                    last?.select?.();
                                  }, 0);
                                }
                              }}
                              disabled={!isReal}
                              inputMode="numeric"
                              placeholder="0"
                            />
                          </div>
                        </td>

                        {/* UNIT/BOX */}
                        <td className="inv-td inv-center">
                          <input
                            className="inv-input inv-center"
                            value={r.uom === "PCS" ? "" : intFmt(r.units_per_box)}
                            readOnly
                          />
                        </td>

                        {/* TOTAL QTY */}
                        <td className="inv-td inv-center">
                          <input className="inv-input inv-center" value={intFmt(r.total_qty)} readOnly />
                        </td>

                        {/* PRICES */}
                        <td className="inv-td inv-right">
                          <input
                            className="inv-input inv-input--right"
                            value={money(r.unit_price_excl_vat)}
                            readOnly
                          />
                        </td>
                        <td className="inv-td inv-right">
                          <input className="inv-input inv-input--right" value={money(r.unit_vat)} readOnly />
                        </td>
                        <td className="inv-td inv-right">
                          <input
                            className="inv-input inv-input--right"
                            value={money(r.unit_price_incl_vat)}
                            readOnly
                          />
                        </td>
                        <td className="inv-td inv-right">
                          <input
                            className="inv-input inv-input--right inv-input--total"
                            value={money(r.line_total)}
                            readOnly
                          />
                        </td>

                        <td className="inv-td inv-center">
                          <button
                            type="button"
                            className="inv-xmini"
                            onClick={() => removeRow(r.id)}
                            title="Remove row"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals preview */}
            <div className="inv-totalsbar inv-totalsbar--premium">
              <div>
                <b>Sub Total:</b> {money(subtotalEx)}
              </div>
              <div>
                <b>VAT:</b> {money(vatAmount)}
              </div>
              <div>
                <b>Discount:</b> {money(discountAmount)}
              </div>
              <div>
                <b>Total:</b> {money(totalAmount)}
              </div>
              <div>
                <b>Gross:</b> {money(grossTotal)}
              </div>
              <div>
                <b>Balance:</b> {money(balanceRemaining)}
              </div>
            </div>
          </div>

          {/* ===========================
              Product Search Modal
             =========================== */}
          {searchOpen ? (
            <div className="inv-modal-backdrop" onMouseDown={closeSearch}>
              <div className="inv-modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="inv-modal-head">
                  <div className="inv-modal-title">Search Product</div>
                  <button type="button" className="rp-btn rp-btn--ghost" onClick={closeSearch}>
                    Close
                  </button>
                </div>

                <div className="inv-modal-body">
                  <input
                    className="inv-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by code, sku, name, description…"
                    autoFocus
                  />

                  <div className="inv-modal-list">
                    {filteredProducts.slice(0, 150).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="inv-modal-item"
                        onClick={() => {
                          if (searchRowId) applyProductToRow(searchRowId, p);
                          closeSearch();
                        }}
                      >
                        <div className="inv-modal-item-title">
                          <b>{p.item_code || p.sku}</b> — {p.name}
                        </div>
                        <div className="inv-modal-item-sub">
                          UNIT: {intFmt(p.units_per_box ?? 1)} · Unit Ex: {money(p.price_excl_vat ?? 0)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* ===========================
              Customer Search Modal
             =========================== */}
          {custSearchOpen ? (
            <div className="inv-modal-backdrop" onMouseDown={closeCustomerSearch}>
              <div className="inv-modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="inv-modal-head">
                  <div className="inv-modal-title">Search Customer</div>
                  <button type="button" className="rp-btn rp-btn--ghost" onClick={closeCustomerSearch}>
                    Close
                  </button>
                </div>

                <div className="inv-modal-body">
                  <input
                    className="inv-input"
                    value={custSearchTerm}
                    onChange={(e) => setCustSearchTerm(e.target.value)}
                    placeholder="Search by name, code, phone, address…"
                    autoFocus
                  />

                  <div className="inv-modal-list">
                    {filteredCustomers.slice(0, 200).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="inv-modal-item"
                        onClick={() => {
                          setCustomerId(c.id);
                          closeCustomerSearch();
                        }}
                      >
                        <div className="inv-modal-item-title">
                          <b>{c.name}</b> <span className="inv-muted">({c.customer_code})</span>
                        </div>
                        <div className="inv-modal-item-sub">
                          {c.phone} · {c.address}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ==========================
         PRINT ONLY (must be OUTSIDE inv-screen)
         ========================== */}
      <div className="inv-printonly">
        <RamPotteryDoc
          variant="INVOICE"
          docNoLabel="INVOICE NO:"
          docNoValue={invoiceNumber}
          dateLabel="DATE:"
          dateValue={invoiceDatePrint}
          purchaseOrderLabel="PURCHASE ORDER NO:"
          purchaseOrderValue={purchaseOrderNo || ""}
          salesRepName={salesRepNamePrint}
          salesRepPhone={salesRepPhonePrint}
          customer={{
            name: customer?.name || "",
            address: customer?.address || "",
            phone: customer?.phone || "",
            brn: customer?.brn || "",
            vat_no: customer?.vat_no || "",
            customer_code: customer?.customer_code || "",
          }}
          company={{
            brn: "C17144377",
            vat_no: "123456789",
          }}
          items={docItems}
          totals={{
            subtotal: subtotalEx,
            vatPercentLabel: `VAT`,
            vat_amount: vatAmount,
            total_amount: totalAmount,
            previous_balance: previousBalance,
            amount_paid: amountPaid,
            balance_remaining: balanceRemaining,
            discount_percent: discountPercent,
            discount_amount: discountAmount,
          }}
          preparedBy="Manish"
          deliveredBy=""
        />
      </div>
    </div>
  );
}

