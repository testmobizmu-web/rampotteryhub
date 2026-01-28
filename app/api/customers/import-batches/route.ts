// app/api/customers/import-batches/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !(service || anon)) throw new Error("Missing Supabase env");
  return createClient(url, service || anon!);
}

function digitsOnly(v: any) {
  return String(v ?? "").replace(/[^\d]/g, "");
}

function normalizeMu230(v: any): string | null {
  const d = digitsOnly(v);
  if (!d) return null;
  if (d.length === 8) return "230" + d;
  if (d.length === 11 && d.startsWith("230")) return d;
  return null;
}

function isLikelyMuMobile(v: any) {
  const d = digitsOnly(v);
  const local = d.length === 11 && d.startsWith("230") ? d.slice(3) : d;
  // mobile numbers in MU commonly start with 5/7/8/9 (safe heuristic)
  return local.length === 8 && /^[5789]/.test(local);
}


export async function GET(req: NextRequest) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const supabase = supaAdmin();

    const { data, error } = await supabase
      .from("customer_import_batches")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json({ ok: true, batches: data || [] });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed" }, { status: 500 });
  }
}
