"use client";

export default function LogoutButton() {
  async function handleLogout() {
    try {
      // clear cookie session
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      // clear optional local storage cache
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
      title="Logout"
    >
      Logout
    </button>
  );
}
