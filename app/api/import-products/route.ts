import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import * as XLSX from "xlsx";

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const importType =
      (formData.get("importType") as string) || "PRICE_STOCK_UPDATE";

    if (!file) {
      return NextResponse.json(
        { ok: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Read Excel into memory
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // IMPORTANT: use row 10 as header row (index 9)
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
      defval: "",
      range: 9, // row 10 is header: SN, Product Ref:, Product Image, ...
    });

    let inserted = 0;
    let updated = 0;
    let adjusted = 0;

    for (const raw of rows) {
      // Normalise headers
      const normalized: Record<string, any> = {};
      for (const [key, value] of Object.entries(raw)) {
        normalized[normalizeHeader(key)] = value;
      }

      // === Map to your columns ===================================
      // Product Ref:  -> productref
      const sku = String(normalized["productref"] ?? "").trim();

      // Product Description -> productdescription
      const name = String(normalized["productdescription"] ?? "").trim();

      // Units / Box -> unitsbox
      const unitsPerBox =
        parseInt(String(normalized["unitsbox"] ?? "0"), 10) || 0;

      // Price  / Pcs (Rs) -> pricepcsrs
      const pricePcs =
        parseFloat(String(normalized["pricepcsrs"] ?? "0")) || 0;

      // Optional stock column (you can add later: "Current Stock")
      const stockRaw =
        normalized["currentstock"] ??
        normalized["stock"] ??
        normalized["qty"] ??
        "";
      const stockProvided =
        stockRaw !== "" && !Number.isNaN(Number(stockRaw as number));
      const newStock = stockProvided ? Number(stockRaw) : null;

      // Skip blank rows
      if (!sku || !name) continue;

      // Check if product already exists
      const { data: existing, error: existingError } = await supabase
        .from("products")
        .select("id,current_stock")
        .eq("sku", sku)
        .maybeSingle();

      if (existingError) throw existingError;

      if (!existing) {
        // INSERT new product
        const { data: insertedProduct, error: insertError } = await supabase
          .from("products")
          .insert({
            sku,
            name,
            units_per_box: unitsPerBox || null,
            selling_price: pricePcs,
            current_stock: newStock ?? 0,
            is_active: true,
          })
          .select("id,current_stock")
          .single();

        if (insertError) throw insertError;
        inserted++;

        // If initial stock provided, log IN movement
        if (stockProvided && newStock && newStock > 0) {
          await supabase.from("stock_movements").insert({
            product_id: insertedProduct.id,
            movement_type: "IN",
            quantity: newStock,
            reference_type: importType,
            notes: "Initial stock via Excel import",
          });
        }
      } else {
        // UPDATE existing product
        const { data: updatedProduct, error: updateError } = await supabase
          .from("products")
          .update({
            name,
            units_per_box: unitsPerBox || null,
            selling_price: pricePcs,
          })
          .eq("id", existing.id)
          .select("id,current_stock")
          .single();

        if (updateError) throw updateError;
        updated++;

        // Optional stock adjustment
        if (stockProvided && newStock !== null) {
          const currentStock = updatedProduct.current_stock ?? 0;
          const diff = newStock - currentStock;

          if (diff !== 0) {
            const movementType = diff > 0 ? "IN" : "OUT";

            const { error: moveError } = await supabase
              .from("stock_movements")
              .insert({
                product_id: updatedProduct.id,
                movement_type: movementType,
                quantity: Math.abs(diff),
                reference_type: "EXCEL_ADJUST",
                notes: "Stock adjusted via Excel import",
              });

            if (moveError) throw moveError;

            const { error: stockError } = await supabase
              .from("products")
              .update({ current_stock: newStock })
              .eq("id", updatedProduct.id);

            if (stockError) throw stockError;

            adjusted++;
          }
        }
      }
    }

    // Log import
    await supabase.from("excel_import_logs").insert({
      file_name: file.name,
      import_type: importType,
      notes: `Inserted: ${inserted}, Updated: ${updated}, Stock adjusted: ${adjusted}`,
    });

    return NextResponse.json({
      ok: true,
      inserted,
      updated,
      adjusted,
    });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Unexpected error during import" },
      { status: 500 }
    );
  }
}
