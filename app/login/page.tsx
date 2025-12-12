// app/login/page.tsx
"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      // if server somehow didn't send JSON
      setError("Server returned an invalid response.");
      setLoading(false);
      return;
    }

    if (!res.ok || !data.ok) {
      setError(data.error || "Unexpected server error.");
      setLoading(false);
      return;
    }

    // success → go to dashboard
    router.push("/");
  } catch (err) {
    console.error(err);
    setError("Network error while logging in.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="rp-login-page">
      <div className="rp-login-card">
        <div className="rp-login-logo-row">
          <Image
            src="/images/logo/logo.png"
            alt="Ram Pottery Logo"
            width={40}
            height={40}
          />
          <div>
            <div className="rp-login-title">RamPotteryHub</div>
            <div className="rp-login-subtitle">
              Internal access – Ram Pottery Ltd
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rp-login-form">
          <label className="rp-login-label">
            Username
            <input
              className="rp-login-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </label>

          <label className="rp-login-label">
            Password
            <input
              type="password"
              className="rp-login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          {error && <div className="rp-login-error">{error}</div>}

          <button
            type="submit"
            className="rp-login-button"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="rp-login-footer-text">
          Default admin password:{" "}
          <span className="rp-login-highlight">rampottery@123</span>
          <br />
          Cloud-based accounting & stock management for{" "}
          <strong>Ram Pottery Ltd</strong>.
        </div>
      </div>

      <div className="rp-login-bg-accent" />
    </div>
  );
}

