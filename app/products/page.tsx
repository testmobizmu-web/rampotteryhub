import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

export const revalidate = 0; // always fetch fresh products

export default async function ProductsPage() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("sku", { ascending: true });

  if (error) {
    console.error(error);
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow">
          <h1 className="mb-4 text-2xl font-semibold">Products</h1>
          <p className="text-sm text-red-700">
            Error loading products: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">
              Ram Pottery – Price List 2025
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Same structure as your Excel: SN, Product Ref, Image, Description,
              Units / Box, Price / Pcs (Rs).
            </p>
          </div>
          <a
            href="/products/import"
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Import Excel
          </a>
        </div>

        <div className="mb-3 text-sm text-slate-600">
          Total products: <strong>{products?.length ?? 0}</strong>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 text-left">
                <th className="border px-3 py-2 w-[50px]">SN</th>
                <th className="border px-3 py-2 w-[110px]">Product Ref:</th>
                <th className="border px-3 py-2 w-[120px]">Product Image</th>
                <th className="border px-3 py-2">Product Description</th>
                <th className="border px-3 py-2 w-[110px]">Units / Box</th>
                <th className="border px-3 py-2 w-[140px]">
                  Price / Pcs (Rs)
                </th>
              </tr>
            </thead>
            <tbody>
              {products?.map((p: any, index: number) => {
                const imageUrl = (p as any).image_url as
                  | string
                  | null
                  | undefined; // optional future field

                return (
                  <tr key={p.id} className="align-top hover:bg-slate-50">
                    {/* SN */}
                    <td className="border px-3 py-2 text-center">
                      {index + 1}
                    </td>

                    {/* Product Ref */}
                    <td className="border px-3 py-2 font-medium">
                      {p.sku}
                    </td>

                    {/* Product Image (placeholder until we wire real images) */}
                    <td className="border px-3 py-2">
                      {imageUrl ? (
                        <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                          <Image
                            src={imageUrl}
                            alt={p.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-slate-300 text-[11px] text-slate-400">
                          No image
                        </div>
                      )}
                    </td>

                    {/* Product Description */}
                    <td className="border px-3 py-2">
                      {p.name || <span className="text-slate-400">—</span>}
                    </td>

                    {/* Units / Box */}
                    <td className="border px-3 py-2 text-center">
                      {p.units_per_box ?? (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Price / Pcs (Rs) */}
                    <td className="border px-3 py-2 text-center">
                      {p.selling_price != null ? (
                        <>Rs {Number(p.selling_price).toFixed(2)}</>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Note: Product images are reserved for future use. We can later add an{" "}
          <code>image_url</code> field or storage upload so each Product Ref
          shows the same picture as in your Excel.
        </p>
      </div>
    </div>
  );
}
