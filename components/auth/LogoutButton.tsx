"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    if (busy) return;
    setBusy(true);

    try {
      // clear cookie session
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      // clear optional local storage cache + redirect
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("rp_user");
        window.location.href = "/login";
      }
    }
  }

  return (
    <button
      type="button"
      className="rp-btn rp-btn--danger"
      onClick={handleLogout}
      title="Log out"
      disabled={busy}
      aria-busy={busy}
    >
      <span className="rp-dot" aria-hidden="true" />
      {busy ? "Logging out…" : "Log Out"}
    </button>
  );
}
