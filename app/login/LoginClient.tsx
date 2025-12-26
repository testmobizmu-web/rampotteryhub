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

  /* =====================
     REMEMBER USERNAME
  ===================== */
  useEffect(() => {
    const saved = localStorage.getItem("rp_remember_username");
    if (saved) setUsername(saved);
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
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Invalid username or password");
      }

      if (remember) {
        localStorage.setItem("rp_remember_username", username);
      } else {
        localStorage.removeItem("rp_remember_username");
      }

      router.replace(nextPath);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rp-login-wrap">
      <div className="rp-login-card">
        {/* LOGO HEADER */}
        <div className="rp-login-top">
          <div className="rp-login-logo-bg">
            <img
              src="/images/logo/logo.png"
              alt="Ram Pottery Ltd"
              width={44}
              height={44}
            />
          </div>

          <h1 className="rp-login-title">RamPotteryHub</h1>
          <p className="rp-login-sub">Secure access • Admin & Staff</p>
        </div>

        <form onSubmit={handleSubmit} className="rp-login-form">
          <label className="rp-field">
            <span>Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </label>

          <label className="rp-field">
            <span>Password</span>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          <div className="rp-login-options">
            <label>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />{" "}
              Show password
            </label>

            <label>
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
              />{" "}
              Remember username
            </label>
          </div>

          {error && <div className="rp-login-error">{error}</div>}

          <button className="btn-primary-red" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
