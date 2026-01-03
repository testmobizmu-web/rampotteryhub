// lib/rpFetch.ts

export type RpFetchOptions = RequestInit & {
  auth?: boolean; // default true: attach x-rp-user
};

function attachAuthHeader(headers: Headers, options: RpFetchOptions) {
  if (options.auth === false) return;

  if (typeof window !== "undefined") {
    const session = window.localStorage.getItem("rp_user");
    if (session) headers.set("x-rp-user", session);
  }
}

function handleAuthRedirect(res: Response) {
  if (typeof window === "undefined") return;

  if (res.status === 401 || res.status === 403) {
    const next = window.location.pathname + window.location.search;
    window.location.href = `/login?next=${encodeURIComponent(next)}`;
  }
}

/**
 * rpFetch = fetch wrapper that injects x-rp-user and handles 401/403 redirect.
 * Returns the native Response (so you can do res.json(), res.text(), etc.)
 */
export async function rpFetch(url: string, options: RpFetchOptions = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});

  // Default JSON header if body exists (and not FormData)
  const bodyIsFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (options.body && !bodyIsFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  attachAuthHeader(headers, options);

  const res = await fetch(url, { ...options, headers });

  // Redirect on auth issues (client-side)
  handleAuthRedirect(res);

  return res;
}

/**
 * Convenience helper: returns parsed JSON and throws on non-OK responses.
 * Useful for API routes returning { ok, ... } JSON.
 */
export async function rpFetchJson<T = any>(url: string, options: RpFetchOptions = {}): Promise<T> {
  const res = await rpFetch(url, options);

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    const msg = json?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  if (json?.ok === false) {
    throw new Error(json?.error || "Request failed");
  }

  return (json ?? {}) as T;
}

