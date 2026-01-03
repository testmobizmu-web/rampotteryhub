import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

export const dynamic = "force-dynamic";

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !(service || anon)) throw new Error("Missing Supabase env");
  return createClient(url, service || anon!, { auth: { persistSession: false } });
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const supabase = supaAdmin();
    const { data, error } = await supabase
      .from("products")
      .select("id, sku, name")
      .order("name", { ascending: true })
      .limit(5000);

    if (error) throw error;
    return NextResponse.json({ ok: true, products: data || [] });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed" }, { status: 500 });
  }
}
