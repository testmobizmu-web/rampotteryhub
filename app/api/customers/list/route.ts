// app/api/customers/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

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

function n(v: any, fallback = 0) {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const supabase = supaAdmin();

    const showArchived = (req.nextUrl.searchParams.get("showArchived") || "0") === "1";
    const q = (req.nextUrl.searchParams.get("q") || "").trim();
    const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get("limit") || 2000), 1), 5000);

    let query = supabase
      .from("customers")
      .select(
        "id, customer_code, name, client, address, phone, whatsapp, brn, vat_no, discount_percent, is_active, created_at"
      )
      .order("name", { ascending: true })
      .limit(limit);

    // Default: only active customers
    if (!showArchived) query = query.eq("is_active", true);

    // Optional search
    if (q) {
      query = query.or(
        `name.ilike.%${q}%,phone.ilike.%${q}%,whatsapp.ilike.%${q}%,customer_code.ilike.%${q}%,client.ilike.%${q}%,brn.ilike.%${q}%,vat_no.ilike.%${q}%`
      );
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    const customers = (data || []).map((c: any) => ({
      id: n(c.id),
      customer_code: c.customer_code ?? "",
      name: c.name ?? "",
      client: c.client ?? "",
      address: c.address ?? "",
      phone: c.phone ?? "",
      whatsapp: c.whatsapp ?? "",
      brn: c.brn ?? "",
      vat_no: c.vat_no ?? "",
      discount_percent: n(c.discount_percent, 0),
      is_active: Boolean(c.is_active),
      created_at: c.created_at ?? null,
    }));

    return NextResponse.json({ ok: true, customers });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed to load customers" }, { status: 500 });
  }
}


