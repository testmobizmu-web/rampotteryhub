import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) throw new Error("Missing Supabase env for server client.");
  return createClient(url, key, { auth: { persistSession: false } });
}

function up(v: unknown) {
  return String(v ?? "").trim().toUpperCase();
}
function str(v: unknown) {
  return String(v ?? "").trim();
}
function num(v: unknown): number {
  const n = Number(String(v ?? "").replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

/** Small CSV parser (supports quotes, commas, CRLF) */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      continue;
    }

    if (c === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (c === "\n") {
      row.push(field);
      field = "";
      row = row.map((x) => (x.endsWith("\r") ? x.slice(0, -1) : x));
      const isEmpty = row.every((x) => !str(x));
      if (!isEmpty) rows.push(row);
      row = [];
      continue;
    }

    field += c;
  }

  row.push(field);
  row = row.map((x) => (x.endsWith("\r") ? x.slice(0, -1) : x));
  const isEmpty = row.every((x) => !str(x));
  if (!isEmpty) rows.push(row);

  return rows;
}

function normalizeHeader(h: string) {
  return str(h).toLowerCase().replace(/\s+/g, "_");
}

type ProductPayload = {
  item_code: string;
  name: string;
  price_excl_vat: number;
  vat_rate?: number | null;
  unit?: string | null;
  category?: string | null;
  is_active?: boolean | null;
};

function baseNameUpper(fileName: string) {
  const just = (fileName || "").split("/").pop() || fileName;
  const dot = just.lastIndexOf(".");
  const base = dot >= 0 ? just.slice(0, dot) : just;
  return base.trim().toUpperCase();
}

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, idx: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let i = 0;

  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () =>
    worker()
  );
  await Promise.all(workers);
  return results;
}

export async function POST(req: NextRequest) {
  try {
    const ct = req.headers.get("content-type") || "";

    let csvText = "";
    const imageFiles: File[] = [];

    // Accept multipart file upload (CSV + images)
    if (ct.includes("multipart/form-data")) {
      const form = await req.formData();

      const file = form.get("file");
      if (!file || !(file instanceof File)) {
        return NextResponse.json(
          { ok: false, error: "Missing file" },
          { status: 400 }
        );
      }
      csvText = await file.text();

      // images can come as "images" (multiple) or "image"
      const imgs = [
        ...form.getAll("images"),
        ...form.getAll("image"),
      ].filter((x) => x instanceof File) as File[];

      for (const f of imgs) {
        // keep only images
        if (typeof f.type === "string" && f.type.startsWith("image/")) {
          imageFiles.push(f);
        }
      }
    } else {
      // Or JSON body { csvText }
      const body = (await req.json().catch(() => null)) as any;
      csvText = String(body?.csvText ?? "");
    }

    if (!csvText.trim()) {
      return NextResponse.json(
        { ok: false, error: "Empty CSV" },
        { status: 400 }
      );
    }

    const matrix = parseCsv(csvText);
    if (matrix.length < 2) {
      return NextResponse.json(
        { ok: false, error: "CSV has no data rows" },
        { status: 400 }
      );
    }

    const headers = matrix[0].map((h) => normalizeHeader(h));

    const idxCode = headers.findIndex(
      (h) => h === "item_code" || h === "code" || h === "item"
    );
    const idxName = headers.findIndex(
      (h) => h === "name" || h === "product_name"
    );
    const idxPrice = headers.findIndex(
      (h) =>
        h === "price_excl_vat" || h === "price" || h === "unit_price"
    );
    const idxVat = headers.findIndex(
      (h) => h === "vat_rate" || h === "vat" || h === "vat%"
    );
    const idxUnit = headers.findIndex((h) => h === "unit");
    const idxCat = headers.findIndex((h) => h === "category");
    const idxActive = headers.findIndex(
      (h) => h === "is_active" || h === "active"
    );

    if (idxCode === -1 || idxName === -1 || idxPrice === -1) {
      return NextResponse.json(
        { ok: false, error: "CSV must include item_code, name, price_excl_vat" },
        { status: 400 }
      );
    }

    const rows: ProductPayload[] = [];
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 1; i < matrix.length; i++) {
      const r = matrix[i];

      const item_code = up(r[idxCode]);
      const name = str(r[idxName]);
      const price_excl_vat = num(r[idxPrice]);

      if (!item_code) {
        errors.push({ row: i, error: "Missing item_code" });
        continue;
      }
      if (!name) {
        errors.push({ row: i, error: "Missing name" });
        continue;
      }
      if (!(price_excl_vat >= 0)) {
        errors.push({ row: i, error: "Invalid price_excl_vat" });
        continue;
      }

      const vat_rate = idxVat !== -1 ? num(r[idxVat]) : null;
      const unit = idxUnit !== -1 ? str(r[idxUnit]) || null : null;
      const category = idxCat !== -1 ? str(r[idxCat]) || null : null;

      let is_active: boolean | null = null;
      if (idxActive !== -1) {
        const v = str(r[idxActive]).toLowerCase();
        is_active = v === "1" || v === "true" || v === "yes" || v === "y";
      }

      rows.push({
        item_code,
        name,
        price_excl_vat,
        vat_rate: idxVat !== -1 ? vat_rate : null,
        unit,
        category,
        is_active,
      });
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No valid rows", errors },
        { status: 400 }
      );
    }

    const supabase = supaAdmin();

    // 1) Upsert products by item_code
    {
      const { error } = await supabase
        .from("products")
        .upsert(rows as any, { onConflict: "item_code" });

      if (error) {
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 500 }
        );
      }
    }

    // 2) Upload images to Supabase Storage and update products.image_url
    const bucket = "product-images";
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const uploaded: Array<{ item_code: string; path: string; publicUrl: string }> = [];
    const images_failed: Array<{ file: string; error: string }> = [];
    const db_image_errors: Array<{ item_code: string; error: string }> = [];

    // Build map: ITEM_CODE -> File (based on filename base)
    const imgMap = new Map<string, File>();
    for (const f of imageFiles) {
      const code = baseNameUpper(f.name);
      if (code) imgMap.set(code, f);
    }

    // Upload each selected image (limit concurrency)
    const imgEntries = Array.from(imgMap.entries());
    await mapLimit(imgEntries, 4, async ([item_code, file]) => {
      try {
        // keep original extension
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const safeExt = ext.replace(/[^a-z0-9]/g, "") || "jpg";

        const path = `${item_code}.${safeExt}`;

        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        const { error: upErr } = await supabase.storage
          .from(bucket)
          .upload(path, bytes, {
            contentType: file.type || "image/jpeg",
            upsert: true,
          });

        if (upErr) {
          images_failed.push({ file: file.name, error: upErr.message });
          return;
        }

        const publicUrl = `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;
        uploaded.push({ item_code, path, publicUrl });
      } catch (e: any) {
        images_failed.push({ file: file.name, error: e?.message || "Upload error" });
      }
    });

    // Update products.image_url for uploaded item_codes (limit concurrency)
    await mapLimit(uploaded, 6, async (u) => {
      const { error } = await supabase
        .from("products")
        .update({ image_url: u.publicUrl })
        .eq("item_code", u.item_code);

      if (error) db_image_errors.push({ item_code: u.item_code, error: error.message });
    });

    return NextResponse.json({
      ok: true,
      imported: rows.length,
      rejected: errors.length,
      errors: errors.slice(0, 50),

      images_received: imageFiles.length,
      images_detected: imgMap.size,
      images_uploaded: uploaded.length,
      images_failed,
      db_image_errors,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
