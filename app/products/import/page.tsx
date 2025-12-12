"use client";

import { useState } from "react";

export default function ProductImportPage() {
  const [status, setStatus] = useState<
    "idle" | "uploading" | "done" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem(
      "file"
    ) as HTMLInputElement | null;

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      alert("Please choose an Excel file first.");
      return;
    }

    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append("file", file);
    formData.append("importType", "PRICE_STOCK_UPDATE");

    setStatus("uploading");
    setMessage("");

    try {
      const res = await fetch("/api/import-products", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Import failed");
      }

      setStatus("done");
      setMessage(
        `Import completed successfully. Inserted: ${data.inserted}, Updated: ${data.updated}, Stock adjusted: ${data.adjusted}.`
      );
      form.reset();
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setMessage(err.message || "Something went wrong during import.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-2 text-2xl font-semibold">
          Import Product Price & Stock (Excel)
        </h1>
        <p className="mb-4 text-sm text-slate-600">
          Upload the latest <strong>Ram Pottery</strong> Excel file. Existing
          items are updated by <strong>Product Ref</strong>. New items are
          created. If the sheet contains a{" "}
          <strong>Current Stock / Stock / Qty</strong> column, stock will be
          adjusted automatically.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Excel file (.xlsx)
            </label>
            <input
              type="file"
              name="file"
              accept=".xlsx,.xls"
              className="block w-full cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-slate-500">
              Expected headers (case-insensitive):{" "}
              <code>Product Ref</code>, <code>Product Name</code>,{" "}
              <code>Units / Box</code>, <code>Price / Pcs (Rs)</code>, optional{" "}
              <code>Current Stock</code>.
            </p>
          </div>

          <button
            type="submit"
            disabled={status === "uploading"}
            className="inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "uploading" ? "Uploading…" : "Upload & Import"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
              status === "error"
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-emerald-300 bg-emerald-50 text-emerald-700"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
