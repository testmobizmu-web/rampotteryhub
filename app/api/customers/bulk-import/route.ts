// app/api/customers/bulk-import/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromHeader } from "@/lib/payments";

type RowIn = Record<string, any>;

type NormalizedCustomer = {
  customer_code: string;
  name: string;            // from customer_name
  client: string | null;   // from client_name
  address: string | null;
  phone: string | null;    // from phone_no
  whatsapp: string | null; // from whatsapp_no
  brn: string | null;
  vat_no: string | null;
  discount_percent: number; // from discount (10 / 10%)
};

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !(service || anon)) throw new Error("Missing Supabase env");
  return createClient(url, service || anon!, { auth: { persistSession: false } });
}

function isAdminOrManager(user: any) {
  const role = String(user?.role || "").toLowerCase();
  return role === "admin" || role === "manager";
}

function normKey(k: string) {
  return String(k || "").trim().toLowerCase();
}

function getByAliases(r: RowIn, aliases: string[]) {
  const keys = Object.keys(r);
  const foundKey = keys.find((k) => aliases.includes(normKey(k)));
  const v = foundKey ? r[foundKey] : null;
  const s = v == null ? "" : String(v).trim();
  return s.length ? s : "";
}

function parseDiscount(v: any): number {
  const s = String(v ?? "").trim();
  if (!s) return 0;
  const cleaned = s.replace("%", "").trim();
  const num = Number(cleaned);
  if (!Number.isFinite(num)) return 0;
  // clamp 0..100
  return Math.min(Math.max(num, 0), 100);
}

/** Accept your Excel headers exactly + tolerant aliases */
function normalizeRow(r: RowIn): NormalizedCustomer {
  const customer_code = getByAliases(r, ["customer_code", "code", "customer code"]);

  const name = getByAliases(r, ["customer_name", "name", "customer", "customer name"]);
  const client = getByAliases(r, ["client_name", "client", "client name"]);

  const address = getByAliases(r, ["address", "addr"]);

  const phone = getByAliases(r, ["phone_no", "phone", "phone number", "tel", "mobile"]);
  const whatsapp = getByAliases(r, ["whatsapp_no", "whatsapp", "whatsapp number"]);

  const brn = getByAliases(r, ["brn", "brn_no", "brn number"]);
  const vat_no = getByAliases(r, ["vat_no", "vat", "vat number"]);

  const discountRaw = getByAliases(r, ["discount", "discount_percent", "discount %", "disc"]);
  const discount_percent = parseDiscount(discountRaw);

  return {
    customer_code: customer_code.trim().toUpperCase(),
    name,
    client: client || null,
    address: address || null,
    phone: phone || null,
    whatsapp: whatsapp || null,
    brn: brn || null,
    vat_no: vat_no || null,
    discount_percent,
  };
}

/** Required: customer_code + customer_name */
const REQUIRED_ANY_OF = [
  { label: "customer_code", anyOf: ["customer_code", "code", "customer code"] },
  { label: "customer_name", anyOf: ["customer_name", "name", "customer", "customer name"] },
] as const;

function validateHeaders(rows: RowIn[]) {
  if (!rows.length) return { ok: false, error: "No rows found in file." };

  const keys = Object.keys(rows[0] || {}).map(normKey);

  const missing = REQUIRED_ANY_OF
    .filter((r) => !r.anyOf.some((h) => keys.includes(h)))
    .map((r) => r.label);

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
    const clearExisting = Boolean(body?.clearExisting); // ✅ archive all customers first (IMPORT only)
    const filename = String(body?.filename || "upload");
    const fileType = String(body?.fileType || "");
    const fileSize = Number(body?.fileSize || 0);
    const rows: RowIn[] = Array.isArray(body?.rows) ? body.rows : [];

    const headCheck = validateHeaders(rows);
    if (!headCheck.ok) return NextResponse.json({ ok: false, error: headCheck.error }, { status: 400 });

    const normalized: NormalizedCustomer[] = rows.map(normalizeRow);

    // Row validations
    const errors: { row: number; field?: string; message: string }[] = [];
    const seen = new Set<string>();

    normalized.forEach((r, idx) => {
      const rowNo = idx + 2;

      if (!r.customer_code) errors.push({ row: rowNo, field: "customer_code", message: "Customer code is required" });
      if (!r.name) errors.push({ row: rowNo, field: "customer_name", message: "Customer name is required" });

      const key = (r.customer_code || "").trim().toLowerCase();
      if (key) {
        if (seen.has(key)) errors.push({ row: rowNo, field: "customer_code", message: "Duplicate customer_code in file" });
        seen.add(key);
      }

      // discount validation (optional)
      if (r.discount_percent < 0 || r.discount_percent > 100) {
        errors.push({ row: rowNo, field: "discount", message: "Discount must be between 0 and 100" });
      }
    });

    const supabase = supaAdmin();

    // Check DB duplicates only if IMPORT + not clearing existing
    if (mode === "IMPORT" && !clearExisting) {
      const codes = Array.from(
        new Set(normalized.map((r) => r.customer_code).filter(Boolean).map((s) => s.trim()))
      );

      const existingCodes = new Set<string>();
      if (codes.length) {
        const chunkSize = 200;
        for (let i = 0; i < codes.length; i += chunkSize) {
          const chunk = codes.slice(i, i + chunkSize);
          const { data, error } = await supabase.from("customers").select("customer_code").in("customer_code", chunk);
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
    }

    const validRows = normalized.filter((_, idx) => {
      const rowNo = idx + 2;
      return !errors.some((e) => e.row === rowNo);
    });

    const summary = {
      rowCount: normalized.length,
      validCount: validRows.length,
      errorCount: errors.length,
    };

    // DRY RUN
    if (mode === "DRY_RUN") {
      return NextResponse.json({
        ok: true,
        mode,
        summary,
        preview: validRows.slice(0, 50),
        errors: errors.slice(0, 300),
        acceptedHeaders: {
          required: ["customer_code", "customer_name"],
          optional: ["client_name", "address", "phone_no", "whatsapp_no", "brn", "vat_no", "discount"],
        },
      });
    }

    // IMPORT permissions
    if (!isAdminOrManager(user)) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    // ✅ clear existing customers (IMPORT only)
    // ✅ IMPORTANT: archive (is_active=false), NEVER delete (FK safe)
    if (clearExisting) {
      const { error: archErr } = await supabase
        .from("customers")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .not("id", "is", null);

      if (archErr) throw archErr;
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

    // Map to DB columns
    const payload = validRows.map((r) => ({
      customer_code: r.customer_code,
      name: r.name,
      client: r.client,
      address: r.address,
      phone: r.phone,
      whatsapp: r.whatsapp,
      brn: r.brn,
      vat_no: r.vat_no,
      discount_percent: r.discount_percent, // ✅ new
      is_active: true, // ✅ new customers active
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
      clearedExisting: clearExisting,
      summary,
      errors: errors.slice(0, 300),
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: err?.message || "Bulk import failed" }, { status: 500 });
  }
}

