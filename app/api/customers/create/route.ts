import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

export const dynamic = "force-dynamic";

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

function toStr(v: any) {
  return String(v ?? "").trim();
}

function toNum(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function digitsOnly(v: any) {
  return String(v ?? "").replace(/[^\d]/g, "");
}

// Mauritius only: store as "230" + 8 digits (11 digits total)
function normalizeMuWhatsApp(raw: any) {
  const d = digitsOnly(raw);
  if (!d) return null;

  if (d.length === 8) return "230" + d;
  if (d.startsWith("230") && d.length === 11) return d;

  return "__INVALID__";
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });

    const name = toStr(body.name);
    if (!name) return NextResponse.json({ ok: false, error: "Customer name is required." }, { status: 400 });

    const email = toStr(body.email) || null;
    if (email && !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Invalid email address." }, { status: 400 });
    }

    const customer_code = toStr(body.customer_code) || null;

    // ✅ normalize + validate whatsapp
    const whatsappNorm = normalizeMuWhatsApp(body.whatsapp);
    if (whatsappNorm === "__INVALID__") {
      return NextResponse.json(
        { ok: false, error: "Invalid WhatsApp number. Mauritius only: 8 digits or 230 + 8 digits." },
        { status: 400 }
      );
    }

    const payload = {
      name,
      phone: toStr(body.phone) || null,
      email,
      address: toStr(body.address) || null,
      client: toStr(body.client) || null,
      customer_code,
      opening_balance: toNum(body.opening_balance ?? 0, 0),

      // ✅ new fields
      brn: toStr(body.brn) || null,
      vat_no: toStr(body.vat_no) || null,
      client_name: toStr(body.client_name) || null,
      whatsapp: whatsappNorm, // null or 230XXXXXXXX
      discount_percent: toNum(body.discount_percent ?? 0, 0),

      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = supaAdmin();

    // ✅ unique code check
    if (customer_code) {
      const { data: existing, error: exErr } = await supabase
        .from("customers")
        .select("id")
        .eq("customer_code", customer_code)
        .limit(1);

      if (exErr) throw exErr;
      if (existing && existing.length > 0) {
        return NextResponse.json(
          { ok: false, error: "Customer code already exists. Please use a unique code." },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from("customers")
      .insert([payload])
      .select(
        "id, name, phone, email, address, opening_balance, client, customer_code, brn, vat_no, client_name, whatsapp, discount_percent"
      )
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, customer: data });
  } catch (err: any) {
    console.error("Create customer error:", err);
    return NextResponse.json({ ok: false, error: err?.message || "Failed to create customer" }, { status: 500 });
  }
}
