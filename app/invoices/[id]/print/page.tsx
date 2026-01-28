import RamPotteryDoc from "@/components/print/RamPotteryDoc";
import { rpFetch } from "@/lib/rpFetch";

export default async function PrintInvoicePage({ params }: { params: { id: string } }) {
  const res = await rpFetch(`/api/invoices/${params.id}`, { cache: "no-store" });
  const json = await res.json();

  if (!json?.ok) {
    return <div style={{ padding: 24 }}>Invoice not found.</div>;
  }

  const inv = json.invoice;
  const items = json.items || [];

  const docItems = items.map((it: any, i: number) => ({
    sn: i + 1,
    item_code: it.products?.item_code || "",
    uom: it.uom || "BOX",
    box_qty: it.box_qty ?? it.pcs_qty ?? 0,
    units_per_box: it.units_per_box ?? 1,
    total_qty: it.total_qty ?? 0,
    description: it.description || it.products?.name || "",
    unit_price_excl_vat: it.unit_price_excl_vat ?? 0,
    unit_vat: it.unit_vat ?? 0,
    unit_price_incl_vat: it.unit_price_incl_vat ?? 0,
    line_total: it.line_total ?? 0,
  }));

  return (
    <div className="rp-print-page">
      <RamPotteryDoc
        variant="INVOICE"
        docNoLabel="INVOICE NO:"
        docNoValue={String(inv.invoice_number || "(Auto when saved)")}
        dateLabel="DATE:"
        dateValue={String(inv.invoice_date || "")}
        purchaseOrderLabel="PURCHASE ORDER NO:"
        purchaseOrderValue={inv.purchase_order_no || ""}

        salesRepName={inv.sales_rep || ""}
        salesRepPhone={inv.sales_rep_phone || ""}

        customer={{
          name: inv.customer_name || "",
          address: inv.customer_address || "",
          phone: inv.customer_phone || "",
          brn: inv.customer_brn || "",
          vat_no: inv.customer_vat_no || "",
          customer_code: inv.customer_code || "",
        }}
        company={{ brn: "C17144377", vat_no: "123456789" }}
        items={docItems}
        totals={{
          subtotal: inv.subtotal_ex ?? 0,
          vatPercentLabel: "VAT",
          vat_amount: inv.vat_amount ?? 0,
          total_amount: inv.total_amount ?? 0,
          previous_balance: inv.previous_balance ?? 0,
          amount_paid: inv.amount_paid ?? 0,
          balance_remaining: inv.balance_remaining ?? 0,
          discount_percent: inv.discount_percent ?? 0,
          discount_amount: inv.discount_amount ?? 0,
        }}
        preparedBy={inv.prepared_by || "Manish"}
        deliveredBy={inv.delivered_by || ""}
      />
    </div>
  );
}
