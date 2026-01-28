// app/api/invoices/set-paid/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

export const dynamic = "force-dynamic";

/* ---------- supabase ---------- */
function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !(service || anon)) {
    throw new Error(
      "Missing Supabase env. Need NEXT_PUBLIC_SUPABASE_URL + (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY)"
    );
  }
  return createClient(url, service || anon!, { auth: { persistSession: false } });
}

function n2(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

/* ---------- whatsapp helpers ---------- */
// digits only, Mauritius default +230
function normalizeMuPhone(phone: any) {
  const digits = String(phone || "").replace(/[^\d]/g, "");
  if (!digits) return "";

  // local 8-digit number => add 230
  if (digits.length === 8) return "230" + digits;

  // must be exactly 230 + 8 digits = 11 total
  if (digits.startsWith("230") && digits.length === 11) return digits;

  // reject everything else (your rule: "230 only")
  return "";
}


function money(v: any) {
  const x = n2(v);
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(x);
}

function formatDDMMYYYY(v: any) {
  const s = String(v || "").trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return s;
}

/**
 * Sends a TEMPLATE message (safe outside 24h window).
 * You must create template name "invoice_payment_update" in WhatsApp Manager.
 *
 * Template variables:
 * 1 invoiceNo
 * 2 date
 * 3 status
 * 4 amountPaid
 * 5 balanceRemaining
 */
async function sendWhatsAppPaymentUpdate(opts: {
  to: string; // digits only, includes 230...
  invoiceNo: string;
  invoiceDate: string;
  status: "PAID ✅" | "PARTIALLY PAID ✅";
  amountPaid: number;
  balanceRemaining: number;
}) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v21.0";

  if (!token || !phoneNumberId) {
    throw new Error("Missing WhatsApp env: WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID");
  }

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: opts.to,
    type: "template",
    template: {
      name: "invoice_payment_update",
      language: { code: "en_US" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: opts.invoiceNo },
            { type: "text", text: opts.invoiceDate },
            { type: "text", text: opts.status },
            { type: "text", text: `Rs ${money(opts.amountPaid)}` },
            { type: "text", text: `Rs ${money(opts.balanceRemaining)}` },
          ],
        },
      ],
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error?.message || "WhatsApp send failed";
    throw new Error(msg);
  }

  return json;
}

/* ---------- route ---------- */
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const body: any = await req.json().catch(() => ({}));
    const invoiceId = body.invoiceId ?? body.id;
    const paidNow = n2(body.amountPaid ?? body.amount_paid ?? body.paid ?? 0);

    if (!invoiceId) {
      return NextResponse.json({ ok: false, error: "Missing invoiceId" }, { status: 400 });
    }
    if (paidNow < 0) {
      return NextResponse.json({ ok: false, error: "amountPaid must be >= 0" }, { status: 400 });
    }

    const supabase = supaAdmin();

    // 1) Read invoice + customer fields we need
    const { data: inv, error: invErr } = await supabase
      .from("invoices")
      .select("id, invoice_number, invoice_date, customer_id, gross_total, amount_paid, balance_remaining")
      .eq("id", invoiceId)
      .single();

    if (invErr || !inv) throw invErr || new Error("Invoice not found");

    const grossTotal = n2(inv.gross_total);
    const prevPaid = n2(inv.amount_paid);

    // You can decide: replace paid or add paid
    // Here: we REPLACE paid with the new value (common “Set Paid” behavior)
    const nextPaid = Math.max(0, prevPaid + paidNow);

    const nextBalance = Math.max(0, grossTotal - nextPaid);

    const status = nextBalance <= 0 ? "PAID ✅" : nextPaid > 0 ? "PARTIALLY PAID ✅" : null;

    // 2) Update invoice payment fields
    const { error: upErr } = await supabase
      .from("invoices")
      .update({
        amount_paid: nextPaid,
        balance_remaining: nextBalance,
        balance_due: nextBalance,
        status: nextBalance <= 0 ? "PAID" : nextPaid > 0 ? "PARTIALLY_PAID" : "ISSUED",
      })
      .eq("id", invoiceId);

    if (upErr) throw upErr;

    // 3) Only send WhatsApp if it transitions into paid/partial, OR payment changed
    const paymentChanged = Math.abs(nextPaid - prevPaid) > 0.0001;
    if (status && paymentChanged) {
      const { data: cust, error: cErr } = await supabase
        .from("customers")
        .select("id, name, phone, whatsapp")
        .eq("id", inv.customer_id)
        .single();

      if (!cErr && cust) {
        const to = normalizeMuPhone(cust.whatsapp || cust.phone);

        if (to) {
          await sendWhatsAppPaymentUpdate({
            to,
            invoiceNo: String(inv.invoice_number || inv.id),
            invoiceDate: formatDDMMYYYY(inv.invoice_date),
            status,
            amountPaid: nextPaid,
            balanceRemaining: nextBalance,
          });
        }
      }
      // If customer missing WhatsApp, we silently skip (no crash)
    }

    return NextResponse.json({ ok: true, invoiceId, amountPaid: nextPaid, balanceRemaining: nextBalance });
  } catch (err: any) {
    console.error("Set invoice paid error:", err);
    return NextResponse.json({ ok: false, error: err?.message || "Failed" }, { status: 500 });
  }
}
