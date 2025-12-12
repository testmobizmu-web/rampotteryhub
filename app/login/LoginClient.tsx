"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Example: /login?next=/admin/users
    const next = searchParams.get("next");
    if (next) {
      // optional: store next somewhere if you want
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Invalid username or password");
      }

      // Save also to localStorage if your sidebar reads it
      if (typeof window !== "undefined") {
        window.localStorage.setItem("rp_user", JSON.stringify(json.session));
      }

      const next = searchParams.get("next") || "/";
      router.push(next);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rp-login-wrap">
      <div className="rp-login-card">
        <h1 className="rp-login-title">RamPotteryHub</h1>
        <p className="rp-login-sub">Secure access • Admin & Staff</p>

        <form onSubmit={handleSubmit} className="rp-login-form">
          <label className="rp-field">
            <span>Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
            />
          </label>

          <label className="rp-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          {error && <div className="rp-login-error">{error}</div>}

          <button className="btn-primary-red" disabled={loading} type="submit">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
