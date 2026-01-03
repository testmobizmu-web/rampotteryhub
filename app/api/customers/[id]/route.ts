
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !(service || anon)) {
    throw new Error("Missing Supabase env");
  }

  return createClient(url, service || anon!, { auth: { persistSession: false } });
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await ctx.params;
    const cid = Number(id);
    if (!Number.isFinite(cid) || cid <= 0) {
      return NextResponse.json(
        { ok: false, error: "Invalid customer id" },
        { status: 400 }
      );
    }

    const supabase = supaAdmin();

    // 🔒 SAFETY: block delete if invoices exist
    const { count } = await supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", cid);

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "Cannot delete customer with existing invoices.",
        },
        { status: 409 }
      );
    }

    // ✅ delete
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", cid);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Delete failed" },
      { status: 500 }
    );
  }
}
