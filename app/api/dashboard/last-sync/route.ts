import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Fetch latest updated_at across key tables
    const tables = ["invoices", "payments", "credit_notes"];

    let latest: string | null = null;

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select("updated_at")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) continue;

      if (data?.updated_at) {
        if (!latest || new Date(data.updated_at) > new Date(latest)) {
          latest = data.updated_at;
        }
      }
    }

    return NextResponse.json({
      lastSync: latest ?? null,
    });
  } catch {
    return NextResponse.json(
      { lastSync: null },
      { status: 500 }
    );
  }
}
