import { Suspense } from "react";
import CustomerEditClient from "./CustomerEditClient";

export const dynamic = "force-dynamic";

function Loading() {
  return (
    <div className="rp-shell">
      <div className="rp-topbar">
        <div className="rp-topbar__title">Edit Customer</div>
      </div>
      <div className="rp-card" style={{ marginTop: 14 }}>
        <div className="rp-muted">Loading…</div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <CustomerEditClient />
    </Suspense>
  );
}
