import { Suspense } from "react";
import CreditNoteNewClient from "./CreditNoteNewClient";

export const dynamic = "force-dynamic";

function Loading() {
  return (
    <div className="rp-shell">
      <div className="rp-topbar">
        <div className="rp-topbar__title">New Credit Note</div>
      </div>

      <div className="rp-card" style={{ marginTop: 14 }}>
        <div className="rp-muted">Loading credit note editor…</div>
      </div>
    </div>
  );
}

export default function NewCreditNotePage() {
  return (
    <Suspense fallback={<Loading />}>
      <CreditNoteNewClient />
    </Suspense>
  );
}
