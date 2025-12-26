// app/stock-movements/page.tsx
import { Suspense } from "react";
import StockMovementsClient from "./StockMovementsClient";

export const dynamic = "force-dynamic";

export default function StockMovementsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Loading…</div>}>
      <StockMovementsClient />
    </Suspense>
  );
}
