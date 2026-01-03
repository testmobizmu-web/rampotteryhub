// app/invoices/new/page.tsx
import { Suspense } from "react";
import NewInvoiceClient from "./NewInvoiceClient";

export const dynamic = "force-dynamic"; // prevents build from trying to prerender this page

function Loading() {
  return (
    <div className="rp-shell">
      <div className="rp-topbar">
        <div className="rp-topbar__title">New Invoice</div>
      </div>

      <div className="rp-card" style={{ marginTop: 14 }}>
        <div className="rp-muted">Loading invoice editor…</div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <NewInvoiceClient />
    </Suspense>
  );
}
