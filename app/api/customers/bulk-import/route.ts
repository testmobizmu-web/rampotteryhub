// app/api/customers/bulk-import/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

type RowIn = Record<string, any>;

type NormalizedCustomer = {
  customer_code: string;
  name: string;
  address: string | null;
  phone: string | null;
  brn: string | null;
  vat_no: string | null;
  whatsapp: string | null;
};

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !(service || anon)) throw new Error("Missing Supabase env");
  return createClient(url, service || anon!);
}

function isAdminOrManager(user: any) {
  const role = String(user?.role || "").toLowerCase();
  return role === "admin" || role === "manager";
}

const REQUIRED = ["customer_code", "name", "address", "phone", "brn", "vat_no", "whatsapp"] as const;

function normKey(k: string) {
  return String(k || "").trim().toLowerCase();
}

function normalizeRow(r: RowIn): NormalizedCustomer {
  const get = (key: string) => {
    const foundKey = Object.keys(r).find((k) => normKey(k) === key);
    const v = foundKey ? r[foundKey] : null;
    const s = v == null ? "" : String(v).trim();
    return s.length ? s : "";
  };

  const customer_code = get("customer_code");
  const name = get("name");
  const address = get("address");
  const phone = get("phone");
  const brn = get("brn");
  const vat_no = get("vat_no");
  const whatsapp = get("whatsapp");

  return {
    customer_code,
    name,
    address: address || null,
    phone: phone || null,
    brn: brn || null,
    vat_no: vat_no || null,
    whatsapp: whatsapp || null,
  };
}

function validateHeaders(rows: RowIn[]) {
  if (!rows.length) return { ok: false, error: "No rows found in file." };

  const keys = Object.keys(rows[0] || {}).map(normKey);
  const missing = REQUIRED.filter((h) => !keys.includes(h));
  if (missing.length) {
    return { ok: false, error: `Missing required columns: ${missing.join(", ")}` };
  }
  return { ok: true as const };
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromHeader(req.headers.get("x-rp-user"));
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const mode = String(body?.mode || "DRY_RUN").toUpperCase(); // DRY_RUN | IMPORT
    const filename = String(body?.filename || "upload");
    const fileType = String(body?.fileType || "");
    const fileSize = Number(body?.fileSize || 0);
    const rows: RowIn[] = Array.isArray(body?.rows) ? body.rows : [];

    const headCheck = validateHeaders(rows);
    if (!headCheck.ok) return NextResponse.json({ ok: false, error: headCheck.error }, { status: 400 });

    // Normalize
    const normalized: NormalizedCustomer[] = rows.map(normalizeRow);

    // Row validations
    const errors: { row: number; field?: string; message: string }[] = [];
    const seen = new Set<string>();

    normalized.forEach((r, idx) => {
      const rowNo = idx + 2; // + header row
      if (!r.customer_code) errors.push({ row: rowNo, field: "customer_code", message: "Customer code is required" });
      if (!r.name) errors.push({ row: rowNo, field: "name", message: "Name is required" });

      const key = (r.customer_code || "").toLowerCase();
      if (key) {
        if (seen.has(key)) errors.push({ row: rowNo, field: "customer_code", message: "Duplicate customer_code in file" });
        seen.add(key);
      }
    });

    const supabase = supaAdmin();

    // Check duplicates against DB (customer_code)
    const codes = Array.from(
      new Set(normalized.map((r) => r.customer_code).filter(Boolean).map((s) => s.trim()))
    );

    let existingCodes = new Set<string>();
    if (codes.length) {
      // chunk query to avoid URL limits
      const chunkSize = 200;
      for (let i = 0; i < codes.length; i += chunkSize) {
        const chunk = codes.slice(i, i + chunkSize);
        const { data, error } = await supabase
          .from("customers")
          .select("customer_code")
          .in("customer_code", chunk);

        if (error) throw error;
        (data || []).forEach((x: any) => existingCodes.add(String(x.customer_code || "").toLowerCase()));
      }
    }

    normalized.forEach((r, idx) => {
      const rowNo = idx + 2;
      const key = (r.customer_code || "").toLowerCase();
      if (key && existingCodes.has(key)) {
        errors.push({ row: rowNo, field: "customer_code", message: "Customer code already exists in database" });
      }
    });

    const validRows = normalized.filter((r, idx) => {
      const rowNo = idx + 2;
      const hasRowErr = errors.some((e) => e.row === rowNo);
      return !hasRowErr;
    });

    const summary = {
      rowCount: normalized.length,
      validCount: validRows.length,
      errorCount: errors.length,
    };

    // DRY RUN: no DB write
    if (mode === "DRY_RUN") {
      return NextResponse.json({
        ok: true,
        mode,
        summary,
        preview: validRows.slice(0, 50),
        errors: errors.slice(0, 300),
      });
    }

    // IMPORT: admin/manager only
    if (!isAdminOrManager(user)) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    // Create batch log
    const { data: batch, error: batchErr } = await supabase
      .from("customer_import_batches")
      .insert({
        created_by: user?.username || user?.email || "unknown",
        filename,
        file_type: fileType,
        file_size: fileSize,
        mode: "IMPORT",
        row_count: summary.rowCount,
        valid_count: summary.validCount,
        error_count: summary.errorCount,
        status: "DONE",
      })
      .select("id")
      .single();

    if (batchErr) throw batchErr;

    const batchId = batch.id;

    // Insert valid customers (tag with batch id)
    // If you have unique constraint on customer_code, this is extra safety.
    const payload = validRows.map((r) => ({
      ...r,
      import_batch_id: batchId,
      import_source: filename,
    }));

    // chunk insert
    const insertChunk = 250;
    for (let i = 0; i < payload.length; i += insertChunk) {
      const chunk = payload.slice(i, i + insertChunk);
      const { error: insErr } = await supabase.from("customers").insert(chunk);
      if (insErr) throw insErr;
    }

    return NextResponse.json({
      ok: true,
      mode,
      batchId,
      summary,
      errors: errors.slice(0, 300),
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: err?.message || "Bulk import failed" }, { status: 500 });
  }
}
