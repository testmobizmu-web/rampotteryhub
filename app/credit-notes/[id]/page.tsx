import { Suspense } from "react";
import CreditNotePrintClient from "./printClient";

export const dynamic = "force-dynamic";

export default function CreditNotePrintPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading credit note…</div>}>
      <CreditNotePrintClient />
    </Suspense>
  );
}

