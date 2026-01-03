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
    // ✅ Same auth pattern used across your APIs
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const supabase = supaAdmin();

    // Optional filters
    const activeOnly = (req.nextUrl.searchParams.get("activeOnly") || "0") === "1";
    const q = (req.nextUrl.searchParams.get("q") || "").trim();
    const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get("limit") || 2000), 1), 5000);

    // ✅ Columns match your current schema usage
    let query = supabase
      .from("customers")
      .select("id, name, phone, email, address, opening_balance, client, customer_code")
      .order("name", { ascending: true })
      .limit(limit);

    // If you actually have is_active column, this works. If not, keep activeOnly=0 (default).
    if (activeOnly) query = query.eq("is_active", true as any);

    // Basic search (safe even if some columns are null)
    if (q) {
      // searches name OR phone OR customer_code
      // Note: ilike works on text columns; this is standard Supabase.
      query = query.or(
        `name.ilike.%${q}%,phone.ilike.%${q}%,customer_code.ilike.%${q}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // ✅ Normalize output so UI never breaks on nulls
    const customers = (data || []).map((c: any) => ({
      id: n(c.id),
      name: c.name ?? "",
      phone: c.phone ?? "",
      email: c.email ?? "",
      address: c.address ?? "",
      opening_balance: n(c.opening_balance, 0),
      client: c.client ?? "",
      customer_code: c.customer_code ?? "",
    }));

    return NextResponse.json({ ok: true, customers });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load customers" },
      { status: 500 }
    );
  }
}
