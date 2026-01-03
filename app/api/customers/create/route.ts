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

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
    }

    const name = toStr(body.name);
    const phone = toStr(body.phone) || null;
    const email = toStr(body.email) || null;
    const address = toStr(body.address) || null;
    const client = toStr(body.client) || null;
    const customer_code = toStr(body.customer_code) || null;
    const opening_balance = toNum(body.opening_balance ?? 0, 0);

    if (!name) {
      return NextResponse.json({ ok: false, error: "Customer name is required." }, { status: 400 });
    }

    if (email && !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Invalid email address." }, { status: 400 });
    }

    const supabase = supaAdmin();

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

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("customers")
      .insert([
        {
          name,
          phone,
          email,
          address,
          client,
          customer_code,
          opening_balance,
          created_at: now,
          updated_at: now,
        },
      ])
      .select("id, name, phone, email, address, opening_balance, client, customer_code")
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, customer: data });
  } catch (err: any) {
    console.error("Create customer error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to create customer" },
      { status: 500 }
    );
  }
}
