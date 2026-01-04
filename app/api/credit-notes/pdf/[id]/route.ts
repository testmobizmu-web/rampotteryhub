import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";
import { PDFDocument, StandardFonts } from "pdf-lib";

export const runtime = "nodejs";

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !(service || anon)) throw new Error("Missing Supabase env");
  return createClient(url, service || anon!, { auth: { persistSession: false } });
}

function money(n: any) {
  const x = Number(n ?? 0);
  return Number.isFinite(x) ? x.toFixed(2) : "0.00";
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ important for your Next build
) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
    }

    const { id } = await context.params;
    const supabase = supaAdmin();

    const { data: cn, error: cnErr } = await supabase
      .from("credit_notes")
      .select(`
        id, credit_note_number, credit_note_date, reason, subtotal, vat_amount, total_amount, status,
        customers:customer_id (name, phone, email, address, customer_code)
      `)
      .eq("id", id)
      .maybeSingle();

    if (cnErr) return new Response(JSON.stringify({ ok: false, error: cnErr.message }), { status: 500 });
    if (!cn) return new Response(JSON.stringify({ ok: false, error: "Credit note not found" }), { status: 404 });

    const { data: items, error: itErr } = await supabase
      .from("credit_note_items")
      .select(`
        id, total_qty, unit_price_excl_vat, unit_vat, unit_price_incl_vat, line_total,
        products:product_id (name, item_code, sku)
      `)
      .eq("credit_note_id", id)
      .order("id");

    if (itErr) return new Response(JSON.stringify({ ok: false, error: itErr.message }), { status: 500 });

    // ----- Build A4 PDF -----
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]); // A4 points
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const left = 40;
    let y = 812;

    page.drawText("CREDIT NOTE", { x: left, y, size: 18, font: bold });
    y -= 22;

    const docNo = String((cn as any).credit_note_number || `#${(cn as any).id}`);
    const docDate = String((cn as any).credit_note_date || "");

    page.drawText(`No: ${docNo}`, { x: left, y, size: 11, font: bold });
    page.drawText(`Date: ${docDate}`, { x: 360, y, size: 11, font });
    y -= 22;

    // Company block
    page.drawText("Ram Pottery Ltd", { x: 360, y: 812, size: 11, font: bold });
    page.drawText("Royal Road, Mauritius", { x: 360, y: 797, size: 10, font });

    // Bill To
    page.drawText("BILL TO", { x: left, y, size: 10, font: bold });
    y -= 14;

    const cust = (cn as any).customers;
    const custObj = Array.isArray(cust) ? cust[0] : cust;

    page.drawText(String(custObj?.name || "—"), { x: left, y, size: 11, font: bold });
    y -= 12;

    const code = String(custObj?.customer_code || "");
    if (code) {
      page.drawText(`Code: ${code}`, { x: left, y, size: 10, font });
      y -= 12;
    }

    const addr = String(custObj?.address || "");
    if (addr) {
      page.drawText(addr.slice(0, 90), { x: left, y, size: 10, font });
      y -= 12;
    }

    const phone = String(custObj?.phone || "");
    const email = String(custObj?.email || "");
    const line = [phone ? `Tel: ${phone}` : "", email ? email : ""].filter(Boolean).join("  •  ");
    if (line) {
      page.drawText(line.slice(0, 110), { x: left, y, size: 9, font });
      y -= 16;
    } else {
      y -= 8;
    }

    // Table header
    const col = { sn: left, desc: left + 28, qty: 360, unit: 418, vat: 470, total: 520 };
    page.drawText("#", { x: col.sn, y, size: 10, font: bold });
    page.drawText("Description", { x: col.desc, y, size: 10, font: bold });
    page.drawText("Qty", { x: col.qty, y, size: 10, font: bold });
    page.drawText("Unit", { x: col.unit, y, size: 10, font: bold });
    page.drawText("VAT", { x: col.vat, y, size: 10, font: bold });
    page.drawText("Total", { x: col.total, y, size: 10, font: bold });
    y -= 14;

    const list = (items || []) as any[];

    for (let i = 0; i < list.length; i++) {
      const it = list[i];
      const pname = String(it.products?.name || "—");
      const pcode = String(it.products?.item_code || it.products?.sku || "");

      page.drawText(String(i + 1), { x: col.sn, y, size: 10, font });
      page.drawText(pname.slice(0, 45), { x: col.desc, y, size: 10, font: bold });

      if (pcode) page.drawText(pcode.slice(0, 35), { x: col.desc, y: y - 11, size: 8, font });

      page.drawText(String(it.total_qty ?? 0), { x: col.qty, y, size: 10, font });
      page.drawText(money(it.unit_price_excl_vat), { x: col.unit, y, size: 10, font });
      page.drawText(money(it.unit_vat), { x: col.vat, y, size: 10, font });
      page.drawText(money(it.line_total), { x: col.total, y, size: 10, font });

      y -= pcode ? 22 : 14;
      if (y < 150) break;
    }

    // Totals
    const sub = money((cn as any).subtotal);
    const vat = money((cn as any).vat_amount);
    const tot = money((cn as any).total_amount);

    page.drawText("Subtotal", { x: 400, y: 140, size: 10, font });
    page.drawText(sub, { x: 520, y: 140, size: 10, font: bold });

    page.drawText("VAT", { x: 400, y: 124, size: 10, font });
    page.drawText(vat, { x: 520, y: 124, size: 10, font: bold });

    page.drawText("TOTAL", { x: 400, y: 106, size: 11, font: bold });
    page.drawText(tot, { x: 520, y: 106, size: 11, font: bold });

    // Footer
    page.drawText(`Status: ${String((cn as any).status || "")}`, { x: left, y: 60, size: 9, font });
    page.drawText("System generated credit note.", { x: left, y: 45, size: 9, font });

    const bytes = await pdf.save();

     // ✅ Node-safe body for Response
      const body = Buffer.from(bytes);

       return new Response(body, {
        headers: {
         "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="credit_note_${docNo}.pdf"`,
      },
   });

  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || "Server error" }), { status: 500 });
  }
}
