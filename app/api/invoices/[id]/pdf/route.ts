// app/api/invoices/[id]/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, service, { auth: { persistSession: false } });
}

function escapeHtml(s: any) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildInvoiceHtml(data: any) {
  const inv = data.invoice;
  const items = data.items || [];

  const rows = items
    .map(
      (it: any, i: number) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(it.products?.item_code || "")}</td>
        <td>${escapeHtml(it.description || it.products?.name || "")}</td>
        <td style="text-align:right">${Number(it.total_qty || 0)}</td>
        <td style="text-align:right">${Number(it.unit_price_excl_vat || 0).toFixed(2)}</td>
        <td style="text-align:right">${Number(it.unit_vat || 0).toFixed(2)}</td>
        <td style="text-align:right">${Number(it.line_total || 0).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body{ font-family: Arial, sans-serif; color:#111; }
    .box{ border:2px solid #111; padding:12px; }
    h1{ margin:0 0 6px 0; font-size:18px; }
    .muted{ color:#444; font-size:12px; }
    table{ width:100%; border-collapse:collapse; margin-top:10px; }
    th,td{ border:1px solid #111; padding:6px; font-size:12px; }
    th{ background:#f2f2f2; text-align:left; }
    .totals{ margin-top:10px; width:100%; }
    .totals td{ border:none; padding:2px 0; }
    .right{ text-align:right; }
  </style>
</head>
<body>
  <div class="box">
    <h1>RAM POTTERY LTD — VAT INVOICE</h1>
    <div class="muted">Invoice No: ${escapeHtml(inv.invoice_number)}</div>
    <div class="muted">Date: ${escapeHtml(inv.invoice_date)}</div>
    <div style="margin-top:8px"><b>Customer:</b> ${escapeHtml(inv.customers?.name || "")}</div>
    <div class="muted">${escapeHtml(inv.customers?.address || "")}</div>

    <table>
      <thead>
        <tr>
          <th style="width:40px">#</th>
          <th style="width:120px">Code</th>
          <th>Description</th>
          <th style="width:70px" class="right">Qty</th>
          <th style="width:90px" class="right">Unit Ex</th>
          <th style="width:70px" class="right">VAT</th>
          <th style="width:90px" class="right">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <table class="totals">
      <tr><td class="right"><b>Subtotal:</b></td><td class="right" style="width:140px">${Number(inv.subtotal || 0).toFixed(2)}</td></tr>
      <tr><td class="right"><b>VAT:</b></td><td class="right">${Number(inv.vat_amount || 0).toFixed(2)}</td></tr>
      <tr><td class="right"><b>Total:</b></td><td class="right">${Number(inv.total_amount || 0).toFixed(2)}</td></tr>
      <tr><td class="right"><b>Paid:</b></td><td class="right">${Number(inv.amount_paid || 0).toFixed(2)}</td></tr>
      <tr><td class="right"><b>Balance:</b></td><td class="right">${Number(inv.balance_remaining || 0).toFixed(2)}</td></tr>
    </table>
  </div>
</body>
</html>`;
}

async function getChromeExecutablePath() {
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) return await chromium.executablePath();

  // local dev fallback
  const anyP = puppeteer as any;
  if (typeof anyP.executablePath === "function") return anyP.executablePath();

  return await chromium.executablePath();
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const supabase = supaAdmin();

    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .select(`*, customers (id,name,address,phone,brn,vat_no,customer_code)`)
      .eq("invoice_number", id)
      .single();

    if (invErr || !invoice) {
      return NextResponse.json({ ok: false, error: "Invoice not found" }, { status: 404 });
    }

    const { data: items, error: itemsErr } = await supabase
      .from("invoice_items")
      .select(`*, products (id,item_code,sku,name)`)
      .eq("invoice_id", invoice.id)
      .order("id", { ascending: true });

    if (itemsErr) {
      return NextResponse.json({ ok: false, error: itemsErr.message }, { status: 500 });
    }

    const html = buildInvoiceHtml({ invoice, items });

    const executablePath = await getChromeExecutablePath();

    const browser = await puppeteer.launch({
      args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfUint8 = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "8mm", right: "8mm", bottom: "8mm", left: "8mm" },
});

   await page.close();
   await browser.close();

// ✅ FINAL, TS-SAFE BODY
   const pdfBuffer = Buffer.from(pdfUint8);

  return new Response(pdfBuffer, {
   status: 200,
   headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `inline; filename="Invoice-${id}.pdf"`,
    "Cache-Control": "no-store",
  },
});

  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
  }
}
