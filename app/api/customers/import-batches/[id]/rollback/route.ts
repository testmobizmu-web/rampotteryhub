// app/api/customers/import-batches/[id]/rollback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

export const dynamic = "force-dynamic";

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) throw new Error("Missing Supabase env");
  return createClient(url, service);
}

function isAdmin(user: any) {
  return String(user?.role || "").toLowerCase() === "admin";
}

/**
 * Rollback a batch import (admin-only).
 * Assumes your table `customer_import_batches` stores:
 * - id
 * - created_by (optional)
 * and your `customers` table stores:
 * - import_batch_id (nullable)  <-- used to delete/rollback safely
 *
 * If your schema differs, tell me your exact columns and I’ll adjust.
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> } // ✅ Next.js 16 expects Promise params
) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!isAdmin(user)) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await ctx.params; // ✅ MUST await
    const batchId = String(id || "").trim();
    if (!batchId) {
      return NextResponse.json({ ok: false, error: "Invalid batch id" }, { status: 400 });
    }

    const supabase = supaAdmin();

    // Optional: confirm batch exists
    const { data: batch, error: bErr } = await supabase
      .from("customer_import_batches")
      .select("id")
      .eq("id", batchId)
      .maybeSingle();

    if (bErr) {
      return NextResponse.json({ ok: false, error: bErr.message }, { status: 500 });
    }
    if (!batch) {
      return NextResponse.json({ ok: false, error: "Batch not found" }, { status: 404 });
    }

    // Delete customers created in this batch (requires customers.import_batch_id)
    const { error: archErr } = await supabase
    .from("customers")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("import_batch_id", batchId);

  if (archErr) {
    return NextResponse.json({ ok: false, error: archErr.message }, { status: 500 });
  }

    // Mark batch rolled back (optional fields)
    await supabase
      .from("customer_import_batches")
      .update({ status: "ROLLED_BACK", rolled_back_at: new Date().toISOString() })
      .eq("id", batchId);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
