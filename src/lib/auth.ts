// lib/auth.ts
import crypto from "crypto";

const ITER = 120_000;
const KEYLEN = 32;
const DIGEST = "sha256";

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, ITER, KEYLEN, DIGEST).toString("hex");
  return `pbkdf2$${ITER}$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  try {
    const [algo, iterStr, salt, hash] = String(stored).split("$");
    if (algo !== "pbkdf2") return false;

    const iter = Number(iterStr);
    if (!Number.isFinite(iter) || iter < 10_000) return false;

    const test = crypto.pbkdf2Sync(password, salt, iter, KEYLEN, DIGEST).toString("hex");

    const a = Buffer.from(test, "hex");
    const b = Buffer.from(hash, "hex");
    if (a.length !== b.length) return false;

    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

