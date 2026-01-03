// app/login/page.tsx
import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20, fontWeight: 900 }}>Loading…</div>}>
      <LoginClient />
    </Suspense>
  );
}
