"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("rp_remember_username");
      if (saved) setUsername(saved);
    } catch {}
  }, []);

  const nextPath = useMemo(() => {
    const rt = searchParams.get("returnTo");
    const nx = searchParams.get("next");
    const candidate = rt || nx || "/";
    if (!candidate.startsWith("/") || candidate.startsWith("//")) return "/";
    return candidate;
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    const u = username.trim();
    if (!u || !password) {
      setError("Username and password are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // clear stale session before trying
      localStorage.removeItem("rp_user");

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || json?.ok !== true) {
        throw new Error(json?.error || "Invalid username or password");
      }

      const sessionObj = json.session;
      if (!sessionObj) throw new Error("Login response missing session");

      // Store session for x-rp-user header usage
      localStorage.setItem("rp_user", JSON.stringify(sessionObj));

      if (remember) {
        localStorage.setItem("rp_remember_username", u);
      } else {
        localStorage.removeItem("rp_remember_username");
      }

      router.replace(nextPath);
    } catch (err: any) {
      // ensure no partial session remains
      try {
        localStorage.removeItem("rp_user");
      } catch {}
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rp-login-wrap">
      <div className="rp-login-card">
        <div className="rp-login-top">
          <div className="rp-login-logo-bg">
            <img src="/images/logo/logo.png" alt="Ram Pottery Ltd" width={44} height={44} />
          </div>

          <h1 className="rp-login-title">RamPotteryHub</h1>
          <p className="rp-login-sub">Secure access • Admin & Staff</p>
        </div>

        <form onSubmit={handleSubmit} className="rp-login-form">
          <label className="rp-login-field">
            <span>Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              inputMode="text"
              placeholder="e.g. sales01"
              disabled={loading}
            />
          </label>

          <label className="rp-login-field">
            <span>Password</span>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={loading}
            />
          </label>

          <div className="rp-login-options">
            <label className="rp-check">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                disabled={loading}
              />
              Show password
            </label>

            <label className="rp-check">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
                disabled={loading}
              />
              Remember username
            </label>
          </div>

          {error && <div className="rp-login-error">{error}</div>}

          <button className="rp-login-btn" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <div className="rp-login-footnote">
            If you forgot your password, contact the system administrator.
          </div>
        </form>
      </div>
    </div>
  );
}
