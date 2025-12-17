// app/credit-notes/new/page.tsx
import { Suspense } from "react";
import CreditNoteNewClient from "./CreditNoteNewClient";

export const dynamic = "force-dynamic"; // avoids prerender issues

export default function NewCreditNotePage() {
  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Loading…</div>}>
      <CreditNoteNewClient />
    </Suspense>
  );
}

